import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter
} from 'recharts';
import './ClientAnalytics.css';
import { 
  Download, 
  Plus, 
  Search,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  BarChart3,
  Activity,
  Edit3,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Users,
  Clock,
  Target,
  Award,
  FileText,
  CreditCard,
  Timer,
  Star,
  Zap,
  Crown,
  Building,
  Mail,
  Phone,
  MapPin,
  ExternalLink
} from 'lucide-react';

const ClientAnalytics = () => {
  const [clientData, setClientData] = useState({
    clients: [],
    invoices: [],
    payments: [],
    analytics: {
      topPayingClients: [],
      longestStayingClients: [],
      paymentTrends: [],
      clientRetention: [],
      monthlyRevenue: []
    }
  });
  const [summary, setSummary] = useState({});
  const [allFinancialData, setAllFinancialData] = useState([]);

  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [newInvoice, setNewInvoice] = useState({
    clientId: '',
    amount: '',
    description: '',
    dueDate: '',
    status: 'pending',
    serviceType: 'AI Bot Service'
  });
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showViewClientModal, setShowViewClientModal] = useState(false);
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [showEditInvoiceModal, setShowEditInvoiceModal] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    amount: '',
    month: '',
    year: '',
    status: 'paid'
  });
  const [editingClient, setEditingClient] = useState(null);
  const [viewMode, setViewMode] = useState('overview'); // overview, clients, invoices, analytics
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('amount'); // amount, name, date, status
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [showPaidOnly, setShowPaidOnly] = useState(false);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [timeRange, setTimeRange] = useState('12months'); // 3months, 6months, 12months, all
  const [selectedMonth, setSelectedMonth] = useState(''); // For filtering clients by month

  // Fetch real data from companies and financial tables
  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching financial data only...');
      
      // Fetch summary data first (like FinancialStatement does)
      try {
        const summaryResponse = await fetch('https://juta-dev.ngrok.dev/api/financial/summary');
        const summaryResult = await summaryResponse.json();
        if (summaryResult.success) {
          setSummary(summaryResult.summary);
          console.log('Summary data:', summaryResult.summary);
        }
      } catch (error) {
        console.log('Summary data not available yet');
      }
      
      // Fetch ALL financial data - get all income sources from all months
      let allFinancialData = [];
      
      try {
        // First try to get all income sources without month/year filter
        const response = await fetch('https://juta-dev.ngrok.dev/api/financial/income-sources');
        const data = await response.json();
        if (data.success && data.data) {
          allFinancialData = data.data;
          console.log('Fetched all income sources:', allFinancialData.length, 'entries');
        }
      } catch (error) {
        console.log('Failed to fetch all income sources, trying monthly approach...');
        
        // Fallback: Get all months from monthly data and fetch each
        try {
          const monthlyResponse = await fetch('https://juta-dev.ngrok.dev/api/financial/monthly-data');
          const monthlyResult = await monthlyResponse.json();
          
          if (monthlyResult.success) {
            // Fetch income sources for each month in the database
            for (const monthData of monthlyResult.data) {
              try {
                const response = await fetch(`https://juta-dev.ngrok.dev/api/financial/income-sources?month=${monthData.month}&year=${monthData.year}`);
                const data = await response.json();
                if (data.success && data.data) {
                  allFinancialData.push(...data.data);
                }
              } catch (error) {
                console.log(`Failed to fetch data for ${monthData.month} ${monthData.year}`);
              }
            }
          }
        } catch (fallbackError) {
          console.log('Fallback also failed:', fallbackError);
        }
      }
      
      console.log('All financial data:', allFinancialData.length, 'entries');
      console.log('Sample financial entry:', allFinancialData[0]);
      
      // Store financial data for later use
      setAllFinancialData(allFinancialData);
      
      // Fetch client analytics if available
      let clientAnalytics = [];
      try {
        const analyticsResponse = await fetch('https://juta-dev.ngrok.dev/api/client-analytics');
        const analyticsData = await analyticsResponse.json();
        console.log('Client analytics data:', analyticsData);
        if (analyticsData.success) {
          clientAnalytics = analyticsData.data;
        }
      } catch (error) {
        console.log('Client analytics not available yet');
      }

      // Fetch invoices if available
      let invoices = [];
      try {
        const invoicesResponse = await fetch('https://juta-dev.ngrok.dev/api/client-invoices');
        const invoicesData = await invoicesResponse.json();
        console.log('Client invoices data:', invoicesData);
        if (invoicesData.success) {
          invoices = invoicesData.data;
        }
      } catch (error) {
        console.log('Client invoices not available yet');
      }

      // Process financial data directly - group by source_name to create clients
      const clientMap = new Map();
      
      allFinancialData.forEach(income => {
        if (!income.source_name) return;
        
        const clientName = income.source_name;
        
        // Find existing similar client or create new one
        let existingClient = null;
        let existingKey = null;
        
        // Check for similar client names (for merging duplicates)
        for (const [key, client] of clientMap.entries()) {
          if (isSimilarClientName(clientName, key)) {
            existingClient = client;
            existingKey = key;
            break;
          }
        }
        
        if (existingClient) {
          // Merge with existing similar client
          existingClient.totalPaid += parseFloat(income.amount || 0);
          existingClient.totalInvoices += 1;
          
          // Update earliest payment date (member since)
          if (income.month && income.year) {
            const monthIndex = getMonthIndex(income.month);
            const paymentDate = new Date(income.year, monthIndex, 1);
            if (!existingClient.joinDate || paymentDate < new Date(existingClient.joinDate)) {
              existingClient.joinDate = paymentDate.toISOString();
            }
          }
          
          //console.log(`Merged "${clientName}" (RM${parseFloat(income.amount || 0)}) into "${existingKey}" (now RM${existingClient.totalPaid})`);
        } else {
          // Create new client from financial data
          const client = {
            id: `financial-${clientName.replace(/\s+/g, '-').toLowerCase()}`,
            name: clientName,
            email: null,
            phone: null,
            company: clientName,
            address: 'Not specified',
            joinDate: income.month && income.year ? new Date(income.year, getMonthIndex(income.month), 1).toISOString() : null,
            totalPaid: parseFloat(income.amount || 0),
            totalInvoices: 1,
            avgPaymentTime: 0, // Not applicable for financial data
            status: getPaymentStatus(clientName), // Automatically determine status based on unpaid list
            services: ['AI Bot Service'],
            lastPayment: null,
            retentionScore: 50,
            plan: 'paid',
            apiUrl: null
          };
          
          clientMap.set(clientName, client);
        }
      });
      
      // Convert map to array
      const processedClients = Array.from(clientMap.values());
      console.log('Processed clients from financial data:', processedClients);
      

      


      // Calculate retention scores and clean up client names
      processedClients.forEach(client => {
        client.retentionScore = calculateRetentionScoreFromPayments(client.totalPaid, client.totalInvoices);
        
        // Clean up client name for better display
        client.displayName = cleanClientName(client.name);
      });

      setClientData({
        clients: processedClients,
        invoices: invoices,
        payments: invoices.filter(inv => inv.status === 'paid'),
        analytics: {
          topPayingClients: processedClients.sort((a, b) => b.totalPaid - a.totalPaid).slice(0, 10),
          longestStayingClients: processedClients.sort((a, b) => b.totalInvoices - a.totalInvoices).slice(0, 5),
          paymentTrends: generateRealPaymentTrends(processedClients),
          clientRetention: generateRealRetentionData(processedClients),
          monthlyRevenue: generateRealMonthlyRevenue(processedClients)
        }
      });

      console.log('Final client data set:', {
        clients: processedClients,
        invoices: invoices,
        payments: invoices.filter(inv => inv.status === 'paid')
      });

    } catch (error) {
      console.error('Error fetching client data:', error);
      // Set fallback data on error
      setClientData({
        clients: [],
        invoices: [],
        payments: [],
        analytics: {
          topPayingClients: [],
          longestStayingClients: [],
          paymentTrends: [],
          clientRetention: [],
          monthlyRevenue: []
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert month name to index (0-11)
  const getMonthIndex = (monthName) => {
    const months = {
      // Full month names
      'JANUARY': 0, 'FEBRUARY': 1, 'MARCH': 2, 'APRIL': 3, 'MAY': 4, 'JUNE': 5,
      'JULY': 6, 'AUGUST': 7, 'SEPTEMBER': 8, 'OCTOBER': 9, 'NOVEMBER': 10, 'DECEMBER': 11,
      // Abbreviated month names
      'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'JUN': 5,
      'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
    };
    return months[monthName.toUpperCase()] || 0;
  };

  // Helper function to clean client name for better display
  const cleanClientName = (name) => {
    return name
      .replace(/\s*-\s*\d+(st|nd|rd|th|hb|hb|hb)\s*$/i, '') // Remove "-4th", "-23hb", "-8hb"
      .replace(/\s*-\s*\d+\s*$/i, '') // Remove "-4", "-23", "-8"
      .replace(/\s*ai\s*bot\s*\d*\s*-\s*monthly\s*$/i, '') // Remove "AI BOT X - MONTHLY"
      .replace(/\s*-\s*monthly\s*$/i, '') // Remove "- MONTHLY"
      .replace(/\s*monthly\s*$/i, '') // Remove "MONTHLY"
      .trim();
  };

  // Helper function to check if two client names are similar (for merging)
  const isSimilarClientName = (name1, name2) => {
    const n1 = name1.toLowerCase().trim();
    const n2 = name2.toLowerCase().trim();
    
    // Exact match
    if (n1 === n2) return true;
    
    // Extract base company name (remove common suffixes/prefixes)
    const getBaseName = (name) => {
      return name
        .replace(/\s*-\s*\d+(st|nd|rd|th|hb|hb|hb)\s*$/i, '') // Remove "-4th", "-23hb", "-8hb"
        .replace(/\s*-\s*\d+\s*$/i, '') // Remove "-4", "-23", "-8"
        .replace(/\s*ai\s*bot\s*\d*\s*-\s*monthly\s*$/i, '') // Remove "AI BOT X - MONTHLY"
        .replace(/\s*-\s*monthly\s*$/i, '') // Remove "- MONTHLY"
        .replace(/\s*monthly\s*$/i, '') // Remove "MONTHLY"
        .trim();
    };
    
    const base1 = getBaseName(n1);
    const base2 = getBaseName(n2);
    
    // Check if base names are similar
    if (base1 === base2 && base1.length > 2) return true;
    
    // Check if one contains the other
    if (base1.includes(base2) || base2.includes(base1)) {
      return Math.min(base1.length, base2.length) > 3; // Only if base name is substantial
    }
    
    // Check for common patterns like "MJBI - 4th" vs "MJBI - 23hb"
    const words1 = base1.split(/\s+/);
    const words2 = base2.split(/\s+/);
    
    if (words1.length > 0 && words2.length > 0) {
      // Check if first word matches (for cases like "MJBI - 4th" vs "MJBI - 23hb")
      if (words1[0] === words2[0] && words1[0].length > 2) return true;
    }
    
    return false;
  };

  // List of clients who haven't paid (from your Google Sheets)
  const unpaidClients = [
    // September 2025
    'BHQ A.I BOT 5 - 29th',
    'NTRM - 13th',
    'DC NT - 23th',
    'Alist - 5th',
    'DC Whitelabel Maintenance 25th',
    'DC aiplay888 - 27th',
    'Revotrend - 19th',
    'Mata Sight - 30th',
    'Finesse Clinic - 28th',
    'Kyra Beauty - 28th',
    'DC - Gown - 10th',
    'BHQ 2 - 10th',
    'MJBI - 23hb',
    'Bestari - 6th',
    'ROBIN - WhiteLabel - 18hb',
    'ROBIN 1 -',
    'MSO network - 2hb',
    'Callabio - 2 / 28',
    'MJBI - 23',
    'DC - Job Builder',
    'APER Research Assitant 1st Phase',
    'My. HomeTown Media Website',
    'Alist - 5th',
    'Alist Database',
    // August 2025
    'NTRM - 13th',
    'DC NT - 23th',
    'DC Whitelabel Maintenance 25th',
    'Finesse Clinic - 28th',
    'MTDC',
    'DC - Job Builder',
    // July 2025
    'MTDC',
    'DC - Job Builder',
    'MyHomeTown Media',
    // December 2024
    'Booking Care'
  ];

  // Helper function to determine payment status based on unpaid list
  const getPaymentStatus = (clientName) => {
    // Check if client name matches any in the unpaid list
    const isUnpaid = unpaidClients.some(unpaidName => {
      const cleanClientName = clientName.toLowerCase().trim();
      const cleanUnpaidName = unpaidName.toLowerCase().trim();
      
      // Exact match
      if (cleanClientName === cleanUnpaidName) return true;
      
      // More precise matching - only match if there's significant overlap
      // Check if client name contains unpaid name (but not too broad)
      if (cleanUnpaidName.length > 3 && cleanClientName.includes(cleanUnpaidName)) {
        return true;
      }
      
      // Check if unpaid name contains client name (but not too broad)
      if (cleanClientName.length > 3 && cleanUnpaidName.includes(cleanClientName)) {
        return true;
      }
      
      // Specific exact matches for known variations
      const specificMatches = [
        // Alist variations
        { client: 'alist database', unpaid: 'alist - 5th' },
        { client: 'alist database', unpaid: 'alist database' },
        
        // MJBI variations
        { client: 'mjbi - 8hb', unpaid: 'mjbi - 23hb' },
        { client: 'mjbi - 23', unpaid: 'mjbi - 23hb' },
        
        // Robin variations
        { client: 'robin - whitelabel setup', unpaid: 'robin - whitelabel - 18hb' },
        { client: 'robin 1 -', unpaid: 'robin 1 -' },
        
        // DC variations - be more specific
        { client: 'dc nt - 23th', unpaid: 'dc nt - 23th' },
        { client: 'dc - gown - 10th', unpaid: 'dc - gown - 10th' },
        { client: 'dc whitelabel maintenance 25th', unpaid: 'dc whitelabel maintenance 25th' },
        { client: 'dc aiplay888 - 27th', unpaid: 'dc aiplay888 - 27th' },
        { client: 'dc - job builder', unpaid: 'dc - job builder' },
        
        // Other specific matches
        { client: 'ntrm - 13th', unpaid: 'ntrm - 13th' },
        { client: 'finesse clinic - 28th', unpaid: 'finesse clinic - 28th' },
        { client: 'kyra beauty - 28th', unpaid: 'kyra beauty - 28th' },
        { client: 'bestari - custom automation', unpaid: 'bestari - 6th' },
        { client: 'mso network - 2hb', unpaid: 'mso network - 2hb' },
        { client: 'callabio - 2 / 28', unpaid: 'callabio - 2 / 28' },
        { client: 'mtdc', unpaid: 'mtdc' },
        { client: 'my. hometown media website', unpaid: 'my. hometown media website' },
        { client: 'myhometown media', unpaid: 'myhometown media' },
        { client: 'aper research assitant 1st phase', unpaid: 'aper research assitant 1st phase' },
        { client: 'bhq a.i bot 5 - monthly', unpaid: 'bhq a.i bot 5 - 29th' },
        { client: 'booking care', unpaid: 'booking care' },
        { client: 'bookingcarcare', unpaid: 'bookingcarcare' }
      ];
      
      // Check specific matches
      for (const match of specificMatches) {
        if (cleanClientName === match.client && cleanUnpaidName === match.unpaid) {
          return true;
        }
      }
      
      return false;
    });
    
    const status = isUnpaid ? 'pending' : 'paid';
    if (isUnpaid) {
      console.log(`Client: "${clientName}" -> Status: ${status} (MATCHED)`);
    }
    return status;
  };

  // Helper function to toggle payment status
  const togglePaymentStatus = (clientId) => {
    setClientData(prev => ({
      ...prev,
      clients: prev.clients.map(client => 
        client.id === clientId 
          ? { ...client, status: client.status === 'paid' ? 'pending' : 'paid' }
          : client
      )
    }));
  };

  // Get available months from financial data
  const getAvailableMonths = () => {
    const months = new Set();
    allFinancialData.forEach(income => {
      if (income.month && income.year) {
        months.add(`${income.month} ${income.year}`);
      }
    });
    return Array.from(months).sort((a, b) => {
      const [monthA, yearA] = a.split(' ');
      const [monthB, yearB] = b.split(' ');
      const dateA = new Date(yearA, getMonthIndex(monthA));
      const dateB = new Date(yearB, getMonthIndex(monthB));
      return dateB - dateA; // Most recent first
    });
  };

  // Get clients who paid in a specific month
  const getPaidClientsForMonth = (monthYear) => {
    if (!monthYear) return [];
    
    const [month, year] = monthYear.split(' ');
    const yearNum = parseInt(year);
    
    return clientData.clients.filter(client => {
      // Check if client has payments in the selected month AND is marked as paid
      const hasCurrentMonthPayment = allFinancialData.some(income => 
        income.source_name === client.name && 
        income.month === month && 
        income.year === yearNum
      );
      
      return hasCurrentMonthPayment && client.status === 'paid';
    }).sort((a, b) => {
      // Sort by payment amount in that month
      const aAmount = allFinancialData
        .filter(income => 
          income.source_name === a.name && 
          income.month === month && 
          income.year === yearNum
        )
        .reduce((sum, income) => sum + parseFloat(income.amount || 0), 0);
      
      const bAmount = allFinancialData
        .filter(income => 
          income.source_name === b.name && 
          income.month === month && 
          income.year === yearNum
        )
        .reduce((sum, income) => sum + parseFloat(income.amount || 0), 0);
      
      return bAmount - aAmount;
    });
  };

  // Get pending clients for a specific month
  const getPendingClientsForMonth = (monthYear) => {
    if (!monthYear) return [];
    
    const [month, year] = monthYear.split(' ');
    const yearNum = parseInt(year);
    
    return clientData.clients.filter(client => {
      // Check if client is marked as pending
      if (client.status !== 'pending') return false;
      
      // Check if client has payments in the selected month
      return allFinancialData.some(income => 
        income.source_name === client.name && 
        income.month === month && 
        income.year === yearNum
      );
    }).sort((a, b) => {
      // Sort by payment amount in that month
      const aAmount = allFinancialData
        .filter(income => 
          income.source_name === a.name && 
          income.month === month && 
          income.year === yearNum
        )
        .reduce((sum, income) => sum + parseFloat(income.amount || 0), 0);
      
      const bAmount = allFinancialData
        .filter(income => 
          income.source_name === b.name && 
          income.month === month && 
          income.year === yearNum
        )
        .reduce((sum, income) => sum + parseFloat(income.amount || 0), 0);
      
      return bAmount - aAmount;
    });
  };

  // Helper function to calculate retention score from payment data
  const calculateRetentionScoreFromPayments = (totalPaid, invoiceCount) => {
    let score = 50; // Base score
    
    // Increase score based on total paid
    if (totalPaid > 50000) score += 30;
    else if (totalPaid > 20000) score += 20;
    else if (totalPaid > 10000) score += 15;
    else if (totalPaid > 5000) score += 10;
    else if (totalPaid > 0) score += 5;
    
    // Increase score based on invoice count (consistency)
    if (invoiceCount > 20) score += 20;
    else if (invoiceCount > 10) score += 15;
    else if (invoiceCount > 5) score += 10;
    else if (invoiceCount > 0) score += 5;
    
    return Math.min(score, 100);
  };

  // Helper function to get last payment date
  const getLastPaymentDate = (financialData) => {
    if (financialData.length === 0) return null;
    // This would need to be implemented based on your financial data structure
    return new Date().toISOString().split('T')[0];
  };



  // Generate real payment trends data from actual client data
  const generateRealPaymentTrends = (clients) => {
    // Since we don't have monthly breakdown from financial data, return empty array
    // This will show "No data available" instead of fake data
    return [];
  };

  // Generate real retention data from actual client data
  const generateRealRetentionData = (clients) => {
    // Since we don't have monthly retention data, return empty array
    // This will show "No data available" instead of fake data
    return [];
  };

  // Generate real monthly revenue from actual client data
  const generateRealMonthlyRevenue = (clients) => {
    // Since we don't have monthly breakdown from financial data, return empty array
    // This will show "No data available" instead of fake data
    return [];
  };

  // Calculate totals
  const getTotals = () => {
    // Use summary data for total income (like FinancialStatement does)
    const totalRevenue = summary.total_income || clientData.clients.reduce((sum, client) => sum + client.totalPaid, 0);
    const pendingAmount = 0; // No pending payments since we're using financial data directly
    const totalClients = clientData.clients.length;
    
    // Count clients who paid in the current month
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' }).toUpperCase();
    const currentYear = currentDate.getFullYear();
    
    // Count unique clients who have payments in the current month AND are marked as paid
    const currentMonthClients = new Set();
    allFinancialData.forEach(income => {
      if (income.month === currentMonth && income.year === currentYear) {
        // Find the client and check if they're marked as paid
        const client = clientData.clients.find(c => c.name === income.source_name);
        if (client && client.status === 'paid') {
          currentMonthClients.add(income.source_name);
        }
      }
    });
    
    const activeClients = currentMonthClients.size;
    
    // Count paid vs pending clients
    const paidClients = clientData.clients.filter(client => client.status === 'paid').length;
    const pendingClients = clientData.clients.filter(client => client.status === 'pending').length;
    
    return {
      totalRevenue,
      pendingAmount,
      totalClients,
      activeClients,
      paidClients,
      pendingClients
    };
  };

  // Filter and sort data
  const getFilteredAndSortedData = (data, searchTerm, status, sortBy, sortOrder, type) => {
    let filtered = data;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => {
        // Handle different data types (clients vs invoices)
        const searchFields = [
          item.name || item.clientName, // Client name
          item.displayName, // Display name
          item.company, // Company name
          item.description, // Description
          item.invoiceNumber, // Invoice number
          item.email, // Email
          item.phone // Phone
        ].filter(Boolean); // Remove undefined/null values
        
        return searchFields.some(field => 
          field.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }
    
    // Apply status filter
    if (status !== 'all') {
      filtered = filtered.filter(item => item.status === status);
    }
    
    // Apply type filter
    if (type === 'paid' && showPendingOnly) return [];
    if (type === 'pending' && showPaidOnly) return [];
    
    // Sort data
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'name':
          aVal = (a.name || a.clientName || '').toLowerCase();
          bVal = (b.name || b.clientName || '').toLowerCase();
          break;
        case 'date':
          aVal = new Date(a.dueDate || a.joinDate || 0);
          bVal = new Date(b.dueDate || b.joinDate || 0);
          break;
        case 'status':
          aVal = (a.status || '').toLowerCase();
          bVal = (b.status || '').toLowerCase();
          break;
        case 'amount':
        default:
          aVal = parseFloat(a.amount || a.totalPaid || 0);
          bVal = parseFloat(b.amount || b.totalPaid || 0);
          break;
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    return filtered;
  };

  const handleViewClient = (client) => {
    setSelectedClient(client);
    setShowViewClientModal(true);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setShowEditClientModal(true);
  };

  const handleUpdateClient = async () => {
    try {
      if (!editingClient) return;

      // For now, we'll just update the local state
      // In a real app, you'd make an API call to update the client
      setClientData(prev => ({
        ...prev,
        clients: prev.clients.map(client => 
          client.id === editingClient.id 
            ? { ...client, ...editingClient }
            : client
        )
      }));

      setShowEditClientModal(false);
      setEditingClient(null);
      alert('Client updated successfully!');
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Error updating client: ' + error.message);
    }
  };

  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
    setShowEditInvoiceModal(true);
  };

  const handleUpdateInvoice = async () => {
    try {
      if (!editingInvoice) return;

      // Update the invoice in the financial data
      setAllFinancialData(prev => 
        prev.map(income => {
          // Find the matching financial entry and update it
          if (income.source_name === editingInvoice.clientName && 
              income.month === editingInvoice.month && 
              income.year === editingInvoice.year) {
            return {
              ...income,
              amount: editingInvoice.amount.toString()
            };
          }
          return income;
        })
      );

      setShowEditInvoiceModal(false);
      setEditingInvoice(null);
      alert('Invoice updated successfully!');
      
      // Refresh the data to reflect changes
      fetchClientData();
    } catch (error) {
      console.error('Error updating invoice:', error);
      alert('Error updating invoice: ' + error.message);
    }
  };

  const handleAddClient = async () => {
    try {
      if (!newClient.name || !newClient.amount || !newClient.month || !newClient.year) {
        alert('Please fill in all required fields');
        return;
      }

      // Create a new financial entry
      const newFinancialEntry = {
        source_name: newClient.name,
        amount: parseFloat(newClient.amount),
        month: newClient.month,
        year: parseInt(newClient.year),
        category: 'AI Bot Service'
      };

      // Try to add via API
      try {
        const response = await fetch('https://juta-dev.ngrok.dev/api/financial/add-entry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'income',
            name: newClient.name,
            amount: parseFloat(newClient.amount),
            month: newClient.month,
            year: parseInt(newClient.year),
            category: 'AI Bot Service'
          }),
        });

        const result = await response.json();
        if (result.success) {
          // Refresh data after successful creation
          fetchClientData();
          alert('Client added successfully!');
        } else {
          throw new Error(result.error || 'Failed to add client');
        }
      } catch (apiError) {
        console.log('API not available, using local state update');
        // Fallback to local state update
        setAllFinancialData(prev => [...prev, newFinancialEntry]);
        alert('Client added (local update - API not available)');
      }

      setShowAddClientModal(false);
      setNewClient({
        name: '',
        amount: '',
        month: '',
        year: '',
        status: 'paid'
      });
    } catch (error) {
      console.error('Error adding client:', error);
      alert('Error adding client: ' + error.message);
    }
  };

  const handleAddInvoice = async () => {
    try {
      const client = clientData.clients.find(c => c.id === newInvoice.clientId);
      if (!client) {
        alert('Please select a valid client');
        return;
      }

      const invoiceData = {
        company_id: newInvoice.clientId,
        client_name: client.name,
        amount: parseFloat(newInvoice.amount),
        description: newInvoice.description,
        due_date: newInvoice.dueDate,
        service_type: newInvoice.serviceType,
        status: 'pending'
      };

      // Try to create invoice via API
      try {
        const response = await fetch('https://juta-dev.ngrok.dev/api/client-invoices', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invoiceData),
        });

        const result = await response.json();
        if (result.success) {
          // Refresh data after successful creation
          fetchClientData();
        } else {
          throw new Error(result.error || 'Failed to create invoice');
        }
      } catch (apiError) {
        console.log('API not available, using local state update');
        // Fallback to local state update if API is not available
        const newInvoiceData = {
          ...newInvoice,
          id: Date.now().toString(),
          invoiceNumber: `INV-2024-${String(clientData.invoices.length + 1).padStart(3, '0')}`,
          createdDate: new Date().toISOString().split('T')[0],
          clientName: client.name
        };

        setClientData(prev => ({
          ...prev,
          invoices: [...prev.invoices, newInvoiceData]
        }));
      }

      setShowAddModal(false);
      setNewInvoice({
        clientId: '',
        amount: '',
        description: '',
        dueDate: '',
        status: 'pending',
        serviceType: 'AI Bot Service'
      });
    } catch (error) {
      console.error('Error adding invoice:', error);
      alert('Error creating invoice: ' + error.message);
    }
  };

  const handleMarkAsPaid = async (invoiceId) => {
    try {
      // Find the invoice in the generated invoices list
      const allInvoices = allFinancialData.map((income, index) => ({
        id: `invoice-${income.source_name}-${income.month}-${income.year}-${index}`,
        invoiceNumber: `INV-${income.year}-${String(index + 1).padStart(4, '0')}`,
        clientName: income.source_name,
        amount: parseFloat(income.amount || 0),
        description: `AI Bot Service - ${income.month} ${income.year}`,
        dueDate: new Date(income.year, getMonthIndex(income.month), 15).toISOString().split('T')[0],
        serviceType: 'AI Bot Service',
        status: getPaymentStatus(income.source_name),
        createdDate: new Date(income.year, getMonthIndex(income.month), 1).toISOString().split('T')[0],
        paidDate: getPaymentStatus(income.source_name) === 'paid' ? new Date(income.year, getMonthIndex(income.month), 20).toISOString().split('T')[0] : null,
        month: income.month,
        year: income.year
      }));

      const invoice = allInvoices.find(inv => inv.id === invoiceId);
      if (!invoice) {
        alert('Invoice not found');
        return;
      }

      // Update the client status to 'paid' in the client data
      setClientData(prev => ({
        ...prev,
        clients: prev.clients.map(client => 
          client.name === invoice.clientName 
            ? { ...client, status: 'paid' }
            : client
        )
      }));

      alert('Invoice marked as paid! Client status updated to paid.');
      
      // Refresh the data to reflect changes
      fetchClientData();
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      alert('Error updating invoice: ' + error.message);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading client analytics...</p>
      </div>
    );
  }

  const totals = getTotals();

  return (
    <div className="client-analytics-container">
      {/* Quick Stats Bar */}
      <div className="quick-stats-bar">
        <div className="quick-stat">
          <div className="quick-stat-content">
            <div className="quick-stat-value">RM {totals.totalRevenue.toLocaleString()}</div>
            <div className="quick-stat-label">Total Income</div>
          </div>
        </div>
        <div className="quick-stat">
          <div className="quick-stat-content">
            <div className="quick-stat-value">{totals.paidClients}</div>
            <div className="quick-stat-label">Paid Clients</div>
          </div>
        </div>
        <div className="quick-stat">
          <div className="quick-stat-content">
            <div className="quick-stat-value">{totals.pendingClients}</div>
            <div className="quick-stat-label">Pending Clients</div>
          </div>
        </div>
        <div className="quick-stat">
          <div className="quick-stat-content">
            <div className="quick-stat-value">{totals.activeClients}</div>
            <div className="quick-stat-label">Active This Month</div>
          </div>
        </div>
        <div className="quick-stat">
          <div className="quick-stat-content">
            <div className="quick-stat-value">{totals.totalClients}</div>
            <div className="quick-stat-label">Total Clients</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        <button 
          className={`nav-tab ${viewMode === 'overview' ? 'active' : ''}`}
          onClick={() => setViewMode('overview')}
        >
          <BarChart3 size={16} />
          Overview
        </button>
        <button 
          className={`nav-tab ${viewMode === 'clients' ? 'active' : ''}`}
          onClick={() => setViewMode('clients')}
        >
          <Users size={16} />
          Clients
        </button>
        <button 
          className={`nav-tab ${viewMode === 'invoices' ? 'active' : ''}`}
          onClick={() => setViewMode('invoices')}
        >
          <FileText size={16} />
          Invoices
        </button>
       
      </div>

      {/* Overview Section */}
      {viewMode === 'overview' && (
        <div className="overview-section">
          {/* Payment Status Summary */}
          <div className="payment-status-summary">
            <h3>💰 Payment Status Overview</h3>
            <div className="status-cards">
              <div className="status-card paid">
                <div className="status-icon">✅</div>
                <div className="status-info">
                  <div className="status-count">{totals.paidClients}</div>
                  <div className="status-label">Paid Clients</div>
                  <div className="status-percentage">
                    {((totals.paidClients / totals.totalClients) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="status-card pending">
                <div className="status-icon">⏳</div>
                <div className="status-info">
                  <div className="status-count">{totals.pendingClients}</div>
                  <div className="status-label">Pending Clients</div>
                  <div className="status-percentage">
                    {((totals.pendingClients / totals.totalClients) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="status-card active">
                <div className="status-icon">📈</div>
                <div className="status-info">
                  <div className="status-count">{totals.activeClients}</div>
                  <div className="status-label">Active This Month</div>
                  <div className="status-percentage">
                    {((totals.activeClients / totals.totalClients) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* This Month's Clients */}
          <div className="this-month-clients">
            <div className="section-header-with-controls">
              <h3>📅 Payment Status by Month</h3>
              <div className="month-selector-controls">
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="month-selector"
                >
                  <option value="">All Time</option>
                  {getAvailableMonths().map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="month-clients-grid">
              {/* Paying Clients */}
              <div className="month-clients-section">
                <div className="section-header">
                  <h4>✅ Paid Clients {selectedMonth ? `(${selectedMonth})` : '(All Time)'}</h4>
                  <span className="count-badge">
                    {selectedMonth 
                      ? getPaidClientsForMonth(selectedMonth).length 
                      : clientData.clients.filter(client => client.status === 'paid').length
                    }
                  </span>
                </div>
                <div className="clients-list">
                  {(() => {
                    const paidClients = selectedMonth 
                      ? getPaidClientsForMonth(selectedMonth)
                      : clientData.clients
                          .filter(client => client.status === 'paid')
                          .sort((a, b) => b.totalPaid - a.totalPaid);
                    
                    return paidClients.map(client => (
                      <div key={client.id} className="client-item paid">
                        <div className="client-avatar">
                          <Building size={16} />
                        </div>
                        <div className="client-info">
                          <div className="client-name">{client.displayName || client.name}</div>
                          <div className="client-amount">
                            {selectedMonth ? (
                              // Show amount for selected month
                              `RM ${allFinancialData
                                .filter(income => {
                                  const [month, year] = selectedMonth.split(' ');
                                  return income.source_name === client.name && 
                                         income.month === month && 
                                         income.year === parseInt(year);
                                })
                                .reduce((sum, income) => sum + parseFloat(income.amount || 0), 0)
                                .toLocaleString()} (${selectedMonth})`
                            ) : (
                              // Show total amount
                              `RM ${client.totalPaid.toLocaleString()} (Total)`
                            )}
                          </div>
                        </div>
                        <div className="status-indicator paid">✅</div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Pending Clients */}
              <div className="month-clients-section">
                <div className="section-header">
                  <h4>⏳ Pending Payment Clients {selectedMonth ? `(${selectedMonth})` : '(All Time)'}</h4>
                  <span className="count-badge">
                    {selectedMonth 
                      ? getPendingClientsForMonth(selectedMonth).length 
                      : clientData.clients.filter(client => client.status === 'pending').length
                    }
                  </span>
                </div>
                <div className="clients-list">
                  {(() => {
                    const pendingClients = selectedMonth 
                      ? getPendingClientsForMonth(selectedMonth)
                      : clientData.clients
                          .filter(client => client.status === 'pending')
                          .sort((a, b) => b.totalPaid - a.totalPaid);
                    
                    console.log(`Pending clients for ${selectedMonth || 'all'}:`, pendingClients.length);
                    console.log('Pending client names:', pendingClients.map(c => c.name));
                    
                    return pendingClients.map(client => (
                      <div key={client.id} className="client-item pending">
                        <div className="client-avatar">
                          <Building size={16} />
                        </div>
                        <div className="client-info">
                          <div className="client-name">{client.displayName || client.name}</div>
                          <div className="client-amount">
                            {selectedMonth ? (
                              // Show amount for selected month
                              `RM ${allFinancialData
                                .filter(income => {
                                  const [month, year] = selectedMonth.split(' ');
                                  return income.source_name === client.name && 
                                         income.month === month && 
                                         income.year === parseInt(year);
                                })
                                .reduce((sum, income) => sum + parseFloat(income.amount || 0), 0)
                                .toLocaleString()} (${selectedMonth})`
                            ) : (
                              // Show total amount
                              `RM ${client.totalPaid.toLocaleString()} (Total)`
                            )}
                          </div>
                        </div>
                        <div className="status-indicator pending">⏳</div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Top Clients Cards */}
          <div className="top-clients-section">
            <h3>🏆 Top Performing Clients</h3>
            <div className="clients-grid">
              {clientData.analytics.topPayingClients.map((client, index) => (
                <div key={client.id} className="client-card glassmorphic">
                  <div className="client-header">
                    <div className="client-rank">
                      {index === 0 && <Crown size={20} className="rank-icon gold" />}
                      {index === 1 && <Award size={20} className="rank-icon silver" />}
                      {index === 2 && <Award size={20} className="rank-icon bronze" />}
                      {index > 2 && <span className="rank-number">#{index + 1}</span>}
                    </div>
                    <div className="client-info">
                      <h4>{client.displayName || client.name}</h4>
                      <p className="client-company">{client.displayName || client.company}</p>
                    </div>
                    <div className="client-score">
                      <div className="score-circle">
                        <span>{client.retentionScore}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="client-stats">
                    <div className="stat-row">
                      <span className="stat-label">Total Paid:</span>
                      <span className="stat-value positive">RM {client.totalPaid.toLocaleString()}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Invoices:</span>
                      <span className="stat-value">{client.totalInvoices}</span>
                    </div>

                    <div className="stat-row">
                      <span className="stat-label">Member Since:</span>
                      <span className="stat-value">{client.joinDate ? new Date(client.joinDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                  <div className="client-services">
                    {client.services.map((service, idx) => (
                      <span key={idx} className="service-tag">{service}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-section">
            <div className="charts-grid">
              {/* Payment Trends Chart */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Payment Trends</h3>
                  <div className="chart-controls">
                    <button className="chart-btn">
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={clientData.analytics.paymentTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [`RM ${value.toLocaleString()}`, name]} />
                    <Area type="monotone" dataKey="paid" stackId="1" stroke="#00C49F" fill="#00C49F" />
                    <Area type="monotone" dataKey="pending" stackId="1" stroke="#FFBB28" fill="#FFBB28" />
                    <Area type="monotone" dataKey="overdue" stackId="1" stroke="#FF8042" fill="#FF8042" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Client Retention Chart */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Client Retention Rate</h3>
                  <div className="chart-controls">
                    <button className="chart-btn">
                      <TrendingUp size={16} />
                    </button>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={clientData.analytics.clientRetention}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, 'Retention Rate']} />
                    <Line type="monotone" dataKey="retention" stroke="#8884d8" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clients Section */}
      {viewMode === 'clients' && (
        <div className="clients-section">
          <div className="section-header">
            <h3>👥 All Clients</h3>
            <div className="header-actions">
              <div className="search-box">
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-pills">
                <button 
                  className={`filter-pill ${selectedStatus === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedStatus('all')}
                >
                  All
                </button>
                <button 
                  className={`filter-pill ${selectedStatus === 'paid' ? 'active' : ''}`}
                  onClick={() => setSelectedStatus('paid')}
                >
                  Paid
                </button>
                <button 
                  className={`filter-pill ${selectedStatus === 'pending' ? 'active' : ''}`}
                  onClick={() => setSelectedStatus('pending')}
                >
                  Pending
                </button>
              </div>
              <button className="add-btn" onClick={() => setShowAddClientModal(true)}>
                <Plus size={16} />
                Add Client
              </button>
            </div>
          </div>

          <div className="clients-table">
            {getFilteredAndSortedData(clientData.clients, searchTerm, selectedStatus, sortBy, sortOrder).map((client) => (
              <div key={client.id} className="client-row glassmorphic">
                <div className="client-avatar">
                  <Building size={24} />
                </div>
                <div className="client-details">
                  <div className="client-name">
                    <h4>{client.displayName || client.name}</h4>
                    <span 
                      className={`status-badge ${client.status} clickable`}
                      onClick={() => togglePaymentStatus(client.id)}
                      title="Click to toggle payment status"
                    >
                      {client.status}
                    </span>
                  </div>
                  <div className="client-contact">
                    <div className="contact-item">
                      <Mail size={14} />
                      <span>{client.email}</span>
                    </div>
                    <div className="contact-item">
                      <Phone size={14} />
                      <span>{client.phone}</span>
                    </div>
                    <div className="contact-item">
                      <MapPin size={14} />
                      <span>{client.address}</span>
                    </div>
                  </div>
                </div>
                <div className="client-metrics">
                  <div className="metric">
                    <span className="metric-label">Total Paid</span>
                    <span className="metric-value positive">RM {client.totalPaid.toLocaleString()}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Invoices</span>
                    <span className="metric-value">{client.totalInvoices}</span>
                  </div>
                
                  <div className="metric">
                    <span className="metric-label">Retention</span>
                    <span className="metric-value">{client.retentionScore}%</span>
                  </div>
                </div>
                <div className="client-actions">
                  <button className="action-btn" onClick={() => handleViewClient(client)} title="View Client">
                    <Eye size={16} />
                  </button>
                  <button className="action-btn" onClick={() => handleEditClient(client)} title="Edit Client">
                    <Edit3 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invoices Section */}
      {viewMode === 'invoices' && (
        <div className="invoices-section">
          <div className="section-header">
            <h3>📄 All Invoices</h3>
            <div className="header-actions">
              <div className="search-box">
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-pills">
                <button 
                  className={`filter-pill ${selectedStatus === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedStatus('all')}
                >
                  All
                </button>
                <button 
                  className={`filter-pill ${selectedStatus === 'paid' ? 'active' : ''}`}
                  onClick={() => setSelectedStatus('paid')}
                >
                  Paid
                </button>
                <button 
                  className={`filter-pill ${selectedStatus === 'pending' ? 'active' : ''}`}
                  onClick={() => setSelectedStatus('pending')}
                >
                  Pending
                </button>
                <button 
                  className={`filter-pill ${selectedStatus === 'overdue' ? 'active' : ''}`}
                  onClick={() => setSelectedStatus('overdue')}
                >
                  Overdue
                </button>
              </div>
              <button className="add-btn" onClick={() => setShowAddModal(true)}>
                <Plus size={16} />
                Create Invoice
              </button>
            </div>
          </div>

          <div className="invoices-table">
            {(() => {
              // Generate invoices from financial data (one invoice per payment entry)
              const allInvoices = allFinancialData.map((income, index) => ({
                id: `invoice-${income.source_name}-${income.month}-${income.year}-${index}`,
                invoiceNumber: `INV-${income.year}-${String(index + 1).padStart(4, '0')}`,
                clientName: income.source_name,
                amount: parseFloat(income.amount || 0),
                description: `AI Bot Service - ${income.month} ${income.year}`,
                dueDate: new Date(income.year, getMonthIndex(income.month), 15).toISOString().split('T')[0], // 15th of each month
                serviceType: 'AI Bot Service',
                status: getPaymentStatus(income.source_name), // Use the same status logic as clients
                createdDate: new Date(income.year, getMonthIndex(income.month), 1).toISOString().split('T')[0],
                paidDate: getPaymentStatus(income.source_name) === 'paid' ? new Date(income.year, getMonthIndex(income.month), 20).toISOString().split('T')[0] : null,
                month: income.month,
                year: income.year
              }));

              // Filter and sort invoices
              const filteredInvoices = getFilteredAndSortedData(allInvoices, searchTerm, selectedStatus, sortBy, sortOrder);

              console.log('All invoices generated:', allInvoices.length);
              console.log('Filtered invoices:', filteredInvoices.length);

              return filteredInvoices.map((invoice) => (
                <div key={invoice.id} className="invoice-row glassmorphic">
                  <div className="invoice-header">
                    <div className="invoice-info">
                      <h4>{invoice.invoiceNumber}</h4>
                      <span className="client-name">{invoice.clientName}</span>
                    </div>
                    <div className="invoice-status">
                      <span className={`status-badge ${invoice.status}`}>
                        {invoice.status === 'paid' && <CheckCircle size={14} />}
                        {invoice.status === 'pending' && <Clock size={14} />}
                        {invoice.status === 'overdue' && <AlertCircle size={14} />}
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                  <div className="invoice-details">
                    <div className="detail-item">
                      <span className="detail-label">Amount:</span>
                      <span className="detail-value">RM {invoice.amount.toLocaleString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Due Date:</span>
                      <span className="detail-value">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Service:</span>
                      <span className="detail-value">{invoice.serviceType}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Month:</span>
                      <span className="detail-value">{invoice.month} {invoice.year}</span>
                    </div>
                    {invoice.paidDate && (
                      <div className="detail-item">
                        <span className="detail-label">Paid Date:</span>
                        <span className="detail-value">{new Date(invoice.paidDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="invoice-description">
                    <p>{invoice.description}</p>
                  </div>
                  <div className="invoice-actions">
                    {invoice.status === 'pending' && (
                      <button 
                        className="action-btn success" 
                        onClick={() => handleMarkAsPaid(invoice.id)}
                        title="Mark as Paid"
                      >
                        <CheckCircle size={16} />
                        Mark as Paid
                      </button>
                    )}
                    <button 
                      className="action-btn" 
                      onClick={() => handleEditInvoice(invoice)}
                      title="Edit Invoice"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button className="action-btn" title="Download Invoice">
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

   

      {/* Add Invoice Modal */}
      {showAddModal && (
        <div className="modal-overlay-enhanced" onClick={() => setShowAddModal(false)}>
          <div className="modal-content-enhanced" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Create New Invoice</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-section">
                <h4>Invoice Details</h4>
                <div className="form-group-enhanced">
                  <label>Client *</label>
                  <select 
                    value={newInvoice.clientId}
                    onChange={(e) => setNewInvoice({...newInvoice, clientId: e.target.value})}
                    className="form-input"
                  >
                    <option value="">Select a client</option>
                    {clientData.clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group-enhanced">
                  <label>Amount (RM) *</label>
                  <div className="amount-input-group">
                    <span className="currency-symbol">RM</span>
                    <input 
                      type="number" 
                      value={newInvoice.amount}
                      onChange={(e) => setNewInvoice({...newInvoice, amount: e.target.value})}
                      placeholder="0.00"
                      step="0.01"
                      className="form-input amount-input"
                    />
                  </div>
                </div>

                <div className="form-group-enhanced">
                  <label>Service Type *</label>
                  <select 
                    value={newInvoice.serviceType}
                    onChange={(e) => setNewInvoice({...newInvoice, serviceType: e.target.value})}
                    className="form-input"
                  >
                    <option value="AI Bot Service">AI Bot Service</option>
                    <option value="Custom Development">Custom Development</option>
                    <option value="Marketing Automation">Marketing Automation</option>
                    <option value="Business Automation">Business Automation</option>
                    <option value="Customer Support Bot">Customer Support Bot</option>
                  </select>
                </div>

                <div className="form-group-enhanced">
                  <label>Due Date *</label>
                  <input 
                    type="date" 
                    value={newInvoice.dueDate}
                    onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                    className="form-input"
                  />
                </div>

                <div className="form-group-enhanced">
                  <label>Description</label>
                  <textarea 
                    value={newInvoice.description}
                    onChange={(e) => setNewInvoice({...newInvoice, description: e.target.value})}
                    placeholder="Describe the services provided..."
                    className="form-textarea"
                    rows={3}
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-actions-enhanced">
              <button className="btn-cancel" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button 
                className="btn-save" 
                onClick={handleAddInvoice}
                disabled={!newInvoice.clientId || !newInvoice.amount || !newInvoice.dueDate}
              >
                <Plus size={16} />
                Create Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Client Modal */}
      {showViewClientModal && selectedClient && (
        <div className="modal-overlay-enhanced" onClick={() => setShowViewClientModal(false)}>
          <div className="modal-content-enhanced" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>👁️ Client Details</h3>
              <button className="close-btn" onClick={() => setShowViewClientModal(false)}>
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-section">
                <h4>Client Information</h4>
                <div className="client-details-grid">
                  <div className="detail-row">
                    <span className="detail-label">Client Name:</span>
                    <span className="detail-value">{selectedClient.displayName || selectedClient.name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Company:</span>
                    <span className="detail-value">{selectedClient.company}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Total Paid:</span>
                    <span className="detail-value">RM {selectedClient.totalPaid.toLocaleString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Total Invoices:</span>
                    <span className="detail-value">{selectedClient.totalInvoices}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className={`status-badge ${selectedClient.status}`}>
                      {selectedClient.status}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Retention Score:</span>
                    <span className="detail-value">{selectedClient.retentionScore}%</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Member Since:</span>
                    <span className="detail-value">
                      {selectedClient.joinDate ? new Date(selectedClient.joinDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Services:</span>
                    <span className="detail-value">
                      {selectedClient.services ? selectedClient.services.join(', ') : 'AI Bot Service'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-actions-enhanced">
              <button className="btn-cancel" onClick={() => setShowViewClientModal(false)}>
                Close
              </button>
              <button className="btn-save" onClick={() => {
                setShowViewClientModal(false);
                handleEditClient(selectedClient);
              }}>
                <Edit3 size={16} />
                Edit Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditClientModal && editingClient && (
        <div className="modal-overlay-enhanced" onClick={() => setShowEditClientModal(false)}>
          <div className="modal-content-enhanced" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Edit Client</h3>
              <button className="close-btn" onClick={() => setShowEditClientModal(false)}>
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-section">
                <h4>Client Information</h4>
                <div className="form-group-enhanced">
                  <label>Client Name</label>
                  <input 
                    type="text" 
                    value={editingClient.displayName || editingClient.name}
                    onChange={(e) => setEditingClient({...editingClient, name: e.target.value})}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group-enhanced">
                  <label>Company</label>
                  <input 
                    type="text" 
                    value={editingClient.company}
                    onChange={(e) => setEditingClient({...editingClient, company: e.target.value})}
                    className="form-input"
                  />
                </div>

                <div className="form-group-enhanced">
                  <label>Total Paid (RM)</label>
                  <div className="amount-input-group">
                    <span className="currency-symbol">RM</span>
                    <input 
                      type="number" 
                      value={editingClient.totalPaid}
                      onChange={(e) => setEditingClient({...editingClient, totalPaid: parseFloat(e.target.value) || 0})}
                      className="form-input amount-input"
                    />
                  </div>
                </div>

                <div className="form-group-enhanced">
                  <label>Total Invoices</label>
                  <input 
                    type="number" 
                    value={editingClient.totalInvoices}
                    onChange={(e) => setEditingClient({...editingClient, totalInvoices: parseInt(e.target.value) || 0})}
                    className="form-input"
                  />
                </div>

                <div className="form-group-enhanced">
                  <label>Payment Status</label>
                  <select 
                    value={editingClient.status}
                    onChange={(e) => setEditingClient({...editingClient, status: e.target.value})}
                    className="form-input"
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div className="form-group-enhanced">
                  <label>Retention Score (%)</label>
                  <input 
                    type="number" 
                    value={editingClient.retentionScore}
                    onChange={(e) => setEditingClient({...editingClient, retentionScore: parseInt(e.target.value) || 0})}
                    min="0"
                    max="100"
                    className="form-input"
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-actions-enhanced">
              <button className="btn-cancel" onClick={() => setShowEditClientModal(false)}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleUpdateClient}>
                <Edit3 size={16} />
                Update Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Invoice Modal */}
      {showEditInvoiceModal && editingInvoice && (
        <div className="modal-overlay-enhanced" onClick={() => setShowEditInvoiceModal(false)}>
          <div className="modal-content-enhanced" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Edit Invoice</h3>
              <button className="close-btn" onClick={() => setShowEditInvoiceModal(false)}>
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-section">
                <h4>Invoice Information</h4>
                <div className="form-group-enhanced">
                  <label>Invoice Number</label>
                  <input 
                    type="text" 
                    value={editingInvoice.invoiceNumber}
                    className="form-input"
                    readOnly
                  />
                </div>
                
                <div className="form-group-enhanced">
                  <label>Client Name</label>
                  <input 
                    type="text" 
                    value={editingInvoice.clientName}
                    className="form-input"
                    readOnly
                  />
                </div>

                <div className="form-group-enhanced">
                  <label>Amount (RM) *</label>
                  <div className="amount-input-group">
                    <span className="currency-symbol">RM</span>
                    <input 
                      type="number" 
                      value={editingInvoice.amount}
                      onChange={(e) => setEditingInvoice({...editingInvoice, amount: parseFloat(e.target.value) || 0})}
                      className="form-input amount-input"
                    />
                  </div>
                </div>

                <div className="form-group-enhanced">
                  <label>Service Type</label>
                  <select 
                    value={editingInvoice.serviceType}
                    onChange={(e) => setEditingInvoice({...editingInvoice, serviceType: e.target.value})}
                    className="form-input"
                  >
                    <option value="AI Bot Service">AI Bot Service</option>
                    <option value="Custom Development">Custom Development</option>
                    <option value="Marketing Automation">Marketing Automation</option>
                    <option value="Business Automation">Business Automation</option>
                    <option value="Customer Support Bot">Customer Support Bot</option>
                  </select>
                </div>

                <div className="form-group-enhanced">
                  <label>Due Date</label>
                  <input 
                    type="date" 
                    value={editingInvoice.dueDate}
                    onChange={(e) => setEditingInvoice({...editingInvoice, dueDate: e.target.value})}
                    className="form-input"
                  />
                </div>

                <div className="form-group-enhanced">
                  <label>Status</label>
                  <select 
                    value={editingInvoice.status}
                    onChange={(e) => setEditingInvoice({...editingInvoice, status: e.target.value})}
                    className="form-input"
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>

                <div className="form-group-enhanced">
                  <label>Description</label>
                  <textarea 
                    value={editingInvoice.description}
                    onChange={(e) => setEditingInvoice({...editingInvoice, description: e.target.value})}
                    className="form-textarea"
                    rows={3}
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-actions-enhanced">
              <button className="btn-cancel" onClick={() => setShowEditInvoiceModal(false)}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleUpdateInvoice}>
                <Edit3 size={16} />
                Update Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddClientModal && (
        <div className="modal-overlay-enhanced" onClick={() => setShowAddClientModal(false)}>
          <div className="modal-content-enhanced" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Add New Client</h3>
              <button className="close-btn" onClick={() => setShowAddClientModal(false)}>
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-section">
                <h4>Client Information</h4>
                <div className="form-group-enhanced">
                  <label>Client Name *</label>
                  <input 
                    type="text" 
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    placeholder="e.g., ABC Company"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group-enhanced">
                  <label>Payment Amount (RM) *</label>
                  <div className="amount-input-group">
                    <span className="currency-symbol">RM</span>
                    <input 
                      type="number" 
                      value={newClient.amount}
                      onChange={(e) => setNewClient({...newClient, amount: e.target.value})}
                      placeholder="0.00"
                      step="0.01"
                      className="form-input amount-input"
                    />
                  </div>
                </div>

                <div className="form-group-enhanced">
                  <label>Payment Month *</label>
                  <select 
                    value={newClient.month}
                    onChange={(e) => setNewClient({...newClient, month: e.target.value})}
                    className="form-input"
                  >
                    <option value="">Select Month</option>
                    <option value="JANUARY">January</option>
                    <option value="FEBRUARY">February</option>
                    <option value="MARCH">March</option>
                    <option value="APRIL">April</option>
                    <option value="MAY">May</option>
                    <option value="JUNE">June</option>
                    <option value="JULY">July</option>
                    <option value="AUGUST">August</option>
                    <option value="SEPTEMBER">September</option>
                    <option value="OCTOBER">October</option>
                    <option value="NOVEMBER">November</option>
                    <option value="DECEMBER">December</option>
                  </select>
                </div>

                <div className="form-group-enhanced">
                  <label>Payment Year *</label>
                  <input 
                    type="number" 
                    value={newClient.year}
                    onChange={(e) => setNewClient({...newClient, year: e.target.value})}
                    placeholder="2025"
                    min="2020"
                    max="2030"
                    className="form-input"
                  />
                </div>

                <div className="form-group-enhanced">
                  <label>Payment Status</label>
                  <select 
                    value={newClient.status}
                    onChange={(e) => setNewClient({...newClient, status: e.target.value})}
                    className="form-input"
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="modal-actions-enhanced">
              <button className="btn-cancel" onClick={() => setShowAddClientModal(false)}>
                Cancel
              </button>
              <button 
                className="btn-save" 
                onClick={handleAddClient}
                disabled={!newClient.name || !newClient.amount || !newClient.month || !newClient.year}
              >
                <Plus size={16} />
                Add Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientAnalytics;
