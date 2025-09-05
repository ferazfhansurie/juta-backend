import React, { useState, useEffect } from 'react';
import { Play, Square, FileText, AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import './TesterBot.css';

const TesterBot = () => {
  const [testConfig, setTestConfig] = useState({
    targetUrl: '',
    pageType: 'single',
    testDepth: 'basic',
    autoDetectChanges: false
  });
  
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState(null);
  const [testHistory, setTestHistory] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);
  
  const pageTypes = {
    'juta-crmv3-chat': 'http://localhost:5173/chat',
    'juta-crmv3-crud': 'http://localhost:5173/crud-data-list',
    'crud-app-dashboard': 'http://localhost:5174/',
    'crud-app-database': 'http://localhost:5174/database',
    'custom': ''
  };

  const testDepthOptions = [
    { value: 'basic', label: 'Basic (UI Elements, Loading)' },
    { value: 'functional', label: 'Functional (User Interactions)' },
    { value: 'comprehensive', label: 'Comprehensive (All Features)' }
  ];

  useEffect(() => {
    // Load test history from localStorage
    const savedHistory = localStorage.getItem('testerBotHistory');
    if (savedHistory) {
      setTestHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveTestHistory = (newTest) => {
    const updatedHistory = [newTest, ...testHistory.slice(0, 19)]; // Keep last 20 tests
    setTestHistory(updatedHistory);
    localStorage.setItem('testerBotHistory', JSON.stringify(updatedHistory));
  };

  const startTest = async () => {
    if (!testConfig.targetUrl) {
      alert('Please enter a target URL');
      return;
    }

    setIsRunning(true);
    setTestResults([]);
    
    const testSession = {
      id: Date.now(),
      url: testConfig.targetUrl,
      type: testConfig.pageType,
      depth: testConfig.testDepth,
      startTime: new Date(),
      status: 'running',
      results: []
    };
    
    setCurrentTest(testSession);

    try {
      // Call backend API to start testing
      const response = await fetch('/api/test/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: testConfig.targetUrl,
          testType: testConfig.testDepth,
          pageType: testConfig.pageType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start test');
      }

      const data = await response.json();
      
      if (data.testId) {
        // Poll for test results
        pollTestResults(data.testId, testSession);
      }
    } catch (error) {
      console.error('Error starting test:', error);
      setIsRunning(false);
      setCurrentTest(null);
      alert('Failed to start test. Please check if the backend server is running.');
    }
  };

  const pollTestResults = async (testId, testSession) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/test/status/${testId}`);
        const data = await response.json();
        
        if (data.status === 'completed') {
          testSession.status = 'completed';
          testSession.endTime = new Date();
          testSession.results = data.results;
          testSession.bugReport = data.bugReport;
          
          setTestResults(data.results);
          setCurrentTest(testSession);
          setIsRunning(false);
          saveTestHistory(testSession);
        } else if (data.status === 'failed') {
          testSession.status = 'failed';
          testSession.error = data.error;
          setCurrentTest(testSession);
          setIsRunning(false);
          saveTestHistory(testSession);
        } else {
          // Still running, continue polling
          setTimeout(poll, 2000);
        }
      } catch (error) {
        console.error('Error polling test results:', error);
        testSession.status = 'failed';
        testSession.error = error.message;
        setCurrentTest(testSession);
        setIsRunning(false);
        saveTestHistory(testSession);
      }
    };
    
    poll();
  };

  const stopTest = async () => {
    if (currentTest) {
      try {
        await fetch(`/api/test/stop/${currentTest.id}`, {
          method: 'POST'
        });
      } catch (error) {
        console.error('Error stopping test:', error);
      }
    }
    setIsRunning(false);
    setCurrentTest(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <Clock className="text-yellow-500" size={16} />;
      case 'completed':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'failed':
        return <AlertTriangle className="text-red-500" size={16} />;
      default:
        return <FileText className="text-gray-500" size={16} />;
    }
  };

  const getBugSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="tester-bot">
      <div className="tester-header">
        <h1>🤖 Testing Bot</h1>
        <p>Automated testing with MCP Puppeteer & OpenAI Analysis</p>
      </div>

      {/* Test Configuration */}
      <div className="test-config">
        <h2>Test Configuration</h2>
        
        <div className="config-grid">
          <div className="config-item">
            <label>Target Page</label>
            <select 
              value={testConfig.pageType}
              onChange={(e) => {
                const pageType = e.target.value;
                setTestConfig(prev => ({
                  ...prev,
                  pageType,
                  targetUrl: pageType === 'custom' ? '' : pageTypes[pageType] || ''
                }));
              }}
            >
              <option value="single">Select a page...</option>
              <option value="juta-crmv3-chat">Juta CRM - Chat</option>
              <option value="juta-crmv3-crud">Juta CRM - CRUD List</option>
              <option value="crud-app-dashboard">CRUD App - Dashboard</option>
              <option value="crud-app-database">CRUD App - Database</option>
              <option value="custom">Custom URL</option>
            </select>
          </div>

          <div className="config-item">
            <label>Target URL</label>
            <input
              type="url"
              value={testConfig.targetUrl}
              onChange={(e) => setTestConfig(prev => ({...prev, targetUrl: e.target.value}))}
              placeholder="Enter URL to test"
              disabled={testConfig.pageType !== 'custom' && testConfig.pageType !== 'single'}
            />
          </div>

          <div className="config-item">
            <label>Test Depth</label>
            <select 
              value={testConfig.testDepth}
              onChange={(e) => setTestConfig(prev => ({...prev, testDepth: e.target.value}))}
            >
              {testDepthOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="config-item">
            <label>
              <input
                type="checkbox"
                checked={testConfig.autoDetectChanges}
                onChange={(e) => setTestConfig(prev => ({...prev, autoDetectChanges: e.target.checked}))}
              />
              Auto-detect page changes (Future feature)
            </label>
          </div>
        </div>

        <div className="test-actions">
          {!isRunning ? (
            <button 
              className="start-test-btn"
              onClick={startTest}
              disabled={!testConfig.targetUrl}
            >
              <Play size={16} />
              Start Test
            </button>
          ) : (
            <button 
              className="stop-test-btn"
              onClick={stopTest}
            >
              <Square size={16} />
              Stop Test
            </button>
          )}
        </div>
      </div>

      {/* Current Test Status */}
      {currentTest && (
        <div className="current-test">
          <h2>
            {getStatusIcon(currentTest.status)}
            Current Test - {currentTest.status.toUpperCase()}
          </h2>
          <div className="test-info">
            <p><strong>URL:</strong> {currentTest.url}</p>
            <p><strong>Type:</strong> {currentTest.depth}</p>
            <p><strong>Started:</strong> {currentTest.startTime.toLocaleTimeString()}</p>
            {currentTest.endTime && (
              <p><strong>Completed:</strong> {currentTest.endTime.toLocaleTimeString()}</p>
            )}
          </div>
          
          {isRunning && (
            <div className="loading-spinner">
              <RefreshCw className="animate-spin" size={20} />
              <span>Running tests... This may take a few minutes</span>
            </div>
          )}
        </div>
      )}

      {/* AI Analysis */}
      {currentTest && currentTest.aiAnalysis && (
        <div className="ai-analysis">
          <h2>🤖 AI Analysis</h2>
          <div className="ai-summary">
            <h3>Executive Summary</h3>
            <p>{currentTest.aiAnalysis.summary}</p>
          </div>
          
          {currentTest.aiAnalysis.analysis && (
            <div className="ai-detailed-analysis">
              <h3>Detailed Analysis</h3>
              <div className="analysis-content">
                {currentTest.aiAnalysis.analysis.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </div>
          )}
          
          {currentTest.aiAnalysis.recommendations && currentTest.aiAnalysis.recommendations.length > 0 && (
            <div className="ai-recommendations">
              <h3>💡 AI Recommendations</h3>
              {currentTest.aiAnalysis.recommendations.map((rec, index) => (
                <div key={index} className={`recommendation ${rec.priority?.toLowerCase()}-priority`}>
                  <div className="rec-header">
                    <span className="rec-type">{rec.type}</span>
                    <span className="rec-priority">{rec.priority}</span>
                  </div>
                  <h4>{rec.issue}</h4>
                  <p className="rec-action"><strong>Action:</strong> {rec.action}</p>
                  <p className="rec-impact"><strong>Impact:</strong> {rec.impact}</p>
                </div>
              ))}
            </div>
          )}
          
          {currentTest.aiAnalysis.priorityBugs && currentTest.aiAnalysis.priorityBugs.length > 0 && (
            <div className="priority-bugs">
              <h3>🚨 Priority Issues</h3>
              {currentTest.aiAnalysis.priorityBugs.map((bug, index) => (
                <div key={index} className={`priority-bug ${getBugSeverityColor(bug.severity)}`}>
                  <div className="bug-header">
                    <span className="bug-severity">{bug.severity?.toUpperCase()}</span>
                    <span className="bug-type">{bug.type}</span>
                  </div>
                  <p className="bug-description">{bug.description}</p>
                  {bug.suggestion && (
                    <p className="bug-suggestion">💡 {bug.suggestion}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="test-results">
          <h2>Test Results</h2>
          
          {testResults.map((result, index) => (
            <div key={index} className="result-item">
              <div className="result-header">
                <h3>{result.testName}</h3>
                <span className={`result-status ${result.status}`}>
                  {result.status.toUpperCase()}
                </span>
              </div>
              
              {result.bugs && result.bugs.length > 0 && (
                <div className="bugs-section">
                  <h4>🐛 Bugs Found:</h4>
                  {result.bugs.map((bug, bugIndex) => (
                    <div 
                      key={bugIndex} 
                      className={`bug-item ${getBugSeverityColor(bug.severity)}`}
                    >
                      <div className="bug-header">
                        <span className="bug-severity">{bug.severity?.toUpperCase()}</span>
                        <span className="bug-type">{bug.type}</span>
                      </div>
                      <p className="bug-description">{bug.description}</p>
                      {bug.element && (
                        <p className="bug-element">Element: {bug.element}</p>
                      )}
                      {bug.suggestion && (
                        <p className="bug-suggestion">💡 {bug.suggestion}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {result.performance && (
                <div className="performance-section">
                  <h4>⚡ Performance:</h4>
                  <div className="performance-metrics">
                    <span>Load Time: {result.performance.loadTime}ms</span>
                    <span>Elements: {result.performance.elementsCount}</span>
                    <span>Console Errors: {result.performance.consoleErrors}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Test History */}
      {testHistory.length > 0 && (
        <div className="test-history">
          <h2>Test History</h2>
          <div className="history-list">
            {testHistory.slice(0, 5).map((test, index) => (
              <div key={test.id} className="history-item">
                <div className="history-header">
                  {getStatusIcon(test.status)}
                  <span className="history-url">{test.url}</span>
                  <span className="history-time">
                    {new Date(test.startTime).toLocaleString()}
                  </span>
                </div>
                {test.results && (
                  <div className="history-summary">
                    <span>Tests: {test.results.length}</span>
                    <span>Bugs: {test.results.reduce((acc, r) => acc + (r.bugs?.length || 0), 0)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TesterBot;