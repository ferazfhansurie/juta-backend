// Additional functions for Status component

// Helper function to get the correct server port
const getServerPort = () => {
  return window.location.port === "5174" ? "8443" : window.location.port;
};

const getApiUrl = (endpoint) => {
  const serverPort = getServerPort();
  return `http://${window.location.hostname}:${serverPort}${endpoint}`;
};

// Bot management functions
export const reinitializeBot = async (botName, phoneIndex, updateBotStatus, showNotification, botStatuses) => {
  const confirmMessage =
    phoneIndex !== undefined
      ? `Are you sure you want to reinitialize Phone ${phoneIndex + 1} of ${botName}?`
      : `Are you sure you want to reinitialize all phones of ${botName}?`;

  if (!confirm(confirmMessage)) {
    return;
  }

  try {
    showNotification(
      `Reinitializing ${botName}${
        phoneIndex !== undefined ? ` Phone ${phoneIndex + 1}` : ""
      }...`
    );

    const response = await fetch(getApiUrl("/api/bots/reinitialize"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ botName, phoneIndex }),
    });

    if (!response.ok) {
      throw new Error("Failed to reinitialize bot");
    }

    if (phoneIndex !== undefined) {
      updateBotStatus(botName, "Initializing", phoneIndex);
    } else {
      const phones = Array.from(botStatuses.entries())
        .filter(([key]) => key.startsWith(botName + "_"))
        .map(([key]) => {
          const [, phoneIndex] = key.split("_");
          return parseInt(phoneIndex);
        });

      phones.forEach((idx) => {
        updateBotStatus(botName, "Initializing", idx);
      });
    }

    showNotification(
      `${botName}${
        phoneIndex !== undefined ? ` Phone ${phoneIndex + 1}` : ""
      } is being reinitialized`
    );
  } catch (error) {
    console.error("Error reinitializing bot:", error);
    showNotification("Failed to reinitialize bot. Please try again.", true);
  }
};

export const disconnectBot = async (botName, phoneIndex, updateBotStatus, showNotification, botStatuses) => {
  const confirmMessage =
    phoneIndex !== undefined
      ? `Are you sure you want to disconnect Phone ${phoneIndex + 1} of ${botName}?`
      : `Are you sure you want to disconnect all phones of ${botName}?`;

  if (!confirm(confirmMessage)) {
    return;
  }

  try {
    showNotification(
      `Disconnecting ${botName}${
        phoneIndex !== undefined ? ` Phone ${phoneIndex + 1}` : ""
      }...`
    );

    const response = await fetch(`/api/bots/${botName}/disconnect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phoneIndex }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to disconnect bot");
    }

    const data = await response.json();

    if (phoneIndex !== undefined) {
      updateBotStatus(botName, "Disconnected", phoneIndex);
    } else {
      const phones = Array.from(botStatuses.entries())
        .filter(([key]) => key.startsWith(botName + "_"))
        .map(([key]) => {
          const [, phoneIndex] = key.split("_");
          return parseInt(phoneIndex);
        });

      phones.forEach((idx) => {
        updateBotStatus(botName, "Disconnected", idx);
      });
    }

    showNotification(
      data.message ||
        `${botName}${
          phoneIndex !== undefined ? ` Phone ${phoneIndex + 1}` : ""
        } disconnected successfully`
    );
  } catch (error) {
    console.error("Error disconnecting bot:", error);
    showNotification("Failed to disconnect bot. Please try again.", true);
  }
};

export const deleteCompany = async (botName, setBotStatuses, setBotActivityMap, showNotification) => {
  const firstConfirm = confirm(
    `⚠️ WARNING: This will permanently delete company ${botName} and ALL its data!\n\nThis action cannot be undone. Are you sure?`
  );
  if (!firstConfirm) {
    return;
  }

  const secondConfirm = confirm(
    `🔴 FINAL CONFIRMATION\n\nYou are about to permanently delete:\n- Company ${botName}\n- All contacts\n- All messages\n- All employees\n- All settings\n- All related data\n\nType the company ID "${botName}" in the next prompt to confirm.`
  );
  if (!secondConfirm) {
    return;
  }

  const confirmInput = prompt(
    `Please type "${botName}" to confirm deletion:`
  );
  if (confirmInput !== botName) {
    showNotification("Company deletion cancelled - incorrect confirmation", true);
    return;
  }

  try {
    showNotification(`Deleting company ${botName}... This may take a moment.`);

    const response = await fetch(`/api/companies/${botName}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete company");
    }

    const data = await response.json();

    const phoneEntries = Array.from(botStatuses.entries()).filter(
      ([key]) => key.startsWith(botName + "_")
    );

    phoneEntries.forEach(([key]) => {
      setBotStatuses(prev => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });
    });

    setBotActivityMap(prev => {
      const newMap = new Map(prev);
      newMap.delete(botName);
      return newMap;
    });

    showNotification(`✅ Company ${botName} deleted successfully`, false);

    setTimeout(() => {
      window.location.reload();
    }, 3000);
  } catch (error) {
    console.error("Error deleting company:", error);
    showNotification(`❌ Failed to delete company: ${error.message}`, true);
  }
};

export const deleteTrialEndDate = async (botName, showNotification, initializeBots) => {
  if (!confirm(`Are you sure you want to delete the trial period for ${botName}?`)) {
    return;
  }

  try {
    const response = await fetch(`/api/bots/${botName}/trial-end-date`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete trial end date");
    }

    showNotification(`Trial period deleted for ${botName}`);
    await initializeBots();
  } catch (error) {
    console.error("Error deleting trial end date:", error);
    showNotification("Failed to delete trial period", true);
  }
};

// Auto-reply functions
export const testAutoReply = async (showNotification) => {
  const companyId = document.getElementById("testCompanySelect")?.value;
  const phoneNumber = document.getElementById("testPhoneNumber")?.value;
  const hoursThreshold = document.getElementById("testHoursSelect")?.value;

  if (!companyId) {
    showNotification("Please select a company", true);
    return;
  }

  if (!phoneNumber) {
    showNotification("Please enter a phone number", true);
    return;
  }

  try {
    showNotification(`Testing auto-reply for ${phoneNumber} in company ${companyId}...`);

    const response = await fetch(`/api/auto-reply/test/${companyId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber,
        hoursThreshold: parseInt(hoursThreshold),
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

export const showUnrepliedMessages = async (companyId, showNotification) => {
  try {
    showNotification(`Fetching unreplied messages for company ${companyId}...`);

    const response = await fetch(`/api/auto-reply/unreplied/${companyId}?hoursThreshold=24`);
    const data = await response.json();

    if (data.success) {
      if (data.data.count === 0) {
        showNotification(`✅ No unreplied messages found for company ${companyId}`);
      } else {
        showUnrepliedMessagesModal(companyId, data.data);
      }
    } else {
      showNotification(`❌ Failed to fetch unreplied messages: ${data.error}`, true);
    }
  } catch (error) {
    console.error("Error fetching unreplied messages:", error);
    showNotification("❌ Failed to fetch unreplied messages: Network error", true);
  }
};

export const showUnrepliedMessagesModal = (companyId, data) => {
  // This would need to be implemented as a modal component
  console.log("Show unreplied messages modal:", companyId, data);
};

// Utility functions
export const initializeAutomations = async () => {
  try {
    const response = await fetch("/api/initialize-automations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      alert("Automations initialized successfully");
    } else {
      throw new Error(data.error || "Failed to initialize automations");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error initializing automations: " + error.message);
  }
};

export const cleanupAllJobs = async (showNotification) => {
  if (!confirm("Are you sure you want to clean up all problematic jobs? This will remove all pending jobs from the queue.")) {
    return;
  }

  try {
    showNotification("Cleaning up problematic jobs...");

    const response = await fetch("/api/cleanup-jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to clean up jobs");
    }

    showNotification("All problematic jobs cleaned up successfully!");

    setTimeout(() => {
      location.reload();
    }, 2000);
  } catch (error) {
    console.error("Error cleaning up jobs:", error);
    showNotification("Failed to clean up jobs: " + error.message, true);
  }
};

export const reinitializeAllPending = async (botStatuses, showNotification) => {
  try {
    const initializingBots = Array.from(botStatuses.entries())
      .filter(([, data]) => {
        const status = data.status.toLowerCase();
        return status === "initializing" || status.includes("initializing");
      })
      .map(([key]) => key.split("_")[0]);

    const stuckBots = Array.from(botStatuses.entries())
      .filter(([, data]) => {
        const status = data.status.toLowerCase();
        return status === "error" || status === "disconnected" || status.includes("error") || status.includes("disconnected");
      })
      .map(([key]) => key.split("_")[0]);

    const uniqueInitializingBots = [...new Set(initializingBots)];
    const uniqueStuckBots = [...new Set(stuckBots)];
    const allBotsToReinitialize = [...new Set([...uniqueInitializingBots, ...uniqueStuckBots])];

    if (allBotsToReinitialize.length === 0) {
      showNotification("No bots in initializing or stuck state");
      return;
    }

    const initializingCount = uniqueInitializingBots.length;
    const stuckCount = uniqueStuckBots.length;

    showNotification(`Reinitializing ${allBotsToReinitialize.length} bot(s) - ${initializingCount} initializing, ${stuckCount} stuck`);

    let successCount = 0;
    let errorCount = 0;

    for (const botName of allBotsToReinitialize) {
      try {
        const response = await fetch("/api/bots/reinitialize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ botName }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to reinitialize ${botName}`);
        }

        successCount++;
      } catch (error) {
        console.error(`Error reinitializing ${botName}:`, error);
        showNotification(`Failed to reinitialize ${botName}: ${error.message}`, true);
        errorCount++;
      }
    }

    if (errorCount === 0) {
      showNotification(`Successfully reinitialized ${successCount} bot(s)`);
    } else if (successCount === 0) {
      showNotification(`Failed to reinitialize any bots`, true);
    } else {
      showNotification(`Reinitialized ${successCount} bot(s), ${errorCount} failed`, true);
    }
  } catch (error) {
    console.error("Error in reinitializeAllPending:", error);
    showNotification("An error occurred while reinitializing bots", true);
  }
};

export const debugBotStatuses = (botStatuses, showNotification) => {
  console.log("=== DEBUG: Current Bot Statuses ===");
  console.log("Total bot entries:", botStatuses.size);

  const statusCounts = {};
  const initializingBots = [];

  Array.from(botStatuses.entries()).forEach(([key, data]) => {
    const status = data.status;
    statusCounts[status] = (statusCounts[status] || 0) + 1;

    if (status.toLowerCase().includes("initializing")) {
      initializingBots.push({ key, status, data });
    }
  });

  console.log("Status counts:", statusCounts);
  console.log("Initializing bots:", initializingBots);

  const debugInfo = `Total: ${botStatuses.size}, Initializing: ${initializingBots.length}`;
  showNotification(`Debug: ${debugInfo}`);
};





