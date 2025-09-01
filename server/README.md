# Enhanced AI Documentation Generator Backend

This enhanced backend provides consistent, AI-powered documentation generation from GitHub repositories with data persistence and caching.

## 🚀 Features

### 1. **GitHub Repository Extraction**
- Automatically fetches repository content from GitHub URLs
- Extracts code files, README, and metadata
- Caches extracted data for 24 hours to avoid repeated API calls

### 2. **Consistent AI Output**
- Structured prompts ensure consistent documentation format
- Same repository always produces similar output structure
- Results are saved to JSON files for consistency

### 3. **Data Persistence**
- Extracted repository data saved to `extracted_repos/`
- Generated documentation saved to `generated_docs/`
- Cache system reduces API usage and improves performance

### 4. **Comprehensive Documentation**
Generates 8 types of documentation:
- Development Document (Architecture, modules, data flow)
- User Acceptance Test (UAT) Document
- Code Improvement Tips
- README File
- Test Cases Document
- Business Pitch
- Glossary
- Best Practices Document

## 🔧 Setup

### 1. Install Dependencies
```bash
npm install @octokit/rest
```

### 2. Environment Variables
Create a `.env` file in the server directory with:

```env
# Google Gemini AI API Key
GOOGLE_API_KEY=your_gemini_api_key_here

# GitHub Personal Access Token
GITHUB_TOKEN=your_github_token_here

# Optional: Gemini Model (defaults to gemini-1.5-flash)
GEMINI_MODEL=gemini-1.5-flash

# Optional: Server Port (defaults to 5002)
PORT=5002
```

### 3. Get API Keys

#### Google Gemini AI
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy and paste into `.env` file

#### GitHub Token
1. Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes:
   - `public_repo` (for public repositories)
   - `repo` (for private repositories)
4. Copy and paste into `.env` file

## 🚀 Usage

### Start the Enhanced Backend
```bash
node server/enhanced-backend.js
```

### API Endpoints

#### 1. Generate Documentation
```http
POST /generate-docs
Content-Type: application/json

{
  "githubUrl": "https://github.com/username/repository"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Documentation generated and saved successfully",
  "data": {
    "repoInfo": { ... },
    "generatedAt": "2025-01-09T...",
    "metadata": { ... },
    "documentation": {
      "developmentDoc": "...",
      "uatDoc": "...",
      "tips": "...",
      "readmeDraft": "...",
      "businessPitch": "...",
      "glossary": [...],
      "bestPractices": "...",
      "testCases": "..."
    }
  }
}
```

#### 2. Retrieve Generated Documentation
```http
GET /get-docs/:owner/:repo
```

#### 3. List All Generated Documentation
```http
GET /list-docs
```

#### 4. Health Check
```http
GET /health
```

## 📁 File Structure

```
server/
├── enhanced-backend.js      # Enhanced backend server
├── extracted_repos/         # Cached repository data
│   └── owner_repo.json     # Extracted repository content
├── generated_docs/          # Generated documentation
│   └── owner_repo_docs.json # AI-generated documentation
├── .env                     # Environment variables
└── README.md               # This file
```

## 🔄 How It Works

### 1. **Repository Processing**
```
GitHub URL → Parse URL → Check Cache → Fetch from GitHub API → Save to JSON
```

### 2. **AI Generation**
```
Repository Data → Structured Prompt → Gemini AI → Parse Response → Save to JSON
```

### 3. **Caching System**
- Repository data cached for 24 hours
- Generated documentation saved permanently
- Reduces API calls and ensures consistency

## 💡 Benefits

### **Consistency**
- Same repository always produces similar output
- Structured prompts ensure uniform documentation format
- Results saved to files for reliable retrieval

### **Efficiency**
- Caching reduces GitHub API calls
- No need to regenerate documentation for same repository
- Faster response times for cached data

### **Reliability**
- Data persistence ensures no loss of generated content
- Fallback mechanisms for API failures
- Structured error handling

## 🚨 Troubleshooting

### Common Issues

1. **"GitHub token not available"**
   - Check your `.env` file has `GITHUB_TOKEN`
   - Ensure token has correct permissions

2. **"AI service not available"**
   - Check your `.env` file has `GOOGLE_API_KEY`
   - Verify API key is valid

3. **"Failed to fetch repository content"**
   - Check repository URL is valid
   - Ensure repository is accessible with your token
   - Check GitHub API rate limits

### Rate Limits
- GitHub API: 5,000 requests/hour for authenticated users
- Google Gemini: Varies by plan

## 🔮 Future Enhancements

- Support for multiple AI models
- Advanced caching strategies
- Repository dependency analysis
- Custom documentation templates
- Export to multiple formats (PDF, Word, etc.)

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify your environment variables
3. Check the console logs for detailed error messages
4. Ensure all dependencies are installed
