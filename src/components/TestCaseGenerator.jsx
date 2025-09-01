import React, { useState, useEffect } from 'react';
import { 
  Rocket, FileText, GitBranch, CheckCircle, TrendingUp, Zap, 
  ClipboardList, BookOpen, FilePlus2, ArrowLeft, Download, 
  ListChecks, Sparkles, Code, TestTube, User, Target, 
  AlertCircle, CheckCircle2, Clock, Play, Pause, Square,
  Copy, ExternalLink, Settings, Brain, Lightbulb, Star,
  ChevronRight, ChevronDown, Eye, EyeOff, Info
} from 'lucide-react';
import AIConfig from './AIConfig';
import { generateTestCasesWithAI, analyzeCodeQuality, generateTechnicalDocs } from '../../server/testcase.js';

// UI Components
const Card = ({ children, className = "", hover = true }) => (
  <div className={`flex flex-col w-full flex-1 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, variant = 'primary', size = 'md', onClick, className = "", disabled = false, loading = false }) => {
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-400 text-white shadow-lg hover:shadow-blue-500/25',
    success: 'bg-green-500 hover:bg-green-400 text-white shadow-lg hover:shadow-green-500/25',
    warning: 'bg-yellow-500 hover:bg-yellow-400 text-gray-900 shadow-lg hover:shadow-yellow-500/25',
    danger: 'bg-red-500 hover:bg-red-400 text-white shadow-lg hover:shadow-red-500/25',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-100 border border-gray-600 hover:border-blue-400',
    ai: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-purple-500/25'
  };
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${variants[variant]} ${sizes[size]} ${className}
        font-semibold rounded-lg transition-all duration-200 flex items-center gap-2
        hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed
        disabled:hover:translate-y-0
      `}
    >
      {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
      {children}
    </button>
  );
};

const Badge = ({ children, variant = 'default', className = "" }) => {
  const variants = {
    default: 'bg-gray-700 text-gray-300',
    primary: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    success: 'bg-green-500/20 text-green-300 border border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
    danger: 'bg-red-500/20 text-red-300 border border-red-500/30',
    ai: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30'
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Main Components
const Header = ({ projectName, onBack, onAIConfig, aiStatus }) => (
  <div className="w-full flex justify-between items-center px-6 py-4 border-b border-gray-800">
    {/* Left section: Back + Icon + Project Name */}
    <div className="flex items-center gap-3">
      <Button variant="secondary" size="sm" className="rounded-full px-3 py-2" onClick={onBack}>
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>
      <Rocket className="text-blue-400 w-8 h-8" />
      <h1 className="text-2xl font-bold text-gray-100">{projectName}</h1>
    </div>

    {/* Right section: AI Status + Config + Brain Icon */}
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-gray-400">AI Status:</span>
        <Badge 
          variant={aiStatus === 'active' ? 'success' : aiStatus === 'error' ? 'danger' : 'default'}
        >
          {aiStatus === 'active' ? 'Active' : aiStatus === 'error' ? 'Error' : 'Inactive'}
        </Badge>
      </div>
      <Button variant="secondary" size="sm" onClick={onAIConfig}>
        <Settings className="w-4 h-4" />
        AI Config
      </Button>
      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center font-semibold text-white shadow-lg">
        <Brain className="w-5 h-5" />
      </div>
    </div>
  </div>
);

const UserStoryInput = ({ userStory, setUserStory, onGenerate, aiStatus }) => (
  <Card>
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/50">
      <div className="p-2 bg-purple-500/20 rounded-lg">
        <User className="w-5 h-5 text-purple-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-100">User Story Input</h3>
      {aiStatus === 'active' && (
        <Badge variant="ai" className="ml-auto">
          <Brain className="w-3 h-3 mr-1" />
          AI Powered
        </Badge>
      )}
    </div>
    
    <div className="space-y-4">
      <div>
        <label className="block text-gray-400 mb-2 text-sm font-medium">
          As a <span className="text-purple-400">[User Type]</span>, I want to <span className="text-purple-400">[Action]</span> so that <span className="text-purple-400">[Benefit]</span>
        </label>
        <textarea
          value={userStory}
          onChange={(e) => setUserStory(e.target.value)}
          placeholder="Example: As a registered user, I want to reset my password so that I can regain access to my account if I forget my credentials."
          className="w-full h-32 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 focus:outline-none focus:border-purple-400 resize-none"
        />
      </div>
      
      <div className="flex items-center gap-3">
        <Button 
          variant="ai" 
          size="lg" 
          className="flex-1"
          onClick={onGenerate}
          disabled={!userStory.trim()}
        >
          <Sparkles className="w-5 h-5" />
          {aiStatus === 'active' ? 'Generate with AI' : 'Generate Test Cases'}
        </Button>
        <Button variant="secondary" size="md">
          <FilePlus2 className="w-4 h-4" />
          Save Story
        </Button>
      </div>
      
      {aiStatus !== 'active' && (
        <div className="p-3 bg-gray-700/50 rounded-lg border border-gray-600/50">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-300">
              <div className="font-medium mb-1">AI Not Active</div>
              <div className="text-gray-400">
                Configure your OpenAI API key to enable AI-powered test case generation. 
                Without AI, the system will use intelligent analysis to generate test cases.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </Card>
);

const TestCaseCard = ({ testCase }) => (
  <Card className="mb-6">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          <h4 className="text-xl font-semibold text-gray-100">{testCase.title}</h4>
          <Badge variant={testCase.priority === 'High' ? 'danger' : testCase.priority === 'Medium' ? 'warning' : 'success'}>
            {testCase.priority}
          </Badge>
          <Badge variant="primary">{testCase.type}</Badge>
          {testCase.id?.startsWith('AI_') && (
            <Badge variant="ai">
              <Brain className="w-3 h-3 mr-1" />
              AI Generated
            </Badge>
          )}
        </div>
        <p className="text-gray-300 mb-4 text-lg leading-relaxed">{testCase.description}</p>
      </div>
      <div className="flex gap-2 ml-4">
        <Button variant="secondary" size="sm">
          <Copy className="w-4 h-4" />
        </Button>
        <Button variant="secondary" size="sm">
          <Download className="w-4 h-4" />
        </Button>
      </div>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div>
          <h5 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2 text-lg">
            <Target className="w-5 h-5" />
            Test Steps
          </h5>
          <ol className="space-y-3">
            {testCase.steps.map((step, index) => (
              <li key={index} className="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                <span className="text-blue-400 font-bold text-lg min-w-[30px] bg-blue-500/20 rounded-full w-8 h-8 flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-gray-300 text-base leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <h5 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2 text-lg">
            <CheckCircle2 className="w-5 h-5" />
            Expected Results
          </h5>
          <ul className="space-y-3">
            {testCase.expectedResults.map((result, index) => (
              <li key={index} className="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                <span className="text-green-400 text-xl font-bold">✓</span>
                <span className="text-gray-300 text-base leading-relaxed">{result}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
    
    <div className="mt-6 pt-6 border-t border-gray-700/50">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
          <div className="text-xs text-gray-500 mb-1">Automation</div>
          <div className="text-gray-300 font-medium">{testCase.automation || "Not specified"}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
          <div className="text-xs text-gray-500 mb-1">Time Estimate</div>
          <div className="text-gray-300 font-medium">{testCase.estimatedTime || "Not specified"}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
          <div className="text-xs text-gray-500 mb-1">Test Data</div>
          <div className="text-gray-300 font-medium">{testCase.testData || "Standard data"}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
          <div className="text-xs text-gray-500 mb-1">Prerequisites</div>
          <div className="text-gray-300 font-medium text-sm leading-relaxed">
            {testCase.prerequisites || "None specified"}
          </div>
        </div>
      </div>
    </div>
  </Card>
);

const TestCaseGenerator = ({ userStory, setUserStory, onBack }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTests, setGeneratedTests] = useState([]);
  const [activeTab, setActiveTab] = useState('input');
  const [aiStatus, setAIStatus] = useState('inactive');
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [technicalDocs, setTechnicalDocs] = useState(null);
  const [githubUrl, setGithubUrl] = useState("");


  useEffect(() => {
    // Check if AI is already configured
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setAIStatus('active');
    }
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // First try to use the local testcase service
      const savedApiKey = localStorage.getItem('gemini_api_key');
      if (savedApiKey) {
        // Use the local AI service
        const tests = await generateTestCasesWithAI(userStory);
        if (Array.isArray(tests) && tests.length > 0) {
          // Convert simple test cases to the expected format
          const formattedTests = tests.map((test, index) => ({
            id: `AI_${Date.now()}_${index}`,
            title: `AI Generated Test ${index + 1}`,
            description: test,
            priority: "Medium",
            type: "Functional",
            steps: ["Execute the test scenario", "Verify expected behavior"],
            expectedResults: ["Test should pass successfully"],
            automation: "Automated",
            estimatedTime: "2-5 minutes",
            prerequisites: "System is accessible",
            testData: "Standard test data"
          }));
          setGeneratedTests(formattedTests);
          setActiveTab('results');
          return;
        }
      }

      // Fallback to backend API
      const response = await fetch('http://localhost:5002/generate-test-cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userStory }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate test cases');
      }

      const tests = await response.json();
      setGeneratedTests(tests);
      setActiveTab('results');
    } catch (error) {
      console.error('Failed to generate test cases:', error);
      // Fallback to basic test case
      setGeneratedTests([{
        id: `FALLBACK_${Date.now()}`,
        title: "Basic Functionality Test",
        description: "Test the core functionality described in the user story",
        priority: "Medium",
        type: "Integration",
        steps: [
          "Navigate to the relevant section",
          "Perform the described action",
          "Verify the expected outcome"
        ],
        expectedResults: [
          "Functionality should work as expected",
          "User experience should be smooth"
        ],
        automation: "Manual testing or basic automation",
        estimatedTime: "5 minutes",
        prerequisites: "Application is accessible"
      }]);
      setActiveTab('results');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAIConfig = () => {
    setShowAIConfig(true);
  };

  const handleAIConfigClose = () => {
    setShowAIConfig(false);
  };

  const handleAIStatusChange = (status) => {
    setAIStatus(status);
  };

  const handleCodeAnalysis = async () => {
    try {
      const savedApiKey = localStorage.getItem('gemini_api_key');
      if (savedApiKey) {
        // Use the local AI service
        const analysis = await analyzeCodeQuality("// Sample code for analysis");
        setCodeAnalysis({
          overallScore: 85,
          categories: [
            { name: "Readability", score: 90 },
            { name: "Structure", score: 85 },
            { name: "Performance", score: 80 }
          ],
          recommendations: [analysis]
        });
        return;
      }

      // Fallback to backend API
      const response = await fetch('http://localhost:5002/analyze-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codeSnippet: "// Sample code for analysis" }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze code');
      }

      const analysis = await response.json();
      setCodeAnalysis(analysis);
    } catch (error) {
      console.error('Code analysis failed:', error);
    }
  };

  const handleGenerateDocs = async () => {
    try {
      const savedApiKey = localStorage.getItem('gemini_api_key');
      if (savedApiKey) {
        // Use the local AI service
        const docs = await generateTechnicalDocs({
          name: "AI TestMate",
          description: "AI-powered test case generator",
          technology: "React, Node.js, MongoDB"
        });
        setTechnicalDocs({
          projectOverview: docs,
          architecture: {
            "Frontend": "React-based UI",
            "Backend": "Node.js server",
            "Database": "MongoDB storage"
          },
          apiEndpoints: [
            {
              method: "POST",
              path: "/generate-test-cases",
              description: "Generate test cases from user stories"
            }
          ]
        });
        return;
      }

      // Fallback to backend API
      const response = await fetch('http://localhost:5002/generate-docs-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: "AI TestMate",
          description: "AI-powered test case generator",
          technology: "React, Node.js, MongoDB"
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate documentation');
      }

      const docs = await response.json();
      setTechnicalDocs(docs);
    } catch (error) {
      console.error('Documentation generation failed:', error);
    }
  };

  const tabs = [
    { id: 'input', label: 'User Story Input', icon: User },
    { id: 'results', label: 'Generated Tests', icon: ListChecks },
    { id: 'docs', label: 'Technical Overview', icon: FileText },
    { id: 'frameworks', label: 'Testing Tools', icon: TestTube }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col w-full max-w-full overflow-x-hidden px-4 py-8">
      <div className="w-full">
        <Header 
          onBack={onBack}
          onAIConfig={handleAIConfig}
          aiStatus={aiStatus}
        />
        
        {/* Tab Navigation */}
        <div className="<div className= flex gap-1 bg-gray-800/50 p-1 rounded-xl mb-8 border border-gray-700/50 overflow-x-auto w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap
                  ${activeTab === tab.id 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25' 
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
          <UserStoryInput 
            userStory={userStory} 
            setUserStory={setUserStory} 
            onGenerate={handleGenerate}
            aiStatus={aiStatus}
          />
        )}

        {activeTab === 'results' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-green-400" />
                Generated Test Cases ({generatedTests.length})
              </h3>
              <div className="flex gap-2">
                <Button variant="success" size="sm">
                  <Download className="w-4 h-4" />
                  Export All
                </Button>
                <Button variant="secondary" size="sm">
                  <Copy className="w-4 h-4" />
                  Copy All
                </Button>
              </div>
            </div>
            
            {generatedTests.length > 0 ? (
              generatedTests.map((testCase) => (
                <TestCaseCard key={testCase.id} testCase={testCase} />
              ))
            ) : (
              <Card className="text-center py-12">
                <Lightbulb className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-400 mb-2">No Test Cases Generated Yet</h4>
                <p className="text-gray-500 mb-4">Input a user story and click generate to create comprehensive test cases</p>
                <Button variant="ai" onClick={() => setActiveTab('input')}>
                  <User className="w-4 h-4" />
                  Input User Story
                </Button>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-400" />
                Technical Overview
              </h3>
              <Button variant="primary" onClick={handleGenerateDocs}>
                <FileText className="w-4 h-4" />
                Generate Overview
              </Button>
            </div>
            
            {technicalDocs ? (
              <Card>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-semibold text-gray-300 mb-2">Project Overview</h4>
                    <p className="text-gray-400">{technicalDocs.projectOverview}</p>
                  </div>
                  <div>
                    <h4 className="text-md font-semibold text-gray-300 mb-2">Architecture</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(technicalDocs.architecture || {}).map(([key, value]) => (
                        <div key={key} className="bg-gray-800/50 rounded-lg p-3">
                          <span className="text-blue-400 font-medium text-sm capitalize">{key}:</span>
                          <p className="text-gray-300 text-sm mt-1">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {technicalDocs.apiEndpoints && (
                    <div>
                      <h4 className="text-md font-semibold text-gray-300 mb-2">API Endpoints</h4>
                      <div className="space-y-2">
                        {technicalDocs.apiEndpoints.map((endpoint, index) => (
                          <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="primary">{endpoint.method}</Badge>
                              <span className="font-mono text-sm text-gray-300">{endpoint.path}</span>
                            </div>
                            <p className="text-gray-400 text-sm">{endpoint.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-400 mb-2">Ready for Documentation</h4>
                <p className="text-gray-500 mb-4">Click the generate button to create comprehensive technical documentation</p>
                <Button variant="primary" onClick={handleGenerateDocs}>
                  <FileText className="w-4 h-4" />
                  Generate Documentation
                </Button>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'frameworks' && (
          <div className="space-y-6">
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <TestTube className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold text-gray-100">Testing Frameworks</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    name: "Jest",
                    type: "Unit Testing",
                    description: "JavaScript testing framework with built-in assertion library",
                    bestFor: ["Component testing", "Utility function testing", "Mock testing"]
                  },
                  {
                    name: "Cypress",
                    type: "E2E Testing",
                    description: "Modern web testing framework for end-to-end testing",
                    bestFor: ["User workflow testing", "Cross-browser testing", "Visual testing"]
                  },
                  {
                    name: "Playwright",
                    type: "E2E Testing",
                    description: "Microsoft's testing framework for reliable cross-browser testing",
                    bestFor: ["Multi-browser testing", "Mobile testing", "Performance testing"]
                  },
                  {
                    name: "React Testing Library",
                    type: "Component Testing",
                    description: "Testing utilities for React components",
                    bestFor: ["Component behavior testing", "Accessibility testing", "User interaction testing"]
                  }
                ].map((framework, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-200">{framework.name}</h4>
                      <Badge variant="primary">{framework.type}</Badge>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{framework.description}</p>
                    <div className="space-y-1">
                      <span className="text-xs text-gray-500">Best for:</span>
                      <div className="flex flex-wrap gap-1">
                        {framework.bestFor.map((use, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{use}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3 mb-4">
                <Download className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-100">Export Formats</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    name: "Markdown",
                    extension: ".md",
                    description: "Lightweight markup language for documentation",
                    bestFor: ["GitHub README", "Technical documentation", "Team collaboration"]
                  },
                  {
                    name: "Word Document",
                    extension: ".docx",
                    description: "Microsoft Word format for formal documentation",
                    bestFor: ["Client presentations", "Formal reports", "Business documentation"]
                  },
                  {
                    name: "JSON",
                    extension: ".json",
                    description: "Structured data format for API integration",
                    bestFor: ["API testing", "Data import/export", "Automation scripts"]
                  },
                  {
                    name: "Excel",
                    extension: ".xlsx",
                    description: "Spreadsheet format for data analysis",
                    bestFor: ["Data analysis", "Reporting", "Stakeholder presentations"]
                  }
                ].map((format, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-200">{format.name}</h4>
                      <Badge variant="primary">{format.extension}</Badge>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{format.description}</p>
                    <div className="space-y-1">
                      <span className="text-xs text-gray-500">Best for:</span>
                      <div className="flex flex-wrap gap-1">
                        {format.bestFor.map((use, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{use}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* AI Configuration Modal */}
      <AIConfig
        isOpen={showAIConfig}
        onClose={handleAIConfigClose}
        onAIStatusChange={handleAIStatusChange}
      />
    </div>
  );
};

export default TestCaseGenerator;