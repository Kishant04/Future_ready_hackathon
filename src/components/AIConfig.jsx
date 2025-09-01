import React, { useState, useEffect } from 'react';
import { Settings, Key, Brain, CheckCircle, AlertCircle, Info } from 'lucide-react';
import initializeAI from '../../server/aiservice.js';

const AIConfig = ({ isOpen, onClose, onAIStatusChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [aiStatus, setAIStatus] = useState('inactive');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load saved API key from localStorage
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      checkAIStatus(savedApiKey);
    }
  }, []);

  const checkAIStatus = async (key) => {
    if (!key) {
      setAIStatus('inactive');
      onAIStatusChange('inactive');
      return;
    }

    setIsLoading(true);
    try {
      // Use the aiservice to initialize AI
      const success = initializeAI(key);
      if (success) {
        setAIStatus('active');
        onAIStatusChange('active');
        localStorage.setItem('gemini_api_key', key);
      } else {
        setAIStatus('error');
        onAIStatusChange('error');
      }
    } catch (error) {
      console.error('AI initialization error:', error);
      setAIStatus('error');
      onAIStatusChange('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAPIKey = async () => {
    if (!apiKey.trim()) {
      setAIStatus('inactive');
      onAIStatusChange('inactive');
      localStorage.removeItem('gemini_api_key');
      return;
    }

    await checkAIStatus(apiKey);
  };

  const handleRemoveAPIKey = () => {
    setApiKey('');
    setAIStatus('inactive');
    onAIStatusChange('inactive');
    localStorage.removeItem('gemini_api_key');
  };

  const getStatusInfo = () => {
    switch (aiStatus) {
      case 'active':
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          bgColor: 'bg-green-400/10',
          borderColor: 'border-green-400/30',
          message: 'AI is active and ready to generate test cases'
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-400',
          bgColor: 'bg-red-400/10',
          borderColor: 'border-red-400/30',
          message: 'Failed to initialize AI. Please check your API key.'
        };
      case 'inactive':
      default:
        return {
          icon: Info,
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/10',
          borderColor: 'border-gray-400/30',
          message: 'AI is inactive. Add an API key to enable AI-powered generation.'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            AI Configuration
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key..."
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 focus:outline-none focus:border-blue-400"
              />
              <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
            <div className="flex items-start gap-3">
              <StatusIcon className={`w-5 h-5 ${statusInfo.color} mt-0.5 flex-shrink-0`} />
              <div className="text-sm">
                <div className={`font-medium ${statusInfo.color} mb-1`}>
                  {aiStatus === 'active' ? 'AI Active' : aiStatus === 'error' ? 'AI Error' : 'AI Inactive'}
                </div>
                <div className="text-gray-300">{statusInfo.message}</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSaveAPIKey}
              disabled={isLoading || !apiKey.trim()}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Checking...' : 'Save & Test'}
            </button>
            <button
              onClick={handleRemoveAPIKey}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-lg font-medium transition-colors"
            >
              Remove
            </button>
          </div>

          <div className="text-xs text-gray-400 space-y-2">
            <div className="flex items-start gap-2">
              <Info className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
              <span>Your API key is stored locally and never sent to our servers</span>
            </div>
            <div className="flex items-start gap-2">
              <Brain className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
              <span>AI features require a valid Gemini API key to function</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700/50">
          <div className="text-xs text-gray-500 space-y-2">
            <div className="font-medium text-gray-400 mb-2">How to get your API key:</div>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>• Visit Google AI Studio (makersuite.google.com/app/apikey)</li>
              <li>• Sign in with your Google account</li>
              <li>• Create a new API key</li>
              <li>• Copy and paste the key above</li>
            </ol>
            <div className="mt-3 pt-2 border-t border-gray-700/30">
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
              >
                Get your Gemini API key →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIConfig;
