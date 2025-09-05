import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import './Logs.css';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlights, setHighlights] = useState([]);
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(-1);
  const [isConnected, setIsConnected] = useState(false);
  const [isHighVolume, setIsHighVolume] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [logLevelFilter, setLogLevelFilter] = useState('all');
  const [autoScroll, setAutoScroll] = useState(true);
  
  const wsRef = useRef(null);
  const logsRef = useRef(null);
  const isAutoScrollingRef = useRef(true);
  const scrollBufferRef = useRef([]);
  const lastScrollTimeRef = useRef(0);
  
  // WebSocket connection
  const connectWebSocket = useCallback(() => {
    const wsUrl = "wss://juta-dev.ngrok.dev/logs";
    
    console.log("Connecting to logs WebSocket:", wsUrl);
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log("Logs WebSocket connected");
      setIsConnected(true);
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'log') {
        addLogEntry(data.data);
      }
    };

    wsRef.current.onclose = () => {
      console.log("Logs WebSocket disconnected");
      setIsConnected(false);
      // Reconnect after 3 seconds
      setTimeout(connectWebSocket, 3000);
    };

    wsRef.current.onerror = (error) => {
      console.error("Logs WebSocket error:", error);
      setIsConnected(false);
    };
  }, []);

  // Add log entry
  const addLogEntry = useCallback((logData) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString();
    
    const logLevel = getLogLevel(logData.message || logData);
    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp,
      message: logData.message || logData,
      level: logLevel,
      raw: logData,
      date: now.toLocaleDateString()
    };

    setLogs(prevLogs => {
      const newLogs = [...prevLogs, logEntry];
      // Keep only last 2000 logs to prevent memory issues
      return newLogs.slice(-2000);
    });

    // Check for high volume (more than 10 logs per second)
    const now_time = Date.now();
    if (now_time - lastScrollTimeRef.current < 100) {
      setIsHighVolume(true);
      setTimeout(() => setIsHighVolume(false), 5000);
    }
    lastScrollTimeRef.current = now_time;

    // Auto-scroll to bottom if user hasn't scrolled up and auto-scroll is enabled
    if (isAutoScrollingRef.current && logsRef.current && autoScroll) {
      setTimeout(() => {
        if (logsRef.current) {
          logsRef.current.scrollTop = logsRef.current.scrollHeight;
        }
      }, 10);
    }

    // Set loading to false once we receive first log
    if (isLoading) {
      setIsLoading(false);
    }
  }, [isLoading, autoScroll]);

  // Determine log level from message content
  const getLogLevel = (message) => {
    const msgLower = message.toLowerCase();
    if (msgLower.includes('error') || msgLower.includes('failed') || msgLower.includes('exception')) {
      return 'error';
    } else if (msgLower.includes('warn') || msgLower.includes('warning')) {
      return 'warn';
    } else if (msgLower.includes('info') || msgLower.includes('success') || msgLower.includes('completed')) {
      return 'info';
    }
    return 'default';
  };

  // Filter logs by level and search term
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesLevel = logLevelFilter === 'all' || log.level === logLevelFilter;
      const matchesSearch = !searchTerm.trim() || 
        log.message.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesLevel && matchesSearch;
    });
  }, [logs, logLevelFilter, searchTerm]);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (logsRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = logsRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;
      isAutoScrollingRef.current = isAtBottom;
      setAutoScroll(isAtBottom);
    }
  }, []);

  // Clear logs function
  const clearLogs = useCallback(() => {
    setLogs([]);
    setHighlights([]);
    setCurrentHighlightIndex(-1);
    setMatchCount(0);
  }, []);

  // Toggle auto-scroll
  const toggleAutoScroll = useCallback(() => {
    setAutoScroll(prev => !prev);
    if (!autoScroll && logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [autoScroll]);

  // Search functionality
  const performSearch = useCallback((term) => {
    if (!term.trim()) {
      setHighlights([]);
      setCurrentHighlightIndex(-1);
      setMatchCount(0);
      return;
    }

    const foundHighlights = [];
    filteredLogs.forEach((log, logIndex) => {
      const message = log.message.toLowerCase();
      const searchTerm = term.toLowerCase();
      let startIndex = 0;
      
      while (true) {
        const index = message.indexOf(searchTerm, startIndex);
        if (index === -1) break;
        
        foundHighlights.push({
          logIndex,
          start: index,
          end: index + searchTerm.length,
          id: `${logIndex}-${index}`
        });
        
        startIndex = index + 1;
      }
    });

    setHighlights(foundHighlights);
    setMatchCount(foundHighlights.length);
    
    if (foundHighlights.length > 0) {
      setCurrentHighlightIndex(0);
      scrollToHighlight(0, foundHighlights);
    }
  }, [filteredLogs]);

  // Navigate highlights
  const navigateHighlight = useCallback((direction) => {
    if (highlights.length === 0) return;

    let newIndex;
    if (direction === 'next') {
      newIndex = currentHighlightIndex >= highlights.length - 1 ? 0 : currentHighlightIndex + 1;
    } else {
      newIndex = currentHighlightIndex <= 0 ? highlights.length - 1 : currentHighlightIndex - 1;
    }

    setCurrentHighlightIndex(newIndex);
    scrollToHighlight(newIndex, highlights);
  }, [highlights, currentHighlightIndex]);

  // Scroll to specific highlight
  const scrollToHighlight = useCallback((index, highlightsList) => {
    if (!logsRef.current || !highlightsList[index]) return;

    const highlight = highlightsList[index];
    const logElements = logsRef.current.children;
    const targetLog = logElements[highlight.logIndex];
    
    if (targetLog) {
      targetLog.scrollIntoView({ behavior: 'smooth', block: 'center' });
      isAutoScrollingRef.current = false;
    }
  }, []);

  // Highlight text in log messages
  const highlightText = (text, logIndex) => {
    if (!searchTerm.trim() || highlights.length === 0) {
      return text;
    }

    const logHighlights = highlights.filter(h => h.logIndex === logIndex);
    if (logHighlights.length === 0) {
      return text;
    }

    let result = [];
    let lastIndex = 0;

    logHighlights.forEach((highlight, i) => {
      // Add text before highlight
      if (highlight.start > lastIndex) {
        result.push(text.substring(lastIndex, highlight.start));
      }

      // Add highlighted text
      const isActive = highlights.indexOf(highlight) === currentHighlightIndex;
      const highlightClass = `highlight ${isActive ? 'active' : ''}`;
      
      result.push(
        <span key={`highlight-${i}`} className={highlightClass}>
          {text.substring(highlight.start, highlight.end)}
        </span>
      );

      lastIndex = highlight.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      result.push(text.substring(lastIndex));
    }

    return result;
  };

  // Initialize WebSocket connection
  useEffect(() => {
    connectWebSocket();
    // Set loading to false after 5 seconds if no logs received
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
      }
    }, 5000);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      clearTimeout(loadingTimeout);
    };
  }, [connectWebSocket, isLoading]);

  // Handle search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, performSearch]);

  // Add scroll event listener
  useEffect(() => {
    const logsElement = logsRef.current;
    if (logsElement) {
      logsElement.addEventListener('scroll', handleScroll);
      return () => logsElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'f':
            e.preventDefault();
            // Focus search input
            const searchInput = document.querySelector('.logs-search input');
            if (searchInput) searchInput.focus();
            break;
          case 'g':
            e.preventDefault();
            if (e.shiftKey) {
              navigateHighlight('prev');
            } else {
              navigateHighlight('next');
            }
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigateHighlight]);

  return (
    <div className="logs-container">
      <div className="logs-inner-container">
        <div className="header">
          <div className="header-left">
            <h1>System Logs Monitor</h1>
            <div className="log-stats">
              <span className="stat-item">
                <span className="stat-value">{logs.length}</span>
                <span className="stat-label">total</span>
              </span>
              <span className="stat-item">
                <span className="stat-value">{filteredLogs.length}</span>
                <span className="stat-label">filtered</span>
              </span>
            </div>
          </div>
          <div className="header-right">
            <div className={`status-indicator ${isConnected ? 'status-connected' : 'status-disconnected'}`}>
              {isConnected ? '●' : '●'}
            </div>
            <button
              className="action-btn compact"
              onClick={toggleAutoScroll}
              title={autoScroll ? 'Disable auto-scroll' : 'Enable auto-scroll'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19l0-14m-7 7l7-7 7 7"/>
              </svg>
            </button>
            <button
              className="action-btn compact clear-btn"
              onClick={clearLogs}
              title="Clear all logs"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              </svg>
            </button>
            <button
              className="status-btn compact"
              onClick={() => window.location.href = '/status'}
              title="Bot Status"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </button>
          </div>
        </div>

        <div className={`logs-display-container ${isHighVolume ? 'high-volume' : ''}`}>
          <div className="logs-controls">
            <div className="logs-search">
              <div className="search-input-container">
                <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search logs... (Ctrl+F)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    className="clear-search"
                    onClick={() => setSearchTerm('')}
                    title="Clear search"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
              </div>
              <div className="search-navigation">
                <button 
                  className="nav-btn"
                  onClick={() => navigateHighlight('prev')}
                  disabled={highlights.length === 0}
                  title="Previous match (Ctrl+Shift+G)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15,18 9,12 15,6"></polyline>
                  </svg>
                </button>
                <button 
                  className="nav-btn"
                  onClick={() => navigateHighlight('next')}
                  disabled={highlights.length === 0}
                  title="Next match (Ctrl+G)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </button>
              </div>
              <div className="match-count">
                {matchCount > 0 
                  ? `${currentHighlightIndex + 1} of ${matchCount}` 
                  : searchTerm ? 'No matches' : `${filteredLogs.length} logs`
                }
              </div>
            </div>
            <div className="log-filters">
              <select 
                value={logLevelFilter} 
                onChange={(e) => setLogLevelFilter(e.target.value)}
                className="level-filter"
                title="Filter by log level"
              >
                <option value="all">All Levels</option>
                <option value="error">Errors</option>
                <option value="warn">Warnings</option>
                <option value="info">Info</option>
                <option value="default">Default</option>
              </select>
            </div>
          </div>

          <div id="logs" ref={logsRef} onScroll={handleScroll}>
            {isLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Connecting to log server...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                </div>
                <h3>No logs found</h3>
                <p>{searchTerm || logLevelFilter !== 'all' ? 'Try adjusting your search or filter criteria' : 'Waiting for log data...'}</p>
                {(searchTerm || logLevelFilter !== 'all') && (
                  <button 
                    className="reset-filters-btn"
                    onClick={() => {
                      setSearchTerm('');
                      setLogLevelFilter('all');
                    }}
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              filteredLogs.map((log, index) => (
                <div key={log.id} className={`log-entry ${log.level}`}>
                  <div className="log-header">
                    <span className="log-timestamp">
                      [{log.timestamp}]
                    </span>
                    <span className="log-level-badge">{log.level.toUpperCase()}</span>
                  </div>
                  <div className="log-message">
                    {highlightText(log.message, index)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logs;