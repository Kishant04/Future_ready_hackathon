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

    await fs.writeFile(
      path.join(process.cwd(), 'server', 'extracted_repos', `${repoInfo.owner}_${repoInfo.repo}.json`),
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
    developmentDoc: /(?:Development Document|Architecture Overview|Key Modules|Data Flow|Dependencies|Setup|Constraints)[:\s]*([\s\S]*?)(?=(?:User Acceptance Test|UAT Document|Code Improvement Tips|README File|Test Cases Document|Business Pitch|Glossary|Best Practices Document|$))/i,
    uatDoc: /(?:User Acceptance Test|UAT Document|User Scenarios|Acceptance Criteria|Test Steps|Expected Results)[:\s]*([\s\S]*?)(?=(?:Development Document|Code Improvement Tips|README File|Test Cases Document|Business Pitch|Glossary|Best Practices Document|$))/i,
    tips: /(?:Code Improvement Tips|Actionable Suggestions|Readability|Structure|Maintainability)[:\s]*([\s\S]*?)(?=(?:Development Document|User Acceptance Test|README File|Test Cases Document|Business Pitch|Glossary|Best Practices Document|$))/i,
    readmeDraft: /(?:README File|Project Overview|Installation Instructions|Usage Examples|API Documentation|Contributing Guidelines)[:\s]*([\s\S]*?)(?=(?:Development Document|User Acceptance Test|Code Improvement Tips|Test Cases Document|Business Pitch|Glossary|Best Practices Document|$))/i,
    testCases: /(?:Test Cases Document|Unit Tests|Integration Tests|Edge Cases|Test Data Requirements|Coverage Goals)[:\s]*([\s\S]*?)(?=(?:Development Document|User Acceptance Test|Code Improvement Tips|README File|Business Pitch|Glossary|Best Practices Document|$))/i,
    businessPitch: /(?:Business Pitch|Problem Statement|Solution|Target Users|Market Fit|Unique Value Proposition|Impact|ROI|Future Opportunities)[:\s]*([\s\S]*?)(?=(?:Development Document|User Acceptance Test|Code Improvement Tips|README File|Test Cases Document|Glossary|Best Practices Document|$))/i,
    glossaryText: /(?:Glossary|Technical Terms|Domain-specific Vocabulary|Acronyms|Definitions)[:\s]*([\s\S]*?)(?=(?:Development Document|User Acceptance Test|Code Improvement Tips|README File|Test Cases Document|Business Pitch|Best Practices Document|$))/i,
    bestPractices: /(?:Best Practices Document|Coding Conventions|Security Guidelines|Performance Optimization|Deployment Procedures)[:\s]*([\s\S]*?)(?=(?:Development Document|User Acceptance Test|Code Improvement Tips|README File|Test Cases Document|Business Pitch|Glossary|$))/i
  }

  for (const [key, pattern] of Object.entries(patterns)) {
    const match = aiText.match(pattern)
    if (match && match[1]) {
      sections[key] = match[1].trim()
    }
  }

  return sections
}

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

    // Load cached data first
    const cachedData = await loadCachedRepositoryData(repoInfo)
    if (cachedData) {
      const { files, readme, metadata } = cachedData
      const concatenated = files
        .map(f => `File: ${f.name}\n\n${f.content}`)
        .join("\n\n---\n\n")

      const aiModel = genAI.getGenerativeModel({ model: geminiModel })
      const result = await aiModel.generateContent(buildPrompt(concatenated, repoInfo, metadata))
      const aiText = result.response.text()

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

      res.json({
        developmentDoc,
        uatDoc,
        tips,
        readmeDraft,
        businessPitch,
        glossary,
        bestPractices,
        testCases,
        repoInfo,
        metadata
      })
    } else {
      // Fetch fresh data and generate docs
      const repoContent = await fetchRepositoryContent(repoInfo)
      
      if (!repoContent.success) {
        return res.status(500).json({ error: "Failed to fetch repository content" })
      }

      const { files, readme, metadata } = repoContent
      const concatenated = files
        .map(f => `File: ${f.name}\n\n${f.content}`)
        .join("\n\n---\n\n")

      const aiModel = genAI.getGenerativeModel({ model: geminiModel })
      const result = await aiModel.generateContent(buildPrompt(concatenated, repoInfo, metadata))
      const aiText = result.response.text()

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

      res.json({
        developmentDoc,
        uatDoc,
        tips,
        readmeDraft,
        businessPitch,
        glossary,
        bestPractices,
        testCases,
        repoInfo,
        metadata
      })
    }

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

app.post("/readme", async (req, res) => {
  try {
    const { githubUrl } = req.body
    
    if (!githubUrl) {
      return res.status(400).json({ error: "GitHub URL is required" })
    }

    // For now, return a sample README
    // In a real implementation, you would fetch the actual README from GitHub
    res.json({
      readme: `# Sample README for ${githubUrl.split('/').pop()}

This is a sample README generated by the AI Documentation Generator.

## Features
- AI-powered documentation generation
- Best practices detection
- Code quality analysis
- Test case generation

## Getting Started
1. Clone the repository
2. Install dependencies
3. Run the application

## Contributing
Please read our contributing guidelines before submitting pull requests.`
    })
  } catch (error) {
    console.error("❌ Error in /readme:", error)
    res.status(500).json({ error: "Failed to fetch README" })
  }
})

// Test case generation endpoint
app.post("/generate-test-cases", async (req, res) => {
  try {
    const { userStory } = req.body
    
    if (!userStory) {
      return res.status(400).json({ error: "User story is required" })
    }

    // Generate test cases using AI if available, otherwise use intelligent fallback
    let testCases = []
    
    if (genAI) {
      try {
        const aiModel = genAI.getGenerativeModel({ model: geminiModel })
        const prompt = `Generate comprehensive test cases for the following user story. 
        Return the response in this exact JSON format:
        {
          "testCases": [
            {
              "id": "TC_001",
              "title": "Test Case Title",
              "description": "Detailed description of what is being tested",
              "priority": "High|Medium|Low",
              "type": "Functional|Integration|UI|API|Performance",
              "steps": ["Step 1", "Step 2", "Step 3"],
              "expectedResults": ["Expected result 1", "Expected result 2"],
              "prerequisites": "What needs to be set up before testing",
              "testData": "Required test data",
              "automation": "Manual|Automated|Semi-automated",
              "estimatedTime": "Estimated time to complete"
            }
          ]
        }

        User Story: ${userStory}

        Ensure the response is valid JSON and includes at least 5 comprehensive test cases.`

        const result = await aiModel.generateContent(prompt)
        const aiText = result.response.text()
        
        // Try to extract JSON from the response
        const jsonMatch = aiText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          testCases = parsed.testCases || []
        } else {
          throw new Error("AI response format invalid")
        }
      } catch (aiError) {
        console.warn("AI generation failed, using fallback:", aiError.message)
        testCases = generateFallbackTestCases(userStory)
      }
    } else {
      testCases = generateFallbackTestCases(userStory)
    }

    res.json(testCases)
  } catch (error) {
    console.error("❌ Error in /generate-test-cases:", error)
    res.status(500).json({ error: "Failed to generate test cases" })
  }
})

// Fallback test case generation function
function generateFallbackTestCases(userStory) {
  const storyWords = userStory.toLowerCase().split(' ')
  const hasUser = storyWords.includes('user') || storyWords.includes('as')
  const hasAction = storyWords.some(word => ['want', 'need', 'can', 'should', 'must'].includes(word))
  const hasBenefit = storyWords.some(word => ['so', 'that', 'because', 'therefore'].includes(word))

  return [
    {
      id: "TC_001",
      title: "Basic Functionality Test",
      description: `Verify that the core functionality described in the user story "${userStory.substring(0, 50)}..." works as expected`,
      priority: "High",
      type: "Functional",
      steps: [
        "Navigate to the relevant application section",
        "Perform the described action from the user story",
        "Verify the expected outcome is achieved"
      ],
      expectedResults: [
        "The functionality should work as described in the user story",
        "User experience should be smooth and intuitive",
        "No errors should occur during the process"
      ],
      prerequisites: "Application is accessible and user is properly authenticated",
      testData: "Standard test data for the application",
      automation: "Manual",
      estimatedTime: "5-10 minutes"
    },
    {
      id: "TC_002",
      title: "Input Validation Test",
      description: "Test various input scenarios to ensure proper validation and error handling",
      priority: "Medium",
      type: "Functional",
      steps: [
        "Enter valid input data",
        "Enter invalid input data",
        "Enter boundary value data",
        "Leave required fields empty"
      ],
      expectedResults: [
        "Valid inputs should be accepted",
        "Invalid inputs should show appropriate error messages",
        "Boundary values should be handled correctly",
        "Required field validation should work"
      ],
      prerequisites: "Access to the input form or interface",
      testData: "Valid, invalid, and boundary test data",
      automation: "Semi-automated",
      estimatedTime: "8-12 minutes"
    },
    {
      id: "TC_003",
      title: "User Experience Test",
      description: "Evaluate the overall user experience and interface usability",
      priority: "Medium",
      type: "UI",
      steps: [
        "Navigate through the user flow",
        "Check for intuitive design elements",
        "Verify responsive behavior on different screen sizes",
        "Test accessibility features"
      ],
      expectedResults: [
        "Interface should be intuitive and easy to use",
        "Design should be consistent with application standards",
        "Should work properly on different devices",
        "Should meet basic accessibility requirements"
      ],
      prerequisites: "Access to different devices and browsers",
      testData: "Various user personas and scenarios",
      automation: "Manual",
      estimatedTime: "10-15 minutes"
    },
    {
      id: "TC_004",
      title: "Integration Test",
      description: "Verify that the feature integrates properly with other system components",
      priority: "High",
      type: "Integration",
      steps: [
        "Test the feature with other related functionalities",
        "Verify data flow between components",
        "Check for any integration conflicts",
        "Test error handling in integration scenarios"
      ],
      expectedResults: [
        "Feature should integrate seamlessly with other components",
        "Data should flow correctly between systems",
        "No conflicts should occur with existing features",
        "Integration errors should be handled gracefully"
      ],
      prerequisites: "All related system components are available",
      testData: "Integration test scenarios and data",
      automation: "Automated",
      estimatedTime: "15-20 minutes"
    },
    {
      id: "TC_005",
      title: "Performance Test",
      description: "Ensure the feature performs adequately under normal and stress conditions",
      priority: "Low",
      type: "Performance",
      steps: [
        "Measure response time under normal load",
        "Test performance under increased load",
        "Verify memory usage patterns",
        "Check for any performance bottlenecks"
      ],
      expectedResults: [
        "Response time should be within acceptable limits",
        "Performance should remain stable under load",
        "Memory usage should be reasonable",
        "No significant performance degradation should occur"
      ],
      prerequisites: "Performance monitoring tools are available",
      testData: "Performance test scenarios and load patterns",
      automation: "Automated",
      estimatedTime: "20-30 minutes"
    }
  ]
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    ai: genAI ? "available" : "unavailable",
    timestamp: new Date().toISOString()
  })
})

const PORT = process.env.PORT || 5002
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`🔑 AI Status: ${genAI ? '✅ Available' : '❌ Unavailable (check .env file)'}`)
  console.log(`📝 Health check: http://localhost:${PORT}/health`)
})
