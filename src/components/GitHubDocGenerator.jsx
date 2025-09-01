import React, { useState } from 'react';
import { 
  Github, FileText, Download, Clock, CheckCircle, AlertCircle, 
  Loader2, ExternalLink, BookOpen, Code, TestTube, Lightbulb 
} from 'lucide-react';

const GitHubDocGenerator = () => {
  const [githubUrl, setGithubUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocs, setGeneratedDocs] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('input');

  const handleGenerate = async () => {
    if (!githubUrl.trim()) {
      setError('Please enter a GitHub URL');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedDocs(null);

    try {
      const response = await fetch('http://localhost:5002/generate-docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ githubUrl: githubUrl.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedDocs(data.data);
        setActiveTab('results');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to generate documentation');
      }
    } catch (err) {
      setError('Failed to connect to the backend server. Make sure it\'s running on port 5002.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadDocs = () => {
    if (!generatedDocs) return;
    
    const dataStr = JSON.stringify(generatedDocs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${generatedDocs.repoInfo.owner}_${generatedDocs.repoInfo.repo}_docs.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'input', label: 'GitHub URL Input', icon: Github },
    { id: 'results', label: 'Generated Documentation', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Github className="w-12 h-12 text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Documentation Generator
            </h1>
          </div>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Generate comprehensive documentation from any GitHub repository using AI
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-gray-800/50 p-1 rounded-xl mb-8 border border-gray-700/50 justify-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
                  ${activeTab === tab.id 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25' 
                    : 'text-gray-400 hover:text-gray-100 hover:bg-gray-700/50'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'input' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800/70 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-8 shadow-xl">
              <div className="text-center mb-6">
                <BookOpen className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-100 mb-2">
                  Generate AI Documentation
                </h2>
                <p className="text-gray-400">
                  Enter a GitHub repository URL to generate comprehensive documentation
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">
                    GitHub Repository URL
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username/repository"
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 focus:outline-none focus:border-blue-400"
                    />
                    <Github className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <span className="text-red-300">{error}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !githubUrl.trim()}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Documentation...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Generate Documentation
                    </>
                  )}
                </button>

                <div className="text-center text-sm text-gray-500">
                  <p>This will extract repository content and generate comprehensive documentation using AI</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'results' && generatedDocs && (
          <div className="space-y-6">
            {/* Repository Info */}
            <div className="bg-gray-800/70 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Github className="w-8 h-8 text-blue-400" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-100">
                      {generatedDocs.repoInfo.fullName}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Generated on {new Date(generatedDocs.generatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={downloadDocs}
                  className="px-4 py-2 bg-green-500 hover:bg-green-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download JSON
                </button>
              </div>

              {generatedDocs.metadata && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Language</div>
                    <div className="text-gray-300 font-medium">
                      {generatedDocs.metadata.language || 'Unknown'}
                    </div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Stars</div>
                    <div className="text-gray-300 font-medium">
                      {generatedDocs.metadata.stars || 'Unknown'}
                    </div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Forks</div>
                    <div className="text-gray-300 font-medium">
                      {generatedDocs.metadata.forks || 'Unknown'}
                    </div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Last Updated</div>
                    <div className="text-gray-300 font-medium text-sm">
                      {generatedDocs.metadata.lastUpdated ? 
                        new Date(generatedDocs.metadata.lastUpdated).toLocaleDateString() : 
                        'Unknown'
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Documentation Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(generatedDocs.documentation).map(([key, content]) => {
                if (!content) return null;
                
                const icons = {
                  developmentDoc: Code,
                  uatDoc: TestTube,
                  tips: Lightbulb,
                  readmeDraft: FileText,
                  businessPitch: BookOpen,
                  glossary: BookOpen,
                  bestPractices: CheckCircle,
                  testCases: TestTube
                };
                
                const Icon = icons[key] || FileText;
                const title = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

                return (
                  <div key={key} className="bg-gray-800/70 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <Icon className="w-6 h-6 text-blue-400" />
                      <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
                    </div>
                    <div className="text-gray-300 text-sm leading-relaxed max-h-48 overflow-y-auto">
                      {typeof content === 'string' ? (
                        <div className="whitespace-pre-wrap">{content}</div>
                      ) : Array.isArray(content) ? (
                        <div className="space-y-2">
                          {content.map((item, index) => (
                            <div key={index} className="bg-gray-700/50 rounded p-2">
                              <strong>{item.term || item.name}:</strong> {item.definition || item.description}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div>Content available</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Back to Input */}
            <div className="text-center">
              <button
                onClick={() => setActiveTab('input')}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium transition-colors"
              >
                Generate Another Repository
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHubDocGenerator;
