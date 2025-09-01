import dotenv from "dotenv"
import express from "express"
import cors from "cors"
import { GoogleGenerativeAI } from "@google/generative-ai"
import fs from "fs/promises"
import path from "path"
import { Octokit } from "@octokit/rest"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: "2mb" }))

// Check if API keys are available
const apiKey = process.env.GOOGLE_API_KEY
const githubToken = process.env.GITHUB_TOKEN
const geminiModel = process.env.GEMINI_MODEL || "gemini-1.5-flash"

if (!apiKey) {
  console.warn("⚠️  GOOGLE_API_KEY not found in environment variables!")
  console.warn("   Create a .env file with your Google API key to enable AI features")
}

if (!githubToken) {
  console.warn("⚠️  GITHUB_TOKEN not found in environment variables!")
  console.warn("   Create a .env file with your GitHub token to enable repository fetching")
}

console.log(`🔧 Using Gemini model: ${geminiModel}`)
console.log(`🔑 Google API Key available: ${apiKey ? 'Yes' : 'No'}`)
console.log(`🔑 GitHub Token available: ${githubToken ? 'Yes' : 'No'}`)

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null
const octokit = githubToken ? new Octokit({ auth: githubToken }) : null

// Function to extract repository info from GitHub URL
function parseGitHubUrl(githubUrl) {
  try {
    const url = new URL(githubUrl.startsWith('http') ? githubUrl : `https://${githubUrl}`)
    if (url.hostname !== 'github.com') {
      throw new Error('Not a GitHub URL')
    }
    
    const pathParts = url.pathname.split('/').filter(Boolean)
    if (pathParts.length < 2) {
      throw new Error('Invalid GitHub repository URL')
    }
    
    return {
      owner: pathParts[0],
      repo: pathParts[1],
      fullName: `${pathParts[0]}/${pathParts[1]}`,
      url: url.href
    }
  } catch (error) {
    throw new Error('Invalid GitHub URL format')
  }
}

// Function to fetch repository content from GitHub API
async function fetchRepositoryContent(repoInfo) {
  if (!octokit) {
    console.warn("GitHub token not available, using fallback data")
    return {
      files: [
        {
          name: "index.js",
          content: "console.log('Hello, welcome to devmate!')"
        },
        {
          name: "App.jsx", 
          content: "function App() { return <h1>This is ur repo.json</h1> }"
        }
      ],
      readme: "Sample README content",
      success: true
    }
  }

  try {
    console.log(`🔍 Fetching repository: ${repoInfo.fullName}`)
    
    // Get repository details
    const { data: repo } = await octokit.repos.get({
      owner: repoInfo.owner,
      repo: repoInfo.repo
    })

    // Get README content
    let readme = "No README found"
    try {
      const { data: readmeData } = await octokit.repos.getReadme({
        owner: repoInfo.owner,
        repo: repoInfo.repo
      })
      readme = Buffer.from(readmeData.content, 'base64').toString('utf-8')
    } catch (error) {
      console.log("README not found, using default")
    }

    // Get repository structure (top-level files and directories)
    const { data: contents } = await octokit.repos.getContent({
      owner: repoInfo.owner,
      repo: repoInfo.repo,
      path: ""
    })

    const files = []
    
    // Process top-level files (limit to avoid overwhelming)
    for (const item of contents.slice(0, 10)) {
      if (item.type === 'file' && item.size < 100000) { // Skip files larger than 100KB
        try {
          const { data: fileData } = await octokit.repos.getContent({
            owner: repoInfo.owner,
            repo: repoInfo.repo,
            path: item.path
          })
          
          if (fileData.content) {
            files.push({
              name: item.name,
              content: Buffer.from(fileData.content, 'base64').toString('utf-8'),
              path: item.path,
              size: item.size
            })
          }
        } catch (error) {
          console.log(`Could not fetch file: ${item.name}`)
        }
      }
    }

    // Save extracted data to JSON file for consistency
    const extractedData = {
      repoInfo,
      files,
      readme,
      extractedAt: new Date().toISOString(),
      metadata: {
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        lastUpdated: repo.updated_at
      }
    }

    // Ensure directory exists
    const extractedDir = path.join(process.cwd(), 'server', 'extracted_repos')
    await fs.mkdir(extractedDir, { recursive: true })

    await fs.writeFile(
      path.join(extractedDir, `${repoInfo.owner}_${repoInfo.repo}.json`),
      JSON.stringify(extractedData, null, 2)
    )

    return {
      files,
      readme,
      success: true,
      metadata: extractedData.metadata
    }
  } catch (error) {
    console.error("Error fetching repository content:", error)
    return {
      files: [],
      readme: "Error fetching repository content",
      success: false,
      error: error.message
    }
  }
}

// Function to load cached repository data if available
async function loadCachedRepositoryData(repoInfo) {
  try {
    const cacheFile = path.join(process.cwd(), 'server', 'extracted_repos', `${repoInfo.owner}_${repoInfo.repo}.json`)
    const cachedData = await fs.readFile(cacheFile, 'utf-8')
    const parsed = JSON.parse(cachedData)
    
    // Check if cache is less than 24 hours old
    const cacheAge = Date.now() - new Date(parsed.extractedAt).getTime()
    if (cacheAge < 24 * 60 * 60 * 1000) { // 24 hours
      console.log(`📁 Using cached data for ${repoInfo.fullName}`)
      return {
        files: parsed.files,
        readme: parsed.readme,
        success: true,
        metadata: parsed.metadata
      }
    }
  } catch (error) {
    // Cache file doesn't exist or is invalid, will fetch fresh data
  }
  return null
}

// Enhanced prompt for consistent output
function buildPrompt(codeText, repoInfo, metadata = {}) {
  const system = `You are a senior software architect helping write high-quality documentation. 
IMPORTANT: Always follow the exact format specified below. Do not deviate from the structure.`

  const user = `Given the following repository code and metadata, produce documentation in this EXACT format:

# DEVELOPMENT DOCUMENT
## Architecture Overview
[Provide a clear, structured overview of the system architecture]

## Key Modules
[List and describe the main modules/components]

## Data Flow
[Explain how data flows through the system]

## Dependencies
[List main dependencies and their purposes]

## Setup Instructions
[Step-by-step setup process]

## Constraints
[Any limitations or constraints]

# USER ACCEPTANCE TEST (UAT) DOCUMENT
## User Scenarios
[Describe key user scenarios]

## Acceptance Criteria
[Define clear acceptance criteria for each scenario]

## Test Steps
[Detailed test steps for each scenario]

## Expected Results
[What should happen for each test]

# CODE IMPROVEMENT TIPS
## Readability
[Specific suggestions for improving code readability]

## Structure
[Suggestions for better code organization]

## Maintainability
[Tips for long-term maintainability]

# README FILE
## Project Overview
[Clear project description]

## Installation Instructions
[Step-by-step installation]

## Usage Examples
[Practical usage examples]

## API Documentation
[API endpoints and usage]

## Contributing Guidelines
[How others can contribute]

# TEST CASES DOCUMENT
## Unit Tests
[Unit testing strategy and examples]

## Integration Tests
[Integration testing approach]

## Edge Cases
[Important edge cases to test]

## Test Data Requirements
[What test data is needed]

## Coverage Goals
[Testing coverage targets]

# BUSINESS PITCH
## Problem Statement
[What problem does this solve]

## Solution
[How it solves the problem]

## Target Users
[Who will use this]

## Market Fit
[Market positioning]

## Unique Value Proposition
[What makes this special]

## Impact/ROI
[Expected benefits]

## Future Opportunities
[Growth potential]

# GLOSSARY
## Technical Terms
[Define technical terms used]

## Domain Vocabulary
[Domain-specific terms]

## Acronyms
[Abbreviations and their meanings]

# BEST PRACTICES DOCUMENT
## Coding Conventions
[Code style guidelines]

## Security Guidelines
[Security best practices]

## Performance Optimization
[Performance tips]

## Deployment Procedures
[How to deploy]

Repository: ${repoInfo.fullName}
URL: ${repoInfo.url}
Language: ${metadata.language || 'Unknown'}
Description: ${metadata.description || 'No description available'}
Stars: ${metadata.stars || 'Unknown'}
Last Updated: ${metadata.lastUpdated || 'Unknown'}

Codebase:
${codeText}

CRITICAL: Follow the exact format above. Use the exact headers and structure. Do not add extra sections or deviate from this format.`

  return `${system}\n\n${user}`
}

// Function to split AI response into structured sections
function splitSections(aiText) {
  const sections = {
    developmentDoc: "",
    uatDoc: "",
    tips: "",
    readmeDraft: "",
    businessPitch: "",
    glossaryText: "",
    bestPractices: "",
    testCases: ""
  }

  const patterns = {
    developmentDoc: /(?:# DEVELOPMENT DOCUMENT|## Architecture Overview|## Key Modules|## Data Flow|## Dependencies|## Setup Instructions|## Constraints)[:\s]*([\s\S]*?)(?=(?:# USER ACCEPTANCE TEST|# UAT DOCUMENT|# CODE IMPROVEMENT TIPS|# README FILE|# TEST CASES DOCUMENT|# BUSINESS PITCH|# GLOSSARY|# BEST PRACTICES DOCUMENT|$))/i,
    uatDoc: /(?:# USER ACCEPTANCE TEST|# UAT DOCUMENT|## User Scenarios|## Acceptance Criteria|## Test Steps|## Expected Results)[:\s]*([\s\S]*?)(?=(?:# DEVELOPMENT DOCUMENT|# CODE IMPROVEMENT TIPS|# README FILE|# TEST CASES DOCUMENT|# BUSINESS PITCH|# GLOSSARY|# BEST PRACTICES DOCUMENT|$))/i,
    tips: /(?:# CODE IMPROVEMENT TIPS|## Readability|## Structure|## Maintainability)[:\s]*([\s\S]*?)(?=(?:# DEVELOPMENT DOCUMENT|# USER ACCEPTANCE TEST|# README FILE|# TEST CASES DOCUMENT|# BUSINESS PITCH|# GLOSSARY|# BEST PRACTICES DOCUMENT|$))/i,
    readmeDraft: /(?:# README FILE|## Project Overview|## Installation Instructions|## Usage Examples|## API Documentation|## Contributing Guidelines)[:\s]*([\s\S]*?)(?=(?:# DEVELOPMENT DOCUMENT|# USER ACCEPTANCE TEST|# CODE IMPROVEMENT TIPS|# TEST CASES DOCUMENT|# BUSINESS PITCH|# GLOSSARY|# BEST PRACTICES DOCUMENT|$))/i,
    testCases: /(?:# TEST CASES DOCUMENT|## Unit Tests|## Integration Tests|## Edge Cases|## Test Data Requirements|## Coverage Goals)[:\s]*([\s\S]*?)(?=(?:# DEVELOPMENT DOCUMENT|# USER ACCEPTANCE TEST|# CODE IMPROVEMENT TIPS|# README FILE|# BUSINESS PITCH|# GLOSSARY|# BEST PRACTICES DOCUMENT|$))/i,
    businessPitch: /(?:# BUSINESS PITCH|## Problem Statement|## Solution|## Target Users|## Market Fit|## Unique Value Proposition|## Impact\/ROI|## Future Opportunities)[:\s]*([\s\S]*?)(?=(?:# DEVELOPMENT DOCUMENT|# USER ACCEPTANCE TEST|# CODE IMPROVEMENT TIPS|# README FILE|# TEST CASES DOCUMENT|# GLOSSARY|# BEST PRACTICES DOCUMENT|$))/i,
    glossaryText: /(?:# GLOSSARY|## Technical Terms|## Domain Vocabulary|## Acronyms)[:\s]*([\s\S]*?)(?=(?:# DEVELOPMENT DOCUMENT|# USER ACCEPTANCE TEST|# CODE IMPROVEMENT TIPS|# README FILE|# TEST CASES DOCUMENT|# BUSINESS PITCH|# BEST PRACTICES DOCUMENT|$))/i,
    bestPractices: /(?:# BEST PRACTICES DOCUMENT|## Coding Conventions|## Security Guidelines|## Performance Optimization|## Deployment Procedures)[:\s]*([\s\S]*?)(?=(?:# DEVELOPMENT DOCUMENT|# USER ACCEPTANCE TEST|# CODE IMPROVEMENT TIPS|# README FILE|# TEST CASES DOCUMENT|# BUSINESS PITCH|# GLOSSARY|$))/i
  }

  for (const [key, pattern] of Object.entries(patterns)) {
    const match = aiText.match(pattern)
    if (match && match[1]) {
      sections[key] = match[1].trim()
    }
  }

  return sections
}

// Function to parse glossary into structured format
function parseGlossary(glossaryText) {
  const glossary = []
  const lines = glossaryText.split("\n").map(l => l.trim()).filter(l => l)

  for (const line of lines) {
    const parts = line.split(":")
    if (parts.length >= 2) {
      glossary.push({
        term: parts[0].trim(),
        definition: parts.slice(1).join(":").trim()
      })
    }
  }

  return glossary
}

// Main endpoint for generating comprehensive documentation
app.post("/generate-docs", async (req, res) => {
  try {
    const { githubUrl } = req.body

    if (!githubUrl) {
      return res.status(400).json({ error: "GitHub URL is required" })
    }

    // Parse GitHub URL
    let repoInfo
    try {
      repoInfo = parseGitHubUrl(githubUrl)
    } catch (error) {
      return res.status(400).json({ error: error.message })
    }

    // Check if AI is available
    if (!genAI) {
      return res.status(503).json({ 
        error: "AI service not available. Please check your GOOGLE_API_KEY in .env file",
        code: "AI_UNAVAILABLE"
      })
    }

    // Try to load cached data first
    let repoContent = await loadCachedRepositoryData(repoInfo)
    
    // If no cache or cache is old, fetch fresh data
    if (!repoContent) {
      repoContent = await fetchRepositoryContent(repoInfo)
    }
    
    if (!repoContent.success) {
      return res.status(500).json({ error: "Failed to fetch repository content" })
    }

    // Concatenate all code
    const concatenated = repoContent.files
      .map(f => `File: ${f.name}\n\n${f.content}`)
      .join("\n\n---\n\n")

    // Call Gemini AI with structured prompt
    const aiModel = genAI.getGenerativeModel({ model: geminiModel })
    const result = await aiModel.generateContent(buildPrompt(concatenated, repoInfo, repoContent.metadata))
    const aiText = result.response.text()

    // Split the response into sections
    const {
      developmentDoc,
      uatDoc,
      tips,
      readmeDraft,
      businessPitch,
      glossaryText,
      bestPractices,
      testCases
    } = splitSections(aiText)

    const glossary = parseGlossary(glossaryText)

    // Save the generated documentation to a JSON file
    const generatedDocs = {
      repoInfo,
      generatedAt: new Date().toISOString(),
      metadata: repoContent.metadata,
      documentation: {
        developmentDoc,
        uatDoc,
        tips,
        readmeDraft,
        businessPitch,
        glossary,
        bestPractices,
        testCases
      }
    }

    // Save to generated_docs directory
    const docsDir = path.join(process.cwd(), 'server', 'generated_docs')
    await fs.mkdir(docsDir, { recursive: true })

    await fs.writeFile(
      path.join(docsDir, `${repoInfo.owner}_${repoInfo.repo}_docs.json`),
      JSON.stringify(generatedDocs, null, 2)
    )

    res.json({
      success: true,
      message: "Documentation generated and saved successfully",
      data: generatedDocs
    })

  } catch (error) {
    console.error("❌ Error in /generate-docs:", error)
    
    if (error.message.includes('API key')) {
      res.status(401).json({ error: "Invalid API key. Please check your GOOGLE_API_KEY" })
    } else if (error.message.includes('quota')) {
      res.status(429).json({ error: "API quota exceeded. Please try again later" })
    } else {
      res.status(500).json({ error: "Failed to generate documentation. Please try again." })
    }
  }
})

// Endpoint to retrieve previously generated documentation
app.get("/get-docs/:owner/:repo", async (req, res) => {
  try {
    const { owner, repo } = req.params
    const docsFile = path.join(process.cwd(), 'server', 'generated_docs', `${owner}_${repo}_docs.json`)
    
    const docsData = await fs.readFile(docsFile, 'utf-8')
    const parsed = JSON.parse(docsData)
    
    res.json({
      success: true,
      data: parsed
    })
  } catch (error) {
    res.status(404).json({ 
      error: "Documentation not found. Please generate it first using /generate-docs endpoint." 
    })
  }
})

// Endpoint to list all generated documentation
app.get("/list-docs", async (req, res) => {
  try {
    const docsDir = path.join(process.cwd(), 'server', 'generated_docs')
    const files = await fs.readdir(docsDir)
    
    const docsList = files
      .filter(file => file.endsWith('_docs.json'))
      .map(file => {
        const [owner, repo] = file.replace('_docs.json', '').split('_')
        return { owner, repo, filename: file }
      })
    
    res.json({
      success: true,
      count: docsList.length,
      documents: docsList
    })
  } catch (error) {
    res.status(500).json({ error: "Failed to list documentation" })
  }
})

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    ai: genAI ? "available" : "unavailable",
    github: octokit ? "available" : "unavailable",
    timestamp: new Date().toISOString()
  })
})

const PORT = process.env.PORT || 5002
app.listen(PORT, () => {
  console.log(`🚀 Enhanced Backend running on port ${PORT}`)
  console.log(`🔑 AI Status: ${genAI ? '✅ Available' : '❌ Unavailable (check .env file)'}`)
  console.log(`🔑 GitHub Status: ${octokit ? '✅ Available' : '❌ Unavailable (check .env file)'}`)
  console.log(`📝 Health check: http://localhost:${PORT}/health`)
  console.log(`📁 Generated docs will be saved to: server/generated_docs/`)
  console.log(`📁 Extracted repos will be saved to: server/extracted_repos/`)
})

export default app
