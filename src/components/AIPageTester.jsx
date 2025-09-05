import React, { useState, useCallback, useRef } from 'react';
import './AIPageTester.css';

const AIPageTester = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [interactionResults, setInteractionResults] = useState([]);
  const [customScript, setCustomScript] = useState('');
  const abortControllerRef = useRef(null);

  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  const runAIAnalysis = useCallback(async () => {
    if (!url.trim()) {
      showToast('Please enter a URL to analyze', 'error');
      return;
    }

    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/ai-scraper/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const results = await response.json();
      setTestResults(results);
      showToast('AI analysis completed successfully!');
    } catch (error) {
      if (error.name === 'AbortError') {
        showToast('Analysis cancelled', 'info');
      } else {
        console.error('AI analysis failed:', error);
        showToast('Failed to analyze page: ' + error.message, 'error');
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [url]);

  const runInteractiveTest = useCallback(async (interactions) => {
    if (!url.trim()) {
      showToast('Please enter a URL first', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-scraper/interact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, interactions }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const results = await response.json();
      setInteractionResults(results);
      showToast('Interactive test completed!');
    } catch (error) {
      console.error('Interactive test failed:', error);
      showToast('Interactive test failed: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  const runCustomScript = useCallback(async () => {
    if (!url.trim() || !customScript.trim()) {
      showToast('Please enter both URL and custom script', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-scraper/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, script: customScript }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const results = await response.json();
      setInteractionResults([{
        type: 'custom_script',
        selector: 'custom',
        success: true,
        data: results
      }]);
      showToast('Custom script executed successfully!');
    } catch (error) {
      console.error('Custom script failed:', error);
      showToast('Custom script failed: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [url, customScript]);

  const stopAnalysis = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const generateSmartTests = useCallback(() => {
    if (!testResults) {
      showToast('Please run AI analysis first', 'error');
      return;
    }

    const interactions = [];

    // Auto-generate form tests
    testResults.discoveredElements
      .filter(el => el.type === 'form')
      .forEach(form => {
        form.fields.forEach((field) => {
          if (field.type === 'text' || field.type === 'email') {
            interactions.push({
              type: 'type',
              selector: field.selector,
              value: field.type === 'email' ? 'test@example.com' : 'test input',
              description: `Fill ${field.name || field.id} field`
            });
          }
        });
      });

    // Auto-generate button click tests
    testResults.discoveredElements
      .filter(el => el.type === 'interactive' && el.tagName === 'button')
      .slice(0, 3) // Limit to first 3 buttons
      .forEach(button => {
        interactions.push({
          type: 'click',
          selector: button.selector,
          description: `Click ${button.text || 'button'}`
        });
      });

    // Take screenshot
    interactions.push({
      type: 'screenshot',
      selector: 'body',
      fullPage: true,
      description: 'Take full page screenshot'
    });

    runInteractiveTest(interactions);
  }, [testResults, runInteractiveTest]);

  const exportResults = useCallback(() => {
    if (!testResults) {
      showToast('No results to export', 'error');
      return;
    }

    const dataStr = JSON.stringify({
      testResults,
      interactionResults,
      exportedAt: new Date().toISOString()
    }, null, 2);

    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-test-results-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Results exported successfully!');
  }, [testResults, interactionResults]);

  return (
    <div className="ai-page-tester">
      <div className="tester-header">
        <h2>🤖 AI-Powered Page Testing</h2>
        <p>Intelligent web scraping and testing using AI analysis</p>
      </div>

      <div className="tester-grid">
        {/* Configuration Panel */}
        <div className="config-panel">
          <div className="panel-header">
            <h3>Test Configuration</h3>
          </div>
          <div className="panel-content">
            <div className="form-group">
              <label>Target URL</label>
              <input
                type="text"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
                className="form-input"
              />
            </div>

            <div className="button-row">
              <button
                onClick={runAIAnalysis}
                disabled={isLoading || !url.trim()}
                className="btn btn-primary"
              >
                {isLoading ? (
                  <>
                    <div className="spinner"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    🧠 AI Analysis
                  </>
                )}
              </button>

              {isLoading && (
                <button onClick={stopAnalysis} className="btn btn-secondary">
                  ⏹️ Stop
                </button>
              )}
            </div>

            <div className="button-row">
              <button
                onClick={generateSmartTests}
                disabled={isLoading || !testResults}
                className="btn btn-outline-primary"
              >
                ⚡ Smart Tests
              </button>

              <button
                onClick={exportResults}
                disabled={!testResults}
                className="btn btn-outline-secondary"
              >
                📥 Export
              </button>
            </div>

            <div className="form-group">
              <label>Custom JavaScript</label>
              <textarea
                rows={4}
                placeholder="// Enter custom JavaScript to execute&#10;return document.title;"
                value={customScript}
                onChange={(e) => setCustomScript(e.target.value)}
                disabled={isLoading}
                className="form-textarea"
              />
              <button
                onClick={runCustomScript}
                disabled={isLoading || !url.trim() || !customScript.trim()}
                className="btn btn-warning btn-sm mt-2"
              >
                🔧 Execute Script
              </button>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="results-panel">
          <div className="panel-header">
            <h3>Analysis Results</h3>
            {testResults && (
              <span className="results-count">
                {testResults.summary.totalElements} elements discovered
              </span>
            )}
          </div>
          <div className="panel-content">
            {!testResults ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <p>Run AI analysis to see results</p>
              </div>
            ) : (
              <div className="results-content">
                {/* Summary */}
                <div className="summary-card">
                  <h4>Discovery Summary</h4>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <span className="label">Interactive:</span>
                      <span className="value">{testResults.summary.interactiveElements}</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Content:</span>
                      <span className="value">{testResults.summary.contentElements}</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Forms:</span>
                      <span className="value">{testResults.summary.forms}</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Total:</span>
                      <span className="value">{testResults.summary.totalElements}</span>
                    </div>
                  </div>
                </div>

                {/* AI Recommendations */}
                {testResults.aiRecommendations.length > 0 && (
                  <div className="recommendations-section">
                    <h4>AI Recommendations</h4>
                    <div className="recommendations-list">
                      {testResults.aiRecommendations.map((rec, idx) => (
                        <div
                          key={idx}
                          className={`recommendation-item priority-${rec.priority}`}
                        >
                          <div className="rec-header">{rec.type.replace('_', ' ')}</div>
                          <div className="rec-description">{rec.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interaction Results */}
                {interactionResults.length > 0 && (
                  <div className="interactions-section">
                    <h4>Test Results</h4>
                    <div className="interactions-list">
                      {interactionResults.map((result, idx) => (
                        <div
                          key={idx}
                          className={`interaction-item ${result.success ? 'success' : 'error'}`}
                        >
                          <div className="interaction-header">
                            <span>{result.type.replace('_', ' ')}</span>
                            <span className="status-icon">
                              {result.success ? '✅' : '❌'}
                            </span>
                          </div>
                          {result.error && (
                            <div className="error-message">{result.error}</div>
                          )}
                          {result.data && result.type === 'screenshot' && (
                            <div className="screenshot-container">
                              <img
                                src={`data:image/png;base64,${result.data}`}
                                alt="Screenshot"
                                className="screenshot-image"
                              />
                            </div>
                          )}
                          {result.data && result.type === 'custom_script' && (
                            <div className="script-result">
                              <pre>{JSON.stringify(result.data, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPageTester;