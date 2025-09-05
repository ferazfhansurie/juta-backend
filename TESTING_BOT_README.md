# 🤖 Automated Testing Bot

An AI-powered testing bot that uses MCP Puppeteer and OpenAI Assistant to analyze web applications and provide detailed bug reports.

## ✨ Features

- **Automated Web Testing**: Uses Puppeteer to test web applications
- **AI-Powered Analysis**: Integrates with OpenAI GPT-4 for intelligent bug analysis
- **Multiple Test Types**: Basic, Functional, and Comprehensive testing modes
- **Real-time Results**: Live updates as tests are running
- **Detailed Reports**: Bug categorization, severity levels, and actionable recommendations
- **Performance Monitoring**: Load time analysis and resource optimization suggestions
- **Priority Bug Detection**: Highlights critical issues that need immediate attention

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd /Users/firaz/Documents/dev/juta/juta_v3-main/database/crud-app
npm install
```

### 2. Configure Environment (Optional)

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key for enhanced AI analysis:
```
OPENAI_API_KEY=your_openai_api_key_here
```

**Note**: The bot works without OpenAI - you'll get basic analysis without the AI features.

### 3. Start the Application

Start both the backend server and frontend:
```bash
npm run dev:full
```

Or start them separately:
```bash
# Terminal 1: Backend server
npm run server

# Terminal 2: Frontend development server
npm run dev
```

### 4. Access the Testing Bot

1. Open your browser to `http://localhost:5174`
2. Navigate to **"Tester Bot"** in the sidebar
3. Enter a URL and start testing!

## 🎯 How to Use

### Test Configuration

1. **Target Page**: Choose from preset pages or enter a custom URL
   - Juta CRM - Chat: `http://localhost:5173/chat`
   - Juta CRM - CRUD List: `http://localhost:5173/crud-data-list`
   - CRUD App - Dashboard: `http://localhost:5174/`
   - Custom URL: Any web page you want to test

2. **Test Depth**: Choose the level of testing
   - **Basic**: UI elements, loading, console errors
   - **Functional**: Basic + user interactions, forms
   - **Comprehensive**: Functional + performance, accessibility

3. **Auto-detect Changes**: (Future feature) Automatically detect when pages change

### Test Results

The bot provides several types of analysis:

#### 🤖 AI Analysis (with OpenAI API key)
- **Executive Summary**: High-level assessment
- **Detailed Analysis**: In-depth technical analysis
- **AI Recommendations**: Prioritized action items
- **Priority Issues**: Critical bugs that need immediate attention

#### 📊 Technical Results
- **Performance Metrics**: Load times, element counts, error counts
- **Bug Categories**: JavaScript errors, broken images, accessibility issues
- **Severity Levels**: Critical, High, Medium, Low

## 🔧 API Endpoints

The backend provides several REST API endpoints:

- `POST /api/test/start` - Start a new test
- `GET /api/test/status/:testId` - Get test status and results
- `POST /api/test/stop/:testId` - Stop a running test
- `GET /api/test/history` - Get test history
- `GET /api/health` - Health check

## 🧪 Test Types Explained

### Basic Tests
- Page load verification
- UI element detection (buttons, inputs, links, images)
- Broken image detection
- Console error monitoring
- Network request failures

### Functional Tests
- All Basic tests +
- Form validation checks
- Interactive element testing
- User workflow simulation

### Comprehensive Tests
- All Functional tests +
- Performance analysis (load times, resource optimization)
- Accessibility compliance (alt text, keyboard navigation)
- SEO basic checks

## 🐛 Common Issues & Solutions

### "Test failed to start"
- Ensure the backend server is running on port 3001
- Check if Puppeteer is properly installed: `npm install puppeteer`

### "Target page not loading"
- Verify the URL is accessible
- Check if the target application is running
- Ensure there are no CORS issues

### "AI Analysis unavailable"
- Add your OpenAI API key to the `.env` file
- Check your OpenAI account has available credits
- Verify the API key has proper permissions

### Puppeteer Installation Issues
- On macOS: Install Xcode command line tools
- On Linux: Install required dependencies
- On Windows: Ensure Visual Studio Build Tools are installed

## 🔍 Understanding Bug Reports

### Severity Levels
- **Critical**: App-breaking issues, security vulnerabilities
- **High**: Major functionality problems, JavaScript errors
- **Medium**: UI/UX issues, performance problems
- **Low**: Minor accessibility issues, optimization suggestions

### Bug Types
- **JavaScript Errors**: Console errors that affect functionality
- **Network Errors**: Failed API requests or resource loading
- **Performance**: Slow load times, large resources
- **Accessibility**: Missing alt text, poor contrast
- **Form Validation**: Missing or improper form validation
- **UI Elements**: Broken images, missing elements

## 🎨 Customization

### Adding New Test Types
Edit `server.js` and modify the `TEST_TYPES` object to add custom test configurations.

### Modifying AI Prompts
Edit `openai-analyzer.js` to customize the AI analysis prompts and logic.

### UI Styling
Modify `TesterBot.css` to customize the appearance of the testing interface.

## 📈 Future Enhancements

- **Multi-page Testing**: Test entire application flows
- **Automated Regression Testing**: Compare results over time
- **Screenshot Capture**: Visual diff testing
- **Integration with CI/CD**: Automated testing pipelines
- **Custom Test Scripts**: User-defined testing scenarios
- **Performance Benchmarking**: Compare against industry standards

## 💡 Tips for Better Testing

1. **Test in Different Environments**: Development, staging, production
2. **Use Different Test Depths**: Start with Basic, then use Comprehensive for detailed analysis
3. **Regular Testing**: Set up periodic tests to catch regressions early
4. **Monitor Performance**: Keep track of load times and optimize accordingly
5. **Fix Critical Issues First**: Always prioritize critical and high-severity bugs

## 🤝 Contributing

To extend the testing bot:
1. Add new test types in `server.js`
2. Enhance AI analysis in `openai-analyzer.js`
3. Improve UI in `TesterBot.jsx` and `TesterBot.css`
4. Submit pull requests with your improvements!

## 📄 License

This testing bot is part of the Juta CRM system. All rights reserved.