const API_BASE_URL = 'https://juta-dev.ngrok.dev/api';

export const dataServices = {
  // Users
  loadUsers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/analytics`);
      const data = await response.json();
      return data.success ? data.users : [];
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  },

  // Companies
  loadCompanies: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/companies`);
      const data = await response.json();
      return data.success ? (data.companies || data.data) : [];
    } catch (error) {
      console.error('Error loading companies:', error);
      return [];
    }
  },

  // Contacts
  loadContacts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/contacts`);
      const data = await response.json();
      return data.success ? (data.contacts || data.data) : [];
    } catch (error) {
      console.error('Error loading contacts:', error);
      return [];
    }
  },

  // Messages
  loadMessages: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages`);
      const data = await response.json();
      return data.success ? (data.messages || data.data) : [];
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  },

  // Employees
  loadEmployees: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/employees`);
      const data = await response.json();
      return data.success ? (data.employees || data.data) : [];
    } catch (error) {
      console.error('Error loading employees:', error);
      return [];
    }
  },

  // Appointments
  loadAppointments: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments`);
      const data = await response.json();
      return data.success ? (data.appointments || data.data) : [];
    } catch (error) {
      console.error('Error loading appointments:', error);
      return [];
    }
  },

  // Feedback
  loadFeedback: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback`);
      const data = await response.json();
      return data.success ? (data.feedback || data.data) : [];
    } catch (error) {
      console.error('Error loading feedback:', error);
      return [];
    }
  },

  // Notifications
  loadNotifications: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`);
      const data = await response.json();
      return data.success ? (data.notifications || data.data) : [];
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  },

  // Scheduled Messages
  loadScheduledMessages: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/scheduled-messages`);
      const data = await response.json();
      return data.success ? (data.scheduledMessages || data.data) : [];
    } catch (error) {
      console.error('Error loading scheduled messages:', error);
      return [];
    }
  },

  // Usage Logs
  loadUsageLogs: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/usage-logs`);
      const data = await response.json();
      return data.success ? (data.usageLogs || data.data) : [];
    } catch (error) {
      console.error('Error loading usage logs:', error);
      return [];
    }
  }
};
