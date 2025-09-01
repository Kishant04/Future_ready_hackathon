import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI client
let genAI = null;

// Initialize Gemini AI if API key is available
export const initializeAI = (apiKey) => {
  if (apiKey && apiKey.trim()) {
    try {
      genAI = new GoogleGenerativeAI(apiKey.trim());
      return true;
    } catch (error) {
      console.error('Failed to initialize Gemini AI:', error);
      return false;
    }
  }
  return false;
};

// Intelligent test case generation without AI (fallback)
const generateTestCasesIntelligently = (userStory) => {
  // Implement intelligent test case generation logic here
  return [
    "Test case 1: Verify that the user story is valid",
    "Test case 2: Verify that the user story is complete",
    "Test case 3: Verify that the user story is testable"
  ];
};

// Real AI-powered test case generation
export const generateTestCasesWithAI = async (userStory, options = {}) => {
  if (!genAI) {
    console.warn('Gemini AI is not initialized. Using intelligent fallback.');
    return generateTestCasesIntelligently(userStory);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Generate test cases for the following user story:\n${userStory}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Split the response into individual test cases
    const testCases = text.split('\n').filter(testCase => testCase.trim() !== '');
    return testCases;
  } catch (error) {
    console.error('Error generating test cases with Gemini AI:', error);
    return generateTestCasesIntelligently(userStory);
  }
};

// Code quality analysis service
export const analyzeCodeQuality = async (codeSnippet) => {
  if (!genAI) {
    console.warn('Gemini AI is not initialized. Returning default code quality analysis.');
    return "Code quality analysis is not available.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Analyze the code quality of the following code snippet:\n${codeSnippet}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Error analyzing code quality with Gemini AI:', error);
    return "Code quality analysis is not available.";
  }
};

// Technical documentation generation
export const generateTechnicalDocs = async (projectInfo) => {
  if (!genAI) {
    console.warn('Gemini AI is not initialized. Returning default technical documentation.');
    return "Technical documentation is not available.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Generate technical documentation for the following project:\n${JSON.stringify(projectInfo)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Error generating technical documentation with Gemini AI:', error);
    return "Technical documentation is not available.";
  }
};

// Export the service
export default {
  initializeAI,
  generateTestCasesWithAI,
  analyzeCodeQuality,
  generateTechnicalDocs
};
// Note: This file is intended to be used as a backend service module.