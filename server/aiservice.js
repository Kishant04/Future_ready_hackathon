// Real AI Service for Test Case Generation
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI client (will be null if no API key)
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

export default initializeAI;
