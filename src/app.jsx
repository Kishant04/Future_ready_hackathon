import React, { useState } from 'react';
import { Rocket, FileText, GitBranch, CheckCircle, TrendingUp, Zap, ClipboardList, BookOpen, FilePlus2, ArrowLeft, Download, ListChecks } from 'lucide-react';

// Placeholder data for dashboard and test case generator
const mockProject = {
  name: 'Sample Project',
  bestPractices: 'Follow SOLID principles, use meaningful variable names, write unit tests, and keep functions small.',
  codeDetector: 'No major code smells detected. 2 warnings found in utils.js.',
  glossary: [
    { term: 'Component', definition: 'A reusable piece of UI.' },
    { term: 'Hook', definition: 'A special function to use React features.' }
  ],
  onboarding: '1. Clone the repo. 2. Install dependencies. 3. Run `npm run dev`. 4. Read the README for more info.'
};
const mockTestCases = [
  { module: 'Auth', description: 'Should login with valid credentials', priority: 'High' },
  { module: 'Dashboard', description: 'Should display user data', priority: 'Medium' }
];

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

const StatusCard = ({ icon, value, label, status }) => {
  const statusColors = {
    success: 'border-green-400 bg-green-400/10',
    warning: 'border-yellow-400 bg-yellow-400/10',
    error: 'border-red-400 bg-red-400/10',
    info: 'border-blue-400 bg-blue-400/10'
  };

  const iconColors = {
    success: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
    info: 'text-blue-400'
  };

  return (
    <div className={`
      ${statusColors[status]} border-t-4 bg-gray-800/50 rounded-xl p-4 text-center
      transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer
    `}>
      <div className={`text-2xl mb-2 ${iconColors[status]}`}>{icon}</div>
      <div className="text-xl font-bold text-gray-100 mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
};

// Main Components
const Header = () => (
  <div className="flex justify-between items-center mb-8 px-1">
    <div className="flex items-center gap-3">
      <Rocket className="text-blue-400 w-8 h-8" />
      <h1 className="text-2xl font-bold text-gray-100">DevMate</h1>
    </div>
    <div className="flex items-center gap-4">
      <span className="text-gray-400">Welcome back, Aidu</span>
      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center font-semibold text-white shadow-lg">
        AD
      </div>
    </div>
  </div>
);

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle },
    { id: 'ai-docs', label: 'AI Docs', icon: FileText },
    { id: 'git-assistant', label: 'Git Assistant', icon: GitBranch }
  ];

  return (
    <div className="flex gap-1 bg-gray-800/50 p-1 rounded-xl mb-8 border border-gray-700/50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
              ${activeTab === tab.id 
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
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
  );
};

const ProjectHealth = () => (
  <Card className="mb-8">
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/50">
      <div className="p-2 bg-blue-500/20 rounded-lg">
        <TrendingUp className="w-5 h-5 text-blue-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-100">Project Health</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {mockData.projectHealth.map((item) => (
        <StatusCard key={item.id} {...item} />
      ))}
    </div>
  </Card>
);

const KanbanBoard = () => {
  const columns = [
    { id: 'todo', title: 'To Do', tasks: mockData.tasks.todo, color: 'border-red-400' },
    { id: 'inProgress', title: 'In Progress', tasks: mockData.tasks.inProgress, color: 'border-yellow-400' },
    { id: 'done', title: 'Done', tasks: mockData.tasks.done, color: 'border-green-400' }
  ];

  return (
    <Card>
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/50">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <CheckCircle className="w-5 h-5 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-100">Sprint Board</h3>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-96">
        {columns.map((column) => (
          <div key={column.id} className={`bg-gray-800/30 rounded-xl p-4 border-t-2 ${column.color}`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-200 text-sm uppercase tracking-wide">
                {column.title}
              </h4>
              <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs">
                {column.tasks.length}
              </span>
            </div>
            <div className="space-y-3 min-h-80">
              {/* Empty state - ready for task content */}
              <div className="text-center text-gray-500 text-sm mt-16">
                <div className="mb-4">📋</div>
                <div>Task cards will appear here</div>
                <div className="text-xs mt-2 text-gray-600">
                  Each task will include:
                </div>
                <ul className="text-xs mt-2 space-y-1 text-gray-600">
                  <li>• Task Title & Description</li>
                  <li>• Priority Level (High/Medium/Low)</li>
                  <li>• Completion Percentage (0-100%) - for in progress ONLY</li>
                  <li>• Deadline/Due Date</li>
                  <li>• Assigned Team Members</li>
                  <li>• Comments/Notes</li>
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(2);

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      alert('Pomodoro completed! Take a break! 🎉');
      setTimeLeft(25 * 60);
      setSessions(sessions + 1);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(25 * 60);
  };

  return (
    <Card>
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/50">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Clock className="w-5 h-5 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-100">Focus Timer</h3>
      </div>
      <div className="text-center">
        <div className="text-5xl font-bold text-blue-400 mb-6 font-mono tracking-wider text-shadow-lg">
          {formatTime(timeLeft)}
        </div>
        <div className="flex gap-3 justify-center mb-6">
          <Button variant="success" onClick={handleStart} disabled={isRunning}>
            <Play className="w-4 h-4" />
            Start
          </Button>
          <Button variant="warning" onClick={handlePause} disabled={!isRunning}>
            <Pause className="w-4 h-4" />
            Pause
          </Button>
          <Button variant="danger" onClick={handleReset}>
            <Square className="w-4 h-4" />
            Reset
          </Button>
        </div>
        <div className="text-sm text-gray-400">
          Session {sessions} of 4 today • {'🍅'.repeat(Math.min(sessions, 4))}{'⚪'.repeat(Math.max(0, 4-sessions))}
        </div>
      </div>
    </Card>
  );
};

const RecentActivity = () => (
  <Card>
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/50">
      <div className="p-2 bg-blue-500/20 rounded-lg">
        <Zap className="w-5 h-5 text-blue-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-100">Recent Activity</h3>
    </div>
    <div className="space-y-4">
      {mockData.recentActivity.map((activity) => {
        const icons = {
          docs: '📝',
          commit: '🔀',
          timer: '🍅',
          task: '✅'
        };
        return (
          <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
            <div className="text-lg">{icons[activity.type]}</div>
            <div className="flex-1">
              <div className="text-sm text-gray-200">{activity.action}</div>
              <div className="text-xs text-gray-500">{activity.time}</div>
            </div>
          </div>
        );
      })}
    </div>
  </Card>
);

// Placeholder components for other tabs
const BlankPage = () => (
  <div className="min-h-96">
    {/* Empty - ready for implementation */}
  </div>
);

// Main App Component (Wireframe Navigation)
function App() {
  const [page, setPage] = useState('home');
  const [githubUrl, setGithubUrl] = useState('');
  const [projectName, setProjectName] = useState('');
  const [selectedModule, setSelectedModule] = useState('Auth');
  const [priority, setPriority] = useState('High');

  // Homepage (UI-1)
  if (page === 'home') {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-lg mx-auto">
          <Card className="mb-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <Rocket className="w-14 h-14 text-blue-400 mb-2" />
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
                onClick={() => {
                  setProjectName(githubUrl.split('/').pop() || 'Project');
                  setPage('dashboard');
                }}
                disabled={!githubUrl.trim()}
              >
                <GitBranch className="w-5 h-5" /> Analyze Repository
              </Button>
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

  // Project Dashboard (UI-2)
  if (page === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-6xl mx-auto">
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
              <Button variant="primary" size="md" onClick={() => setPage('test-cases')}>
                <ListChecks className="w-4 h-4" /> Generate Test Cases
              </Button>
              <Button variant="secondary" size="md"><FileText className="w-4 h-4" /> Development Document</Button>
              <Button variant="secondary" size="md"><BookOpen className="w-4 h-4" /> UAT Document</Button>
              <Button variant="secondary" size="md"><ClipboardList className="w-4 h-4" /> Read Me Content</Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Side */}
            <div className="md:col-span-2 flex flex-col gap-8">
              <Card>
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-gray-100">Best Practices & Code Detector</h3>
                </div>
                <div className="text-gray-300 mb-2">{mockProject.bestPractices}</div>
                <div className="text-gray-400 text-sm">{mockProject.codeDetector}</div>
              </Card>
              <Card>
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-gray-100">Glossary</h3>
                </div>
                <ul className="text-gray-300 space-y-2">
                  {mockProject.glossary.map((g, i) => (
                    <li key={i}><span className="font-semibold text-blue-400">{g.term}:</span> {g.definition}</li>
                  ))}
                </ul>
                <div className="flex gap-2 mt-4">
                  <Button variant="secondary" size="sm"><Download className="w-4 h-4" /> Export .docx</Button>
                  <Button variant="secondary" size="sm"><Download className="w-4 h-4" /> Export .md</Button>
                </div>
              </Card>
            </div>
            {/* Right Side */}
            <div className="flex flex-col gap-8">
              <Card className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-gray-100">Onboarding Guide</h3>
                </div>
                <div className="text-gray-300 mb-2 whitespace-pre-line">{mockProject.onboarding}</div>
                <div className="flex gap-2 mt-4">
                  <Button variant="secondary" size="sm"><Download className="w-4 h-4" /> Export .docx</Button>
                  <Button variant="secondary" size="sm"><Download className="w-4 h-4" /> Export .md</Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Test Case Generator (UI-3)
  if (page === 'test-cases') {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <ListChecks className="w-8 h-8 text-blue-400" />
              <h1 className="text-2xl font-bold text-gray-100">Test Case Generator</h1>
            </div>
            <Button variant="secondary" onClick={() => setPage('dashboard')}><ArrowLeft className="w-4 h-4" /> Back</Button>
          </div>
          <Card>
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-gray-400 mb-1">Select Module</label>
                <select
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 focus:outline-none focus:border-blue-400"
                  value={selectedModule}
                  onChange={e => setSelectedModule(e.target.value)}
                >
                  <option>Auth</option>
                  <option>Dashboard</option>
                  <option>API</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-gray-400 mb-1">Priority</label>
                <select
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 focus:outline-none focus:border-blue-400"
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
            </div>
            <div className="space-y-4">
              {mockTestCases.filter(tc => tc.module === selectedModule && tc.priority === priority).length === 0 ? (
                <div className="text-gray-400 text-center py-8">No test cases found for this selection.</div>
              ) : (
                mockTestCases.filter(tc => tc.module === selectedModule && tc.priority === priority).map((tc, i) => (
                  <div key={i} className="bg-gray-800/50 rounded-lg p-4 flex flex-col gap-2 border border-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-blue-400">{tc.module}</span>
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-300">{tc.priority}</span>
                    </div>
                    <div className="text-gray-200">{tc.description}</div>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="secondary" size="sm"><Download className="w-4 h-4" /> Export .docx</Button>
              <Button variant="secondary" size="sm"><Download className="w-4 h-4" /> Export .md</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // fallback
  return null;
}

export default App;