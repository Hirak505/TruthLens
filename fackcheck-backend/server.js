require("dotenv").config();

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cheerio = require("cheerio");
const axios = require("axios");
const NaturalLanguageUnderstandingV1 = require("ibm-watson/natural-language-understanding/v1");
const { IamAuthenticator } = require("ibm-watson/auth");

class HybridTruthLensAnalyzer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;

    this.misinformationKeywords = [
      "fake news",
      "deep state",
      "cover-up",
      "conspiracy",
      "hoax",
      "they don't want you to know",
      "mainstream media lies",
      "wake up",
      "do your research",
      "leaked documents",
      "insider source",
    ];

    this.credibleSources = [
      "reuters.com",
      "ap.org",
      "bbc.com",
      "npr.org",
      "pbs.org",
      "nature.com",
      "sciencemag.org",
      "nejm.org",
      "who.int",
      "cdc.gov",
      "gov.uk",
      "europa.eu",
      "un.org",
    ];

    // Watson NLU for cloud mode
    this.watsonNLU = new NaturalLanguageUnderstandingV1({
      version: "2022-04-07",
      authenticator: new IamAuthenticator({
        apikey: process.env.WATSON_NLU_API_KEY,
      }),
      serviceUrl: process.env.WATSON_NLU_URL,
    });

    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(
      cors({
        origin: [
          "chrome-extension://*",
          "moz-extension://*",
          "http://localhost:*",
        ],
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );

    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: { error: "Too many requests, please try again later." },
    });
    this.app.use("/api/", limiter);

    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true }));
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }

  setupRoutes() {
    this.app.get("/health", (req, res) => {
      res.json({ status: "healthy", mode: "hybrid" });
    });

    this.app.post("/api/analyze-text", async (req, res) => {
      try {
        const { text, mode = "hybrid" } = req.body;

        if (!text || text.trim().length === 0) {
          return res.status(400).json({ error: "Text is required" });
        }

        let result;

        switch (mode) {
          case "local":
            result = await this.localAnalysis(text);
            break;
          case "cloud":
            result = await this.cloudAnalysis(text);
            break;
          case "hybrid":
          default:
            result = await this.hybridAnalysis(text);
            break;
        }

        res.json(result);
      } catch (error) {
        console.error("Analysis error:", error);
        res.status(500).json({
          error: "Analysis failed",
          details: error.message,
        });
      }
    });

    this.app.post("/api/analyze-batch", async (req, res) => {
      try {
        const { texts, mode = "hybrid" } = req.body;

        if (!Array.isArray(texts) || texts.length === 0) {
          return res.status(400).json({ error: "Texts array is required" });
        }

        const results = await Promise.allSettled(
          texts.map((text) => this.hybridAnalysis(text))
        );

        const processedResults = results.map((result, index) => ({
          index,
          status: result.status,
          data: result.status === "fulfilled" ? result.value : null,
          error: result.status === "rejected" ? result.reason.message : null,
        }));

        res.json({ results: processedResults });
      } catch (error) {
        console.error("Batch analysis error:", error);
        res.status(500).json({ error: "Batch analysis failed" });
      }
    });
  }

  // Helper: Check if input is a URL
  isUrl(text) {
    return /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(text.trim());
  }

  // Helper: Query Google Custom Search API
  async queryCustomSearchAPI(query) {
    const apiKey = process.env.SEARCH_API_KEY;
    const cx = process.env.SEARCH_ENGINE_ID;
    const apiUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
      query
    )}&key=${apiKey}&cx=${cx}&num=5`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Custom Search API error: ${response.statusText}`);
    }
    return await response.json();
  }

  // Helper: Use Gemini 2.5 Flash to analyze search results or content
  async analyzeWithGemini({ searchResults, content, mode }) {
    const apiKey = process.env.GEMINI_API_KEY;
    // Use Gemini 2.5 Flash model
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    let prompt = "";

    if (mode === "local" || mode === "hybrid") {
      prompt = `
You are a fact-checking assistant. Given these web search results, analyze them and provide:
- A verdict: "trustworthy", "suspicious", or "misinformation"
- A short explanation for your verdict
- Key supporting sources (with titles and URLs)

Search Results:
${searchResults.items?.map((item, i) => 
  `${i+1}. Title: ${item.title}\nURL: ${item.link}\nSnippet: ${item.snippet}\n`
).join('\n') || 'No results.'}

Respond in JSON:
{
  "verdict": "...",
  "explanation": "...",
  "sources": [
    {"title": "...", "url": "..."}
  ]
}
`;
    } else if (mode === "cloud") {
      prompt = `
You are a fact-checking assistant. Given this content, analyze it and provide:
- A verdict: "trustworthy", "suspicious", or "misinformation"
- A short explanation for your verdict

Content:
${content}

Respond in JSON:
{
  "verdict": "...",
  "explanation": "..."
}
`;
    }

    const body = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    try {
      const response = await axios.post(apiUrl, body);
      const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      const jsonString = text.slice(jsonStart, jsonEnd + 1);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Gemini API error:', error?.response?.data || error.message);
      if (mode === "cloud") {
        return {
          verdict: "unknown",
          explanation: "Gemini analysis failed."
        };
      }
      return {
        verdict: "unknown",
        explanation: "Gemini analysis failed.",
        sources: []
      };
    }
  }

  // Local Mode: Use search results + Gemini
  async localAnalysis(text) {
    const searchResults = await this.queryCustomSearchAPI(text);
    const geminiResult = await this.analyzeWithGemini({ searchResults, mode: "local" });

    return {
      mode: "local",
      verdict: geminiResult.verdict,
      explanation: geminiResult.explanation,
      sources: geminiResult.sources,
      search: {
        relatedContent: searchResults.items || [],
        totalResults: searchResults.searchInformation?.totalResults || 0,
      },
      summary: `Status determined by Gemini 2.5 Flash from search engine results.`,
      methodology: "Custom Search API + Gemini 2.5 Flash",
    };
  }

  // Cloud Mode: Analyze text or fetch and analyze URL content, then Gemini
  async cloudAnalysis(text) {
    let content = text;
    if (this.isUrl(text)) {
      try {
        const resp = await fetch(text);
        const html = await resp.text();
        const $ = cheerio.load(html);
        content = $("body").text().replace(/\s+/g, " ").trim().slice(0, 5000); // Limit for LLM
      } catch (e) {
        return { mode: "cloud", verdict: "unknown", explanation: "Failed to fetch URL content." };
      }
    }

    const geminiResult = await this.analyzeWithGemini({ content, mode: "cloud" });

    return {
      mode: "cloud",
      verdict: geminiResult.verdict,
      explanation: geminiResult.explanation,
      summary: `Status determined by Gemini 2.5 Flash from content.`,
      methodology: "Gemini 2.5 Flash",
    };
  }

  // Hybrid Mode: Use search results + Gemini
  async hybridAnalysis(text) {
    const searchResults = await this.queryCustomSearchAPI(text);
    const geminiResult = await this.analyzeWithGemini({ searchResults, mode: "hybrid" });

    return {
      mode: "hybrid",
      verdict: geminiResult.verdict,
      explanation: geminiResult.explanation,
      sources: geminiResult.sources,
      search: {
        relatedContent: searchResults.items || [],
        totalResults: searchResults.searchInformation?.totalResults || 0,
      },
      summary: `Status determined by Gemini 2.5 Flash from search engine results.`,
      methodology: "Custom Search API + Gemini 2.5 Flash",
    };
  }
}

const analyzer = new HybridTruthLensAnalyzer();
analyzer.start();

module.exports = HybridTruthLensAnalyzer;