import React, { useState, useEffect } from 'react';
import { Rocket, FileText, GitBranch, TrendingUp, ClipboardList, BookOpen, ArrowLeft, Download, ListChecks } from 'lucide-react';
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";
import TestCaseGenerator from './components/TestCaseGenerator'; 
import logodevmate from './assets/devmatelogo.png';

// UI Components
const Card = ({ children, className = "", hover = true }) => (
  <div className={`bg-gray-800/70 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6 shadow-xl transition-all duration-300 relative overflow-hidden ${hover ? 'hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-400/30' : ''} ${className}`}>
    {children}
  </div>
);

const Button = ({ children, variant = 'primary', size = 'md', onClick, className = "", disabled = false }) => {
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-400 text-white shadow-lg hover:shadow-blue-500/25',
    success: 'bg-green-500 hover:bg-green-400 text-white shadow-lg hover:shadow-green-500/25',
    warning: 'bg-yellow-500 hover:bg-yellow-400 text-gray-900 shadow-lg hover:shadow-yellow-500/25',
    danger: 'bg-red-500 hover:bg-red-400 text-white shadow-lg hover:shadow-red-500/25',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-100 border border-gray-600 hover:border-blue-400'
  };
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]} ${sizes[size]} ${className}
        font-semibold rounded-lg transition-all duration-200 flex items-center gap-2
        hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed
        disabled:hover:translate-y-0
      `}
    >
      {children}
    </button>
  );
};

function App() {
  const [page, setPage] = useState('home');
  const [githubUrl, setGithubUrl] = useState('');
  const [projectName, setProjectName] = useState('');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [developmentDoc, setDevelopmentDoc] = useState("");
  const [uatDoc, setUatDoc] = useState("");
  const [tips, setTips] = useState("");
  const [warning, setWarning] = useState("");
  const [errorText, setErrorText] = useState("");
  const [glossary, setGlossary] = useState([]);
  const [readmeContent, setReadmeContent] = useState("");
  const [bestPractices, setBestPractices] = useState("");
  const [businessPitch, setBusinessPitch] = useState("");
  const [testCases, setTestCases] = useState("");
  const [isTestCaseGeneratorOpen, setIsTestCaseGeneratorOpen] = useState(false);
  const [userStory, setUserStory] = useState('');

  useEffect(() => {
    if (analysisResults) {
      setTips(analysisResults.tips || "")
      setDevelopmentDoc(analysisResults.developmentDoc || "")
      setUatDoc(analysisResults.uatDoc || "")
      setGlossary(analysisResults.glossary || [])
      setReadmeContent(analysisResults.readmeDraft || "")
      setBestPractices(analysisResults.bestPractices || "")
      setBusinessPitch(analysisResults.businessPitch || "")
      setTestCases(analysisResults.testCases || "")
    }
  }, [analysisResults])


  const analyzeRepository = async () => {
    setLoading(true);
    setErrorText("");
    setWarning("");
    setAnalysisResults(null);
    setReadmeContent("");

    try {
      const response = await fetch("http://localhost:5002/generate-docs", { // Corrected port
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data?.error || "Server error";
        if (data?.code === "AI_UNAVAILABLE") {
          setErrorText("AI service not available. Please check your API key configuration.");
          setWarning("Make sure you have created a .env file with your GOOGLE_API_KEY");
        } else {
          setErrorText(message);
        }
        return;
      }

      setAnalysisResults(data);
      setProjectName(githubUrl.split('/').pop() || 'Project');
      setPage('dashboard');

    } catch (error) {
      console.error("Error analyzing repository:", error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setErrorText("Could not connect to the server. Please make sure the server is running on port 5002.");
        setWarning("Run 'npm run server' in a separate terminal to start the backend");
      } else {
        setErrorText("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }

    // Fetch ReadMe content after analyzing the repository
    try {
      const readmeResponse = await fetch("http://localhost:5002/readme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubUrl }),
      });

      const readmeData = await readmeResponse.json();

      if (!readmeResponse.ok) {
        console.warn("Failed to fetch ReadMe:", readmeData?.error || "Unknown error");
      } else {
        setReadmeContent(readmeData.readme || "");
      }
    } catch (readmeError) {
      console.error("Error fetching ReadMe:", readmeError);
    }
  };

  const generateDocument = (type) => {
    console.log('generateDocument called with type:', type);
    switch (type) {
      case 'development':
        exportDevDocx();
        break;
      case 'uat':
        exportUatDocx();
        break;
      case 'readme':
        exportReadMeDocx();
        break;
      case 'testcase':
        setPage('testcase');
        break;
      default:
        break;
    }
  };

  const getProjectName = () => {
    return projectName || "DevMate"
  }

  // Function to clean up markdown formatting
  const cleanMarkdown = (text) => {
    if (!text) return "";
    return text
      .replace(/\*\*\*\*/g, '') // Remove excessive asterisks
      .replace(/\*\*\*/g, '**') // Reduce triple asterisks to double
      .replace(/\*\*/g, '**') // Ensure consistent double asterisks
      .replace(/\n\*\*/g, '\n**') // Fix line breaks with asterisks
      .replace(/\*\*\n/g, '**\n') // Fix asterisks with line breaks
      .trim();
  }

  // ---------- Markdown export (kept) ----------

  const downloadText = (filename, text) => {
    const blob = new Blob([text || ""], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportAllMarkdown = () => {
    const combined = `# Development Document\n\n${developmentDoc || ""}\n\n---\n\n# UAT Document\n\n${uatDoc || ""}`;
    downloadText("AIDocs_all.md", combined);
  };
  const exportDevMarkdown = () => downloadText("AIDocs_development.md", developmentDoc || "");
  const exportUatMarkdown = () => downloadText("AIDocs_uat.md", uatDoc || "");
  const exportReadMeMarkdown = () => downloadText("AIDocs_readme.md", readmeContent || "");

  // ---------- DOCX export ----------

  const mdToDocxParagraphs = (md) => {
    if (!md) return [new Paragraph("")];
    const lines = md.replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, "")).split(/\r?\n/);
    const paras = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("### ")) {
        paras.push(new Paragraph({ text: trimmed.replace(/^###\s+/, ''), heading: HeadingLevel.HEADING_3 }));
      } else if (trimmed.startsWith("## ")) {
        paras.push(new Paragraph({ text: trimmed.replace(/^##\s+/, ''), heading: HeadingLevel.HEADING_2 }));
      } else if (trimmed.startsWith("# ")) {
        paras.push(new Paragraph({ text: trimmed.replace(/^#\s+/, ''), heading: HeadingLevel.HEADING_1 }));
      } else if (/^-\s+/.test(trimmed)) {
        paras.push(new Paragraph({
          children: [
            new TextRun({
              text: "• " + trimmed.replace(/^-\s+/, '')
            })
          ]
        }));
      } else if (trimmed.length === 0) {
        paras.push(new Paragraph(""));
      } else {
        paras.push(new Paragraph(trimmed));
      }
    }
    return paras;
  };
  const saveBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportDocx = async (title, sections, filename) => {
    const project = getProjectName();
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({ text: title, heading: HeadingLevel.TITLE }),
            new Paragraph({ text: `Project: ${project}`, spacing: { after: 200 } }),
            ...sections,
          ],
        },
      ],
    });
    const blob = await Packer.toBlob(doc);
    saveBlob(blob, filename);
  };

  const exportAllDocx = async () => {
    const parts = [];
    if (developmentDoc) {
      parts.push(new Paragraph({ text: "Development Document", heading: HeadingLevel.HEADING_1 }));
      parts.push(...mdToDocxParagraphs(developmentDoc));
    }
    if (uatDoc) {
      parts.push(new Paragraph({ text: "UAT Document", heading: HeadingLevel.HEADING_1 }));
      parts.push(...mdToDocxParagraphs(uatDoc));
    }
    await exportDocx("AI Documentation", parts, "AIDocs_all.docx");
  };
  const exportDevDocx = async () => exportDocx("Development Document", mdToDocxParagraphs(developmentDoc), "AIDocs_development.docx");
  const exportUatDocx = async () => exportDocx("UAT Document", mdToDocxParagraphs(uatDoc), "AIDocs_uat.docx");
  const exportReadMeDocx = async () => exportDocx("ReadMe Content", mdToDocxParagraphs(readmeContent), "AIDocs_readme.docx");

  // Homepage (UI-1)
  if (page === 'home') {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center px-4">
        <div className="min-h-screen w-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center">
          <Card className="mb-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <img src={logodevmate} alt="devmatelogo" className="w-80 h-40 mb-2"/>
              <h1 className="text-3xl font-bold mb-2">Welcome to DevMate!</h1>
              <div className="mb-4 text-gray-400">Your AI-powered project assistant for modern development teams.</div>
              <input
                type="text"
                placeholder="Enter your GitHub repository URL..."
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 focus:outline-none focus:border-blue-400 mb-4"
              />
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={analyzeRepository}
                disabled={!githubUrl.trim() || loading}
              >
                <GitBranch className="w-5 h-5" /> {loading ? "Analyzing..." : "Analyze Repository"}
              </Button>
              {errorText && (
                <div className="text-red-500 mt-2">{errorText}</div>
              )}
              {warning && (
                <div className="text-yellow-500 mt-2 text-sm bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                  <div className="font-semibold mb-1">⚠️ Setup Required:</div>
                  {warning}
                </div>
              )}
            </div>
          </Card>
          <Card className="text-center">
            <div className="mb-2 text-xl font-semibold text-blue-400">Our Vision</div>
            <div className="mb-4 text-gray-300">Empowering developers to build, document, and test with AI-driven insights.</div>
            <div className="mb-2 text-xl font-semibold text-blue-400">Our Mission</div>
            <div className="text-gray-300">To automate best practices, documentation, and testing for every project.</div>
          </Card>
        </div>
      </div>
    );
  }

{/* Project Dashboard (UI-2) */}
if (page === 'dashboard') {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-7xl mx-auto"> 
        {/* Back Button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" className="rounded-full px-3 py-2" onClick={() => setPage('home')}>
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <Rocket className="w-10 h-10 text-blue-400 ml-2" />
            <h1 className="text-2xl font-bold text-gray-100">{projectName}</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="md" onClick={() => generateDocument('development')}>
              <FileText className="w-4 h-4" /> Development Document
            </Button>
            <Button variant="secondary" size="md" onClick={() => generateDocument('uat')}>
              <BookOpen className="w-4 h-4" /> UAT Document
            </Button>
            <Button variant="secondary" size="md" onClick={() => generateDocument('readme')}>
              <ClipboardList className="w-4 h-4" /> Read Me Content
            </Button>
            <Button variant="secondary" size="md" onClick={() => generateDocument('testcase')}>
              <ClipboardList className="w-4 h-4" /> Generate Test Cases
            </Button>
          </div>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Best Practices & Glossary */}
          <div className="space-y-8">
            {/* Best Practices Section */}
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-100">Best Practices & Code Detector</h3>
              </div>
              <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {cleanMarkdown(bestPractices || analysisResults?.bestPractices || "No best practices data available.")}
                </div>
              </div>
            </Card>
            
            {/* Glossary Section */}
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-100">Glossary</h3>
              </div>
              <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {Array.isArray(glossary) && glossary.length > 0 ? (
                  <div className="space-y-4">
                    {glossary.map((g, i) => (
                      <div key={i} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30">
                        <div className="font-semibold text-blue-400 text-lg mb-2">{g.term}</div>
                        <div className="text-gray-300 leading-relaxed">{g.definition}</div>
                        {g.examples && (
                          <div className="mt-3 pt-3 border-t border-gray-700/30">
                            <div className="text-sm text-gray-400 mb-2">Examples:</div>
                            <div className="text-gray-300 text-sm">{g.examples}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-center py-8">
                    No glossary terms available.
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="secondary" size="sm"><Download className="w-4 h-4" /> Export .docx</Button>
                <Button variant="secondary" size="sm"><Download className="w-4 h-4" /> Export .md</Button>
              </div>
            </Card>
          </div>
          
          {/* Right Side - Business Pitch */}
          <div className="space-y-8">
            <Card className="h-fit">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold text-gray-100">Business Pitch</h3>
              </div>
              <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {cleanMarkdown(businessPitch || analysisResults?.businessPitch || "No business pitch available.")}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// RenderTestCaseGenerator if it's open
  if (page === 'testcase') {
  return (
    <TestCaseGenerator
      repoUrl={githubUrl}          
      projectTitle={projectName} 
      userStory={userStory}
      setUserStory={setUserStory}
      onBack={() => setPage('dashboard')}
    />
  );
}

  // fallback
  return null;
}

export default App;