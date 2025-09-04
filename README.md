# 🔍 TruthLens - AI-Powered Misinformation Detection Extension

<div align="center">

![TruthLens Logo](https://img.shields.io/badge/TruthLens-AI%20Fact%20Checker-blue?style=for-the-badge&logo=shield&logoColor=white)

**An intelligent browser extension that helps users identify misinformation in real-time through AI-powered analysis**

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=flat-square&logo=googlechrome&logoColor=white)](https://chrome.google.com/webstore)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-green?style=flat-square)](https://developer.chrome.com/docs/extensions/mv3/)
[![Built at Hackathon](https://img.shields.io/badge/Built%20at-Hack2Skill%202025-orange?style=flat-square)](https://hack2skill.com)

[🚀 Demo](#-demo) • [📦 Installation](#-installation) • [🔧 Features](#-features) • [🛠️ Development](#-development)

</div>

---

## 📖 Overview

TruthLens is a modern Chrome extension that combats misinformation by providing real-time fact-checking through an intuitive WhatsApp-style chat interface. Users can easily verify the credibility of news articles, social media posts, or any text content with AI-powered analysis.

### 🎯 Problem Statement
- **83% of users** have shared misinformation unknowingly
- **Fake news spreads 6x faster** than real news on social media
- Traditional fact-checking is **slow and reactive**

### 💡 Solution
TruthLens provides **instant, AI-powered credibility analysis** directly in the browser with an intuitive chat interface that makes fact-checking as easy as messaging.

---

## ✨ Features

### 🎨 **Modern UI/UX**
- **WhatsApp-style Chat Interface** - Familiar messaging experience
- **Dark/Light Mode Toggle** - Comfortable viewing in any environment
- **Responsive Design** - Works perfectly on all screen sizes
- **Smooth Animations** - Professional loading states and transitions

### 🤖 **AI-Powered Analysis**
- **Credibility Scoring** - 0-100 score with visual progress bars
- **Status Classification** - ✅ Trustworthy / ⚠️ Suspicious / ❌ Misinformation
- **Detailed Explanations** - AI provides reasoning behind each analysis
- **Source Verification** - Cross-references with reliable fact-checking databases

### 🔄 **Multiple Input Methods**
- **Direct Text Input** - Paste any text or URL into the chat
- **Text Selection** - Select text on any webpage to analyze
- **Right-Click Menu** - Context menu for quick fact-checking
- **Floating Action Button** - Appears when text is selected

### 🛡️ **Privacy & Security**
- **No Personal Data Collection** - Only analyzes the content you choose
- **Local Storage Only** - Preferences saved locally on your device
- **Secure API Calls** - Encrypted communication with backend services

---

## 🚀 Demo

### Quick Start Demo
1. **Install Extension** → Click TruthLens icon in Chrome toolbar
2. **Paste Content** → Add any news text or URL to analyze
3. **Get Results** → Receive instant credibility analysis with explanations
4. **Share Results** → Copy analysis for easy sharing

### Advanced Usage
- **Text Selection**: Highlight text on any webpage → Floating button appears → Click to analyze
- **Context Menu**: Right-click selected text → "Check with TruthLens"
- **Dark Mode**: Toggle between light/dark themes for comfortable usage

---

## 📦 Installation

### 🔧 For Users (Coming Soon)
```bash
# Will be available on Chrome Web Store
# Search for "TruthLens" or visit the direct link
```

### 👩‍💻 For Developers

#### Prerequisites
- Chrome Browser (v88+)
- Node.js (v14+) - for backend integration
- Git

#### Quick Setup
```bash
# 1. Clone the repository
git clone https://github.com/your-username/truthlens-extension.git
cd truthlens-extension

# 2. Load extension in Chrome
# - Open chrome://extensions/
# - Enable "Developer mode"
# - Click "Load unpacked"
# - Select the project folder

# 3. Start using TruthLens!
```

#### File Structure
```
truthlens-extension/
├── 📁 icons/
│   ├── icon16.png          # Extension icon (16x16)
│   ├── icon48.png          # Extension icon (48x48)
│   └── icon128.png         # Extension icon (128x128)
├── 📄 manifest.json        # Extension configuration
├── 🎨 popup.html           # Main chat interface
├── 🔧 content.js           # Text selection & floating button
├── ⚙️ background.js        # Service worker for API calls
├── 🎯 content.css          # Additional styling (optional)
└── 📚 README.md           # This file
```

---

## 🛠️ Development

### 🔌 Backend Integration

### 📊 Expected API Response
```json
{
    "status": "trustworthy|suspicious|misinformation",
    "score": 85,
    "explanation": "Based on analysis of source credibility, fact-checking databases, and content patterns..."
}
```

### 🎨 Customization

#### Change Theme Colors
```javascript
// Modify Tailwind classes in popup.html
'bg-blue-600'     // Primary color
'bg-green-500'    // Success color  
'bg-yellow-500'   // Warning color
'bg-red-500'      // Danger color
```

#### Add New Features
1. **Content Scripts**: Modify `content.js` for webpage interactions
2. **Background Tasks**: Update `background.js` for API handling
3. **UI Components**: Enhance `popup.html` for new interfaces

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Extension loads without errors
- [ ] Chat interface displays correctly
- [ ] Text input and sending works
- [ ] Dark mode toggle functions
- [ ] Text selection triggers floating button
- [ ] Right-click context menu appears
- [ ] API responses display properly
- [ ] Copy functionality works

### Automated Testing
```bash
# Run extension tests (when implemented)
npm test

# Lint code quality
npm run lint
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### 🐛 Bug Reports
1. Check existing issues first
2. Use the bug report template
3. Include browser version and steps to reproduce

### ✨ Feature Requests
1. Describe the feature and use case
2. Check if it aligns with our goals
3. Consider implementation complexity

### 🔄 Pull Requests
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📊 Tech Stack

### Frontend
- ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
- ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
- ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
- ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

### Browser APIs
- ![Chrome Extensions](https://img.shields.io/badge/Chrome_Extensions-4285F4?style=flat-square&logo=googlechrome&logoColor=white)
- Manifest V3
- Content Scripts
- Service Workers
- Storage API

### Backend Integration
- REST APIs
- JSON Communication
- CORS Handling
- Error Management

---

## 🏆 Awards & Recognition

### 🥇 Hack2Skill Vision Hackathon 2025
- **Category**: AI for Social Good
- **Achievement**: Best Browser Extension
- **Recognition**: Innovation in Misinformation Detection

---

## 📈 Roadmap

### Version 1.1 (Q2 2025)
- [ ] **Bulk Analysis** - Check multiple articles at once
- [ ] **History Tracking** - View previously analyzed content
- [ ] **Improved Accuracy** - Enhanced AI models
- [ ] **Firefox Support** - Multi-browser compatibility

### Version 1.2 (Q3 2025)
- [ ] **Social Media Integration** - Direct checking from Twitter, Facebook
- [ ] **Image Verification** - Reverse image search for fake images
- [ ] **Community Voting** - Crowdsourced verification
- [ ] **API Rate Limiting** - Better performance management

### Version 2.0 (Q4 2025)
- [ ] **Video Analysis** - Deepfake detection
- [ ] **Real-time Alerts** - Notifications for trending misinformation
- [ ] **Advanced Analytics** - Personal misinformation exposure reports
- [ ] **Enterprise Features** - Team collaboration tools

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact & Support

### 🌐 Links
- **Website**: [truthlens.ai](https://truthlens.ai)
- **Documentation**: [docs.truthlens.ai](https://docs.truthlens.ai)
- **Support**: [support@truthlens.ai](mailto:support@truthlens.ai)

### 👥 Team
- **Lead Developer**: [Hirak Jyoti Sarma](https://github.com/Hirak505)
- **UI/UX Designer**: [Hirak Jyoti Sarma](https://github.com/Hirak505)
- **AI Engineer**: [AI Engineer Name](https://github.com/aiengineer)

### 🔗 Social Media
[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=flat-square&logo=twitter&logoColor=white)](https://twitter.com/truthlens)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/company/truthlens)
[![Discord](https://img.shields.io/badge/Discord-7289DA?style=flat-square&logo=discord&logoColor=white)](https://discord.gg/truthlens)

---

<div align="center">

### 💡 **Fight Misinformation, One Click at a Time**

**Made with ❤️ at Hack2Skill Vision Hackathon 2025**

[![Star this repo](https://img.shields.io/github/stars/yourusername/truthlens-extension?style=social)](https://github.com/yourusername/truthlens-extension/stargazers)
[![Follow on GitHub](https://img.shields.io/github/followers/yourusername?style=social)](https://github.com/yourusername)

[⬆ Back to Top](#-truthlens---ai-powered-misinformation-detection-extension)

</div>
