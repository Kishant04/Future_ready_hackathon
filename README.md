# AI Documentation Generator

An AI-powered tool that automatically generates comprehensive documentation for your GitHub repositories, including best practices, code quality analysis, onboarding guides, and test case generation.

## 🚀 Features

- **AI-Powered Documentation**: Uses Google's Gemini AI to analyze codebases
- **Comprehensive Output**: Generates onboarding guides, best practices, glossary, development docs, UAT docs, and README drafts
- **Test Case Generation**: AI-powered test case generation for user stories
- **Multiple Export Formats**: Export documentation as Markdown or DOCX files
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS

## 📋 Prerequisites

- Node.js 18+ 
- Google Generative AI API key
- Git repository URL

## 🛠️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd AIDocsGenerator
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp env.example .env

# Edit .env with your actual API key
GOOGLE_API_KEY=your_actual_google_api_key_here
GEMINI_MODEL=gemini-pro
PORT=5002
```

**Important**: You need a valid Google Generative AI API key. Get one from [Google AI Studio](https://makersuite.google.com/app/apikey).

### 3. Start the Backend Server

```bash
# In one terminal
npm run server
```

The server will start on port 5002. You should see:
```
🚀 Server running on port 5002
🔑 AI Status: ✅ Available
📝 Health check: http://localhost:5002/health
```

### 4. Start the Frontend

```bash
# In another terminal
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🎯 How to Use

### 1. Enter GitHub Repository URL
- Paste your GitHub repository URL (e.g., `https://github.com/username/repo-name`)
- Click "Analyze Repository"

### 2. Review Generated Documentation
The AI will generate:
- **Onboarding Guide**: Setup instructions and workflows
- **Best Practices**: Code quality analysis and improvements
- **Glossary**: Technical terms and definitions
- **Development Documentation**: Technical implementation details
- **UAT Documentation**: Test cases and user flows
- **README Draft**: Comprehensive project documentation

### 3. Export Documentation
- Use the export buttons to download as Markdown (.md) or DOCX (.docx)
- Generate test cases using the Test Case Generator

### 4. Test Case Generation
- Click "Generate Test Cases" button
- Enter your user story
- Get AI-generated test cases with acceptance criteria

## 🔧 Troubleshooting

### Common Issues

#### 1. "AI service not available" Error
**Problem**: Missing or invalid Google API key
**Solution**: 
- Check your `.env` file has `GOOGLE_API_KEY=your_key_here`
- Verify your API key is valid at [Google AI Studio](https://makersuite.google.com/app/apikey)
- Ensure you have sufficient API quota

#### 2. "Could not connect to server" Error
**Problem**: Backend server not running
**Solution**:
- Make sure you're running `npm run server` in a separate terminal
- Check if port 5002 is available
- Verify the server started successfully

#### 3. "Invalid GitHub URL" Error
**Problem**: Incorrect repository URL format
**Solution**:
- Use full GitHub URLs: `https://github.com/username/repo-name`
- Ensure the repository is public or you have access

#### 4. API Quota Exceeded
**Problem**: Reached Google AI API limits
**Solution**:
- Check your API usage at [Google AI Studio](https://makersuite.google.com/app/apikey)
- Wait for quota reset or upgrade your plan

### Server Health Check

Visit `http://localhost:5002/health` to check server status:
```json
{
  "status": "ok",
  "ai": "available",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 📁 Project Structure

```
AIDocsGenerator/
├── src/                    # Frontend React components
│   ├── components/         # Reusable UI components
│   ├── App.jsx            # Main application component
│   └── main.jsx           # Application entry point
├── server/                 # Backend Express server
│   ├── index.js           # Main server file
│   ├── testcase.js        # Test case generation logic
│   └── aiservice.js       # AI service utilities
├── .env                    # Environment variables (create this)
├── env.example            # Example environment file
└── package.json           # Dependencies and scripts
```

## 🚀 Development

### Available Scripts

```bash
npm run dev          # Start frontend development server
npm run server       # Start backend server
npm run build        # Build frontend for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Adding New Features

1. **Backend**: Add new endpoints in `server/index.js`
2. **Frontend**: Create new components in `src/components/`
3. **AI Integration**: Extend prompts in `server/index.js`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify your environment setup
3. Check server logs for detailed error messages
4. Ensure all dependencies are installed correctly

## 🔮 Future Enhancements

- GitHub API integration for real repository fetching
- Support for private repositories
- Multiple AI model support
- Custom documentation templates
- Integration with CI/CD pipelines
- Team collaboration features
