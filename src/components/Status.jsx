import React, { useEffect, useState, useRef } from 'react';
import './Status.css';
import {
  reinitializeBot,
  disconnectBot,
  deleteCompany,
  deleteTrialEndDate,
  showUnrepliedMessages,
  initializeAutomations,
  cleanupAllJobs,
  reinitializeAllPending,
  debugBotStatuses
} from './StatusFunctions';

const Status = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [botStatuses, setBotStatuses] = useState(new Map());
  const [botActivityMap, setBotActivityMap] = useState(new Map());
  const [botsData, setBotsData] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [isConnected, setIsConnected] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showingOnlyActive, setShowingOnlyActive] = useState(false);
  const [testCompanies, setTestCompanies] = useState([]);
  const [testCompanyId, setTestCompanyId] = useState('');
  const [testPhoneNumber, setTestPhoneNumber] = useState('+601121677522');
  const [testHours, setTestHours] = useState('24');
  
  const wsRef = useRef(null);

  // Initialize on component mount
  useEffect(() => {
    initialize();
  }, []);

  // Notification system
  const showNotification = (message, isError = false) => {
    setNotification({ message, isError });
    setTimeout(() => setNotification(null), 3000);
  };

  // WebSocket connection to main server
  const connectWebSocket = () => {
    const wsUrl = "wss://juta-dev.ngrok.dev/status";
    console.log("Connecting WebSocket to:", wsUrl);
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onmessage = (event) => {
      console.log("WebSocket message received:", event.data);
      const data = JSON.parse(event.data);

      if (data.type === "status_update") {
        const phoneInfo = window.phoneMap?.get(data.botName) || {};
        console.log(`Status Update for ${data.botName}:`, {
          status: data.status,
          phoneIndex: data.phoneIndex,
          clientPhone: phoneInfo.clientPhone,
          displayName: phoneInfo.displayName,
        });

        updateBotStatus(
          data.botName,
          data.status,
          data.phoneIndex,
          null,
          phoneInfo.displayName,
          phoneInfo.clientPhone
        );
      } else if (data.type === "bot_activity") {
        setBotActivityMap(prev => new Map(prev.set(data.botName, data.isActive)));
        updateStats();
      }
    };

    wsRef.current.onopen = () => {
      console.log("WebSocket connected");
      setConnectionStatus("Connected to server");
      setIsConnected(true);
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket disconnected");
      setConnectionStatus("Connection lost. Reconnecting...");
      setIsConnected(false);
      setTimeout(() => {
        connectWebSocket();
      }, 3000);
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionStatus("Connection error");
      setIsConnected(false);
    };
  };

  // Bot status management
  const updateBotStatus = (botName, status, phoneIndex = 0, qrCode = null, displayName = null, clientPhone = null) => {
    const botKey = `${botName}_${phoneIndex}`;
    const botData = botsData.find((b) => b.botName === botName);

    setBotStatuses(prev => {
      const newMap = new Map(prev);
      newMap.set(botKey, {
        status,
        phoneIndex,
        qrCode,
        displayName: displayName || botData?.name,
        clientPhone: clientPhone || botData?.clientPhones?.[phoneIndex],
        employeeEmails: botData?.employeeEmails,
      });
      return newMap;
    });

    updateStats();
  };

  // Initialize bots
  const initializeBots = async () => {
    try {
      const apiUrl = "https://juta-dev.ngrok.dev/api/bots";
      console.log("Fetching bots from:", apiUrl);
      const response = await fetch(apiUrl);
      const bots = await response.json();
      console.log("Fetched bot data:", bots);

      const jutaBots = bots.filter(
        (bot) => bot.apiUrl === "https://juta-dev.ngrok.dev"
      );

      // Store bots data globally for WebSocket access
      window.botsData = jutaBots;
      
      // Create phone mapping for WebSocket
      window.phoneMap = new Map();
      jutaBots.forEach((bot) => {
        const phoneCount = parseInt(bot.phoneCount) || 1;
        for (let i = 0; i < phoneCount; i++) {
          window.phoneMap.set(bot.botName, {
            displayName: bot.name,
            clientPhone: bot.clientPhones?.[i],
            employeeEmails: bot.employeeEmails
          });
        }
      });

      jutaBots.forEach((bot) => {
        const phoneCount = parseInt(bot.phoneCount) || 1;
        for (let i = 0; i < phoneCount; i++) {
          updateBotStatus(
            bot.botName,
            "Initializing",
            i,
            null,
            bot.name,
            bot.clientPhones?.[i] || null
          );
        }
      });

      setBotsData(jutaBots);
      populateTestCompanySelect(jutaBots);
    } catch (error) {
      console.error("Error fetching bots:", error);
    }
  };

  // Stats calculation
  const updateStats = () => {
    const uniqueBots = new Set(
      Array.from(botStatuses.keys()).map((key) => key.split("_")[0])
    );
    const totalBots = uniqueBots.size;

    const activeBots = new Set(
      Array.from(botStatuses.entries())
        .filter(([, bot]) =>
          ["ready", "authenticated"].includes(bot.status.toLowerCase())
        )
        .map(([key]) => key.split("_")[0])
    ).size;

    const disconnectedBots = new Set(
      Array.from(botStatuses.entries())
        .filter(([, bot]) =>
          ["disconnected", "error"].includes(bot.status.toLowerCase())
        )
        .map(([key]) => key.split("_")[0])
    ).size;

    const currentlyActiveBots = new Set(
      Array.from(botActivityMap.entries())
        .filter(([, isActive]) => isActive)
        .map(([botName]) => botName)
    ).size;

    return { totalBots, activeBots, disconnectedBots, currentlyActiveBots };
  };

  // Initialize everything
  const initialize = async () => {
    await initializeBots();
    connectWebSocket();
    setTimeout(updateAutoReplyStatus, 2000);
  };

  const populateTestCompanySelect = (botsData) => {
    // This will be handled by React state instead of DOM manipulation
    const companies = [
      ...new Set(
        botsData
          .map((bot) => bot.companyId || bot.botName)
          .filter(Boolean)
      ),
    ];
    
    // Update the companies list for the select component
    setTestCompanies(companies);
  };

  const updateAutoReplyStatus = async () => {
    const companies = [
      ...new Set(
        botsData
          ?.map((bot) => bot.companyId || bot.botName)
          .filter(Boolean) || []
      ),
    ];

    for (const companyId of companies) {
      try {
        const response = await fetch(`https://juta-dev.ngrok.dev/api/auto-reply/status/${companyId}`);
        const data = await response.json();

        if (data.success) {
          console.log(`Auto-reply status for ${companyId}:`, data.data);
        }
      } catch (error) {
        console.error(`Error fetching status for company ${companyId}:`, error);
      }
    }
  };

  // Filter bot items based on search term and active filter
  const getFilteredBotItems = () => {
    const categoryGroups = new Map();
    const sortedBots = Array.from(botStatuses.entries()).sort((a, b) => {
      const [nameA] = a[0].split("_");
      const [nameB] = b[0].split("_");
      return nameA.localeCompare(nameB);
    });

    // Filter based on search term
    const filteredBots = sortedBots.filter(([key, data]) => {
      if (!searchTerm) return true;
      
      const [botName] = key.split("_");
      const botData = botsData?.find((b) => b.botName === botName);
      const displayName = botData?.name || botName;
      const status = data.status;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        displayName.toLowerCase().includes(searchLower) ||
        botName.toLowerCase().includes(searchLower) ||
        status.toLowerCase().includes(searchLower)
      );
    });

    // Filter based on active status if needed
    const finalFilteredBots = showingOnlyActive 
      ? filteredBots.filter(([key]) => {
          const [botName] = key.split("_");
          return botActivityMap.get(botName);
        })
      : filteredBots;

    for (const [key, data] of finalFilteredBots) {
      const [botName] = key.split("_");
      const botData = botsData?.find((b) => b.botName === botName);
      const category = botData?.category || "juta";

      if (!categoryGroups.has(category)) {
        categoryGroups.set(category, new Map());
      }
      if (!categoryGroups.get(category).has(botName)) {
        categoryGroups.get(category).set(botName, []);
      }
      categoryGroups.get(category).get(botName).push({ ...data, key });
    }

    return Array.from(categoryGroups.entries());
  };

  // Render bot items
  const renderBotItems = () => {
    const categoryEntries = getFilteredBotItems();
    
    if (categoryEntries.length === 0) {
      return (
        <div className="no-results">
          No bots found matching your search criteria.
        </div>
      );
    }

    return categoryEntries.map(([category, botsInCategory]) => (
      <div key={category} className="category-group">
        <div className="bot-list">
          <div className="bot-list-header">
            <span>Bot Information</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {Array.from(botsInCategory.entries()).map(([botName, phones]) => {
            const botData = botsData?.find((b) => b.botName === botName);
            const displayName = botData?.name || botName;
            const isActive = botActivityMap.get(botName);
            // const employeeEmails = botData?.employeeEmails || [];

            return phones.map(({ status, phoneIndex }, index) => {
              const phoneNumber = botData?.clientPhones?.[phoneIndex];
              const phoneLabel = phones.length > 1 ? ` (Phone ${index + 1})` : "";

              const activityIndicator =
                index === 0 && isActive ? (
                  <div className="bot-activity">
                    <span className="dot"></span>
                    Currently Active
                  </div>
                ) : null;

              return (
                <div key={`${botName}-${phoneIndex}`} className="bot-item">
                  <div className="bot-info">
                    <div className="bot-display-name">
                      {displayName}{phoneLabel}
                      {botData?.plan && (
                        <span className={`plan-badge ${botData.plan.toLowerCase()}`}>
                          {botData.plan}
                        </span>
                      )}
                      {botData?.trialEndDate && (
                        <span className="trial-badge">Trial</span>
                      )}
                      {activityIndicator}
                    </div>
                    <div className="bot-id">ID: {botName}</div>
                    {phoneNumber ? (
                      <div className="bot-id">Phones: {phoneNumber}</div>
                    ) : (
                      <div className="bot-id">
                        Phone{phones.length > 1 ? " " + (index + 1) : ""}: Not Set
                      </div>
                    )}
                  </div>
                  <span className={`bot-status status-${status.toLowerCase()}`}>
                    {status}
                  </span>
                  <div className="bot-actions">
                    {botData?.trialEndDate && (
                      <button
                        className="delete-trial-button"
                        onClick={() => deleteTrialEndDate(botName, showNotification, initializeBots)}
                      >
                        Delete Trial
                      </button>
                    )}
                    {index === 0 && (
                      <button
                        className="reinit-button"
                        onClick={() => showUnrepliedMessages(botData?.companyId || botName, showNotification)}
                        style={{ background: '#3b82f6', marginRight: '4px' }}
                      >
                        View Unreplied
                      </button>
                    )}
                    {phones.length === 1 ? (
                      <>
                        <button
                          className="reinit-button"
                          onClick={() => reinitializeBot(botName, phoneIndex, updateBotStatus, showNotification, botStatuses)}
                        >
                          Reinitialize
                        </button>
                        <button
                          className="disconnect-button"
                          onClick={() => disconnectBot(botName, phoneIndex, updateBotStatus, showNotification, botStatuses)}
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="reinit-button"
                          onClick={() => reinitializeBot(botName, phoneIndex, updateBotStatus, showNotification, botStatuses)}
                        >
                          Reinitialize Phone {phoneIndex + 1}
                        </button>
                        <button
                          className="disconnect-button"
                          onClick={() => disconnectBot(botName, phoneIndex, updateBotStatus, showNotification, botStatuses)}
                        >
                          Disconnect Phone {phoneIndex + 1}
                        </button>
                      </>
                    )}
                    {index === 0 && phones.length > 1 && (
                      <>
                        <button
                          className="reinit-button"
                          onClick={() => reinitializeBot(botName, undefined, updateBotStatus, showNotification, botStatuses)}
                        >
                          Reinitialize All
                        </button>
                        <button
                          className="disconnect-button"
                          onClick={() => disconnectBot(botName, undefined, updateBotStatus, showNotification, botStatuses)}
                        >
                          Disconnect All
                        </button>
                      </>
                    )}
                    {index === 0 && (
                      <button
                        className="delete-company-button"
                        onClick={() => deleteCompany(botName, setBotStatuses, setBotActivityMap, showNotification)}
                      >
                        Delete Company
                      </button>
                    )}
                  </div>
                </div>
              );
            });
          })}
        </div>
      </div>
    ));
  };

  // Handle test auto-reply with React state
  const handleTestAutoReply = async () => {
    if (!testCompanyId) {
      showNotification("Please select a company", true);
      return;
    }

    if (!testPhoneNumber) {
      showNotification("Please enter a phone number", true);
      return;
    }

    try {
      showNotification(`Testing auto-reply for ${testPhoneNumber} in company ${testCompanyId}...`);

      const response = await fetch(`https://juta-dev.ngrok.dev/api/auto-reply/test/${testCompanyId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: testPhoneNumber,
          hoursThreshold: parseInt(testHours),
        }),
      });

      const data = await response.json();

      if (data.success) {
        showNotification(`✅ Test completed: ${data.message}`);
      } else {
        showNotification(`❌ Test failed: ${data.error || data.message}`, true);
      }
    } catch (error) {
      console.error("Error testing auto-reply:", error);
      showNotification("❌ Test failed: Network error", true);
    }
  };

  const stats = updateStats();

  return (
    <div className="status-container">
      <div id="mainContent">
        <div className="container">
          <div className="header">
            <h1>Bot Status Monitor</h1>
            <div className="header-buttons">
       
              <button
                onClick={() => debugBotStatuses(botStatuses, showNotification)}
                className="refresh-button debug-button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                Debug Status
              </button>
              <button
                onClick={() => cleanupAllJobs(showNotification)}
                className="refresh-button"
                id="cleanupJobsButton"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
                Cleanup Jobs
              </button>
              <button
                onClick={initializeAutomations}
                className="refresh-button"
                id="initAutomationsButton"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
                </svg>
                Initialize Automations
              </button>
              <button
                onClick={() => reinitializeAllPending(botStatuses, showNotification)}
                className="refresh-button"
                id="refreshButton"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
                </svg>
                Reinitialize Pending
              </button>
            </div>
          </div>

          {/* Auto-Reply Test Section */}
          <div className="auto-reply-test-section">
            <h3>🧪 Test Auto-Reply</h3>
            <div className="auto-reply-controls">
              <select 
                className="modern-select" 
                value={testCompanyId} 
                onChange={(e) => setTestCompanyId(e.target.value)}
              >
                <option value="">Select Company</option>
                {testCompanies.map(companyId => (
                  <option key={companyId} value={companyId}>Company {companyId}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Phone (e.g., +601121677522)"
                value={testPhoneNumber}
                onChange={(e) => setTestPhoneNumber(e.target.value)}
                className="modern-input"
              />
              <select 
                className="modern-select" 
                value={testHours} 
                onChange={(e) => setTestHours(e.target.value)}
              >
                <option value="1">1 hour</option>
                <option value="6">6 hours</option>
                <option value="12">12 hours</option>
                <option value="24">24 hours</option>
                <option value="48">48 hours</option>
              </select>
              <button
                onClick={() => handleTestAutoReply()}
                className="modern-button test-button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4" />
                  <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.35 0 4.48.9 6.08 2.38l.94-.94" />
                </svg>
                Test Auto-Reply
              </button>
            </div>
          </div>

          <div className="search-container">
            <input
              type="text"
              id="searchInput"
              placeholder="Search bots..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="stats">
            <div className="stat-card">
              <div className="stat-value">{stats.totalBots}</div>
              <div className="stat-label">Total Bots</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.activeBots}</div>
              <div className="stat-label">Connected Bots</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.disconnectedBots}</div>
              <div className="stat-label">Disconnected</div>
            </div>
            <div className="stat-card" onClick={() => setShowingOnlyActive(!showingOnlyActive)} style={{cursor: 'pointer'}}>
              <div className="stat-value">{stats.currentlyActiveBots}</div>
              <div className="stat-label">Currently Active</div>
            </div>
          </div>

          <div id="categoryGroups">
            {renderBotItems()}
          </div>
        </div>

        <div id="connectionStatus" className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {connectionStatus}
        </div>

        {notification && (
          <div className={`notification ${notification.isError ? 'error' : 'success'}`}>
            {notification.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Status;
