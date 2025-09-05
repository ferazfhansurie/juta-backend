import { useState, useEffect } from 'react';
import { dataServices } from '../services/dataServices';

export const useDatabaseData = () => {
  const [activeTable, setActiveTable] = useState('users');
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [scheduledMessages, setScheduledMessages] = useState([]);
  const [usageLogs, setUsageLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Data loading functions
  const loadUsers = async () => {
    setLoading(true);
    const data = await dataServices.loadUsers();
    setUsers(data);
    setLoading(false);
  };

  const loadCompanies = async () => {
    setLoading(true);
    const data = await dataServices.loadCompanies();
    setCompanies(data);
    setLoading(false);
  };

  const loadContacts = async () => {
    setLoading(true);
    const data = await dataServices.loadContacts();
    setContacts(data);
    setLoading(false);
  };

  const loadMessages = async () => {
    setLoading(true);
    const data = await dataServices.loadMessages();
    setMessages(data);
    setLoading(false);
  };

  const loadEmployees = async () => {
    setLoading(true);
    const data = await dataServices.loadEmployees();
    setEmployees(data);
    setLoading(false);
  };

  const loadAppointments = async () => {
    setLoading(true);
    const data = await dataServices.loadAppointments();
    setAppointments(data);
    setLoading(false);
  };

  const loadFeedback = async () => {
    setLoading(true);
    const data = await dataServices.loadFeedback();
    setFeedback(data);
    setLoading(false);
  };

  const loadNotifications = async () => {
    setLoading(true);
    const data = await dataServices.loadNotifications();
    setNotifications(data);
    setLoading(false);
  };

  const loadScheduledMessages = async () => {
    setLoading(true);
    const data = await dataServices.loadScheduledMessages();
    setScheduledMessages(data);
    setLoading(false);
  };

  const loadUsageLogs = async () => {
    setLoading(true);
    const data = await dataServices.loadUsageLogs();
    setUsageLogs(data);
    setLoading(false);
  };

  // Save and delete handlers
  const handleSaveUser = async (userData, editingUser) => {
    try {
      if (editingUser) {
        setUsers(users.map(u => u.email === editingUser.email ? { ...u, ...userData } : u));
      } else {
        setUsers([...users, { ...userData, createdAt: new Date().toISOString() }]);
      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleDeleteUser = async (user) => {
    setUsers(users.filter(u => u.email !== user.email));
  };

  const handleSaveCompany = async (companyData, editingCompany) => {
    try {
      if (editingCompany) {
        setCompanies(companies.map(c => c.company_id === editingCompany.company_id ? { ...c, ...companyData } : c));
      } else {
        setCompanies([...companies, { ...companyData, created_at: new Date().toISOString() }]);
      }
    } catch (error) {
      console.error('Error saving company:', error);
    }
  };

  const handleDeleteCompany = async (company) => {
    setCompanies(companies.filter(c => c.company_id !== company.company_id));
  };

  // Load data when active table changes
  useEffect(() => {
    const loadData = async () => {
      switch (activeTable) {
        case 'users':
          await loadUsers();
          break;
        case 'companies':
          await loadCompanies();
          break;
        case 'contacts':
          await loadContacts();
          break;
        case 'messages':
          await loadMessages();
          break;
        case 'employees':
          await loadEmployees();
          break;
        case 'appointments':
          await loadAppointments();
          break;
        case 'feedback':
          await loadFeedback();
          break;
        case 'notifications':
          await loadNotifications();
          break;
        case 'scheduled_messages':
          await loadScheduledMessages();
          break;
        case 'usage_logs':
          await loadUsageLogs();
          break;
        default:
          break;
      }
    };

    loadData();
  }, [activeTable]);

  // Get current data based on active table
  const getCurrentData = () => {
    switch (activeTable) {
      case 'users': return users;
      case 'companies': return companies;
      case 'contacts': return contacts;
      case 'messages': return messages;
      case 'employees': return employees;
      case 'appointments': return appointments;
      case 'feedback': return feedback;
      case 'notifications': return notifications;
      case 'scheduled_messages': return scheduledMessages;
      case 'usage_logs': return usageLogs;
      default: return [];
    }
  };

  // Get current load function based on active table
  const getCurrentLoadFunction = () => {
    switch (activeTable) {
      case 'users': return loadUsers;
      case 'companies': return loadCompanies;
      case 'contacts': return loadContacts;
      case 'messages': return loadMessages;
      case 'employees': return loadEmployees;
      case 'appointments': return loadAppointments;
      case 'feedback': return loadFeedback;
      case 'notifications': return loadNotifications;
      case 'scheduled_messages': return loadScheduledMessages;
      case 'usage_logs': return loadUsageLogs;
      default: return () => {};
    }
  };

  // Get current save function based on active table
  const getCurrentSaveFunction = () => {
    switch (activeTable) {
      case 'users': return handleSaveUser;
      case 'companies': return handleSaveCompany;
      default: return () => {};
    }
  };

  // Get current delete function based on active table
  const getCurrentDeleteFunction = () => {
    switch (activeTable) {
      case 'users': return handleDeleteUser;
      case 'companies': return handleDeleteCompany;
      default: return () => {};
    }
  };

  return {
    activeTable,
    setActiveTable,
    loading,
    getCurrentData,
    getCurrentLoadFunction,
    getCurrentSaveFunction,
    getCurrentDeleteFunction
  };
};
