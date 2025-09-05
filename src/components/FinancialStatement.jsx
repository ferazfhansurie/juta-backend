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
  Line
} from 'recharts';
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
  XCircle
} from 'lucide-react';

const FinancialStatement = () => {
  const [financialData, setFinancialData] = useState({
    months: [],
    income: {},
    expenses: {},
    expenseCategories: {
      'MARKETING': [
        'FACEBOOK AD', 'MAKE', 'GO HIGH LEVEL', 'OPEN AI', 'WHAPI', 'XGROK',
        'CHAT-GPT', 'GOOGLE CLOUD', 'GO DADDY', 'VERCEL', 'UNIFI'
      ],
      'ELECTRONICS': [
        'Laptop M2 Mac 8gb', 'CPU', 'RAM', 'COMPUTER', 'Type C Adapter', 'APPLIANCES', 'Server repair'
      ],
      'TRANSPORT': [
        'Petrol', 'Grab/InDrive', 'Car repair'
      ],
      'MANAGEMENT': [
        'firaz', 'Faeez', 'Scott', 'Rais', 'shafiq', 'jullien', 'Farah', 'Idlan', 'Zain'
      ],
      'OFFICE': [
        'CONDO', 'OFFICE', 'RENT', 'OFFICE SPACE'
      ],
      'ASSET': [
        'Macbook', 'Legal', 'FIVER'
      ],
      'SALARY': [
        'FT SOFTWARE DEVELOPER', 'PT SOFTWARE DEVELOPERS', 'CUSTOMER SERVICE', 'UI/UX DESIGNER', 'INTERN'
      ]
    },
    incomeSources: [
      'A.I BOT 1 - MONTHLY', 'A.I BOT 2 - MONTHLY', 'A.I BOT 3 - MONTHLY', 'A.I BOT 4 - MONTHLY',
      'A.I BOT 5 - MONTHLY', 'A.I BOT 6 - MONTHLY', 'A.I BOT 7 - MONTHLY', 'A.I BOT 8 - MONTHLY',
      'A.I BOT 9 - MONTHLY', 'TD-LABS - MONTHLY', 'GL A.I BOT 6 - MONTHLY', 'BHQ A.I BOT 5 - MONTHLY',
      'TTC A.I BOT 9 - MONTHLY', 'AQ A.I BOT 7 - MONTHLY', 'ARUL A.I BOT 3 - MONTHLY',
      'CNB - MONTHLY', 'MSU', 'ZAHIN TRAVEL', 'BINA', 'VISTA', 'HAJOON', 'NTRM', 'DESITE CREATION',
      'BILLERT GROUP', 'Alist', 'Eduville', 'Revotrend', 'Mata Sight', 'Finesse Clinic', 'Kyra Beauty',
      'SKC', 'Barokah Aircond', 'Ariffaz Creative', 'SS Power Automobile', 'BookingCarCare',
      'Trading indicator', 'LG agent', 'LKSSB', 'MTDC', 'WT Lim', 'Callabio', 'MJBI', 'Bestari',
      'ROBIN', 'Inntech', 'NSI', 'Dr Leaking', 'Adwa', 'FitPropella', 'All Spark', 'Gifted Media',
      'DC - Ceramine', 'Trading AI', 'jamu mami', 'proton', 'kabinet', 'MSO network', 'synergy',
      'carsome', 'MY ANGKASA', 'Tenggara', 'Mb biz', 'DC - Job', 'DC - lilyng', 'Haiqal',
      'My. HomeTown', 'CNB - Admin', 'DC - matt', 'MyHomeTown', 'HK', 'Zaqhwan', 'Allspark',
      'Alist Database', 'Luzea', 'HGSB', 'SOLUTDECK', 'DEPOSIT BACK', 'DM AI 3', 'Kaiwen'
    ]
  });

  const [selectedMonth, setSelectedMonth] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newEntry, setNewEntry] = useState({
    type: 'expense',
    name: '',
    amount: '',
    category: 'MARKETING',
    description: ''
  });
  const [viewMode, setViewMode] = useState('overview'); // overview, monthly, yearly, category
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);
  const [incomeSources, setIncomeSources] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [summary, setSummary] = useState({});
  const [categoriesSummary, setCategoriesSummary] = useState([]);
  const [showDetails, setShowDetails] = useState(true);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('amount'); // amount, name, category
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [showIncomeOnly, setShowIncomeOnly] = useState(false);
  const [showExpensesOnly, setShowExpensesOnly] = useState(false);

  // Fetch data from database
  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      
      // Fetch monthly data
      const monthlyResponse = await fetch('https://juta-dev.ngrok.dev/api/financial/monthly-data');
      const monthlyResult = await monthlyResponse.json();
      
      if (monthlyResult.success) {
        setMonthlyData(monthlyResult.data);
        
        // Transform data for charts
        const months = monthlyResult.data.map(item => `${item.month} ${item.year}`);
        const income = {};
        const expenses = {};
        
        monthlyResult.data.forEach(item => {
          const monthKey = `${item.month} ${item.year}`;
          income[monthKey] = parseFloat(item.total_income);
          expenses[monthKey] = parseFloat(item.total_expenses);
        });
        
        setFinancialData(prev => ({
          ...prev,
          months,
          income,
          expenses
        }));
        
        if (months.length > 0) {
          // Set to the most recent month available
          setSelectedMonth(months[months.length - 1]);
        }
      }

      // Fetch summary
      const summaryResponse = await fetch('https://juta-dev.ngrok.dev/api/financial/summary');
      const summaryResult = await summaryResponse.json();
      if (summaryResult.success) {
        setSummary(summaryResult.summary);
      }

      // Fetch categories summary
      const categoriesResponse = await fetch('https://juta-dev.ngrok.dev/api/financial/categories-summary');
      const categoriesResult = await categoriesResponse.json();
      if (categoriesResult.success) {
        setCategoriesSummary(categoriesResult.data);
      }

    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIncomeSources = async (month, year) => {
    try {
      const response = await fetch(`https://juta-dev.ngrok.dev/api/financial/income-sources?month=${month}&year=${year}`);
      const result = await response.json();
      if (result.success) {
        setIncomeSources(result.data);
      }
    } catch (error) {
      console.error('Error fetching income sources:', error);
    }
  };

  const fetchExpenseCategories = async (month, year) => {
    try {
      const response = await fetch(`https://juta-dev.ngrok.dev/api/financial/expense-categories?month=${month}&year=${year}`);
      const result = await response.json();
      if (result.success) {
        setExpenseCategories(result.data);
      }
    } catch (error) {
      console.error('Error fetching expense categories:', error);
    }
  };

  // Fetch detailed data when month changes
  useEffect(() => {
    if (selectedMonth) {
      const [month, year] = selectedMonth.split(' ');
      fetchIncomeSources(month, year);
      fetchExpenseCategories(month, year);
    }
  }, [selectedMonth]);

  // Calculate budget (income - expenses) for each month
  const getBudgetData = () => {
    return financialData.months.map(month => ({
      month,
      income: financialData.income[month] || 0,
      expenses: financialData.expenses[month] || 0,
      budget: (financialData.income[month] || 0) - (financialData.expenses[month] || 0)
    }));
  };

  // Calculate totals
  const getTotals = () => {
    const totalIncome = Object.values(financialData.income).reduce((sum, val) => sum + val, 0);
    const totalExpenses = Object.values(financialData.expenses).reduce((sum, val) => sum + val, 0);
    return {
      income: totalIncome,
      expenses: totalExpenses,
      budget: totalIncome - totalExpenses
    };
  };

  // Get yearly summary
  const getYearlySummary = () => {
    const yearlyData = {};
    monthlyData.forEach(item => {
      if (!yearlyData[item.year]) {
        yearlyData[item.year] = {
          income: 0,
          expenses: 0,
          budget: 0
        };
      }
      yearlyData[item.year].income += parseFloat(item.total_income);
      yearlyData[item.year].expenses += parseFloat(item.total_expenses);
      yearlyData[item.year].budget += parseFloat(item.net_budget);
    });
    return yearlyData;
  };

  // Get category breakdown
  const getCategoryBreakdown = () => {
    return categoriesSummary.map(cat => ({
      name: cat.category,
      value: parseFloat(cat.total_amount)
    }));
  };

  // Get current month data
  const getCurrentMonthData = () => {
    const currentDate = new Date();
    const currentMonthName = currentDate.toLocaleString('default', { month: 'long' }).toUpperCase();
    const currentYear = currentDate.getFullYear();
    
    // First try to find the actual current month
    const currentMonth = monthlyData.find(item => 
      item.month === currentMonthName && item.year === currentYear
    );
    
    // If current month doesn't exist, return the most recent month available
    return currentMonth || monthlyData[monthlyData.length - 1];
  };

  // Get recent months (last 6 months)
  const getRecentMonths = () => {
    return monthlyData.slice(-6).reverse();
  };

  // Helper function to get better labels for items
  const getItemLabel = (item) => {
    const name = item.source_name || item.item_name || '';
    
    // Employee salary patterns
    if (name.toLowerCase().includes('salary') || 
        name.toLowerCase().includes('firaz') || 
        name.toLowerCase().includes('faeez') || 
        name.toLowerCase().includes('scott') || 
        name.toLowerCase().includes('jullien') ||
        name.toLowerCase().includes('idlan') ||
        name.toLowerCase().includes('farah') ||
        name.toLowerCase().includes('zain')) {
      return `👤 ${name} (Employee Salary)`;
    }
    
    // EPF contributions
    if (name.toLowerCase().includes('epf') || name.toLowerCase().includes('sosco')) {
      return `💼 ${name} (EPF/Social Security)`;
    }
    
    // Marketing expenses
    if (name.toLowerCase().includes('facebook') || 
        name.toLowerCase().includes('marketing') ||
        name.toLowerCase().includes('ads')) {
      return `📢 ${name} (Marketing)`;
    }
    
    // Technology/Software
    if (name.toLowerCase().includes('vercel') || 
        name.toLowerCase().includes('open ai') ||
        name.toLowerCase().includes('chat-gpt') ||
        name.toLowerCase().includes('cursor') ||
        name.toLowerCase().includes('google cloud') ||
        name.toLowerCase().includes('xgrok') ||
        name.toLowerCase().includes('whapi')) {
      return `💻 ${name} (Technology)`;
    }
    
    // Office/Infrastructure
    if (name.toLowerCase().includes('office') || 
        name.toLowerCase().includes('rent') ||
        name.toLowerCase().includes('condo')) {
      return `🏢 ${name} (Office/Infrastructure)`;
    }
    
    // Transport
    if (name.toLowerCase().includes('petrol') || 
        name.toLowerCase().includes('grab') ||
        name.toLowerCase().includes('transport')) {
      return `🚗 ${name} (Transport)`;
    }
    
    // Assets/Equipment
    if (name.toLowerCase().includes('laptop') || 
        name.toLowerCase().includes('computer') ||
        name.toLowerCase().includes('macbook') ||
        name.toLowerCase().includes('server')) {
      return `🖥️ ${name} (Assets/Equipment)`;
    }
    
    // AI Bot income
    if (name.toLowerCase().includes('bot') || 
        name.toLowerCase().includes('ai') ||
        name.toLowerCase().includes('monthly')) {
      return `🤖 ${name} (AI Bot Service)`;
    }
    
    // Client services
    if (name.toLowerCase().includes('desite') || 
        name.toLowerCase().includes('creation') ||
        name.toLowerCase().includes('whitelabel')) {
      return `🎨 ${name} (Client Services)`;
    }
    
    // Default
    return `💰 ${name}`;
  };

  // Helper function to get category color
  const getCategoryColor = (category) => {
    const colors = {
      'MANAGEMENT': '#FF6B6B',
      'MARKETING': '#4ECDC4', 
      'ELECTRONICS': '#45B7D1',
      'TRANSPORT': '#96CEB4',
      'OFFICE': '#FFEAA7',
      'ASSET': '#DDA0DD',
      'SALARY': '#FF7675',
      'TECHNOLOGY': '#74B9FF',
      'CLIENT_SERVICES': '#A29BFE',
      'AI_SERVICES': '#6C5CE7'
    };
    return colors[category] || '#95A5A6';
  };

  // Filter and sort data
  const getFilteredAndSortedData = (data, searchTerm, category, sortBy, sortOrder, type) => {
    let filtered = data;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.source_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (category !== 'all') {
      filtered = filtered.filter(item => item.category === category);
    }
    
    // Apply type filter
    if (type === 'income' && showExpensesOnly) return [];
    if (type === 'expense' && showIncomeOnly) return [];
    
    // Sort data
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'name':
          aVal = (a.source_name || a.item_name || '').toLowerCase();
          bVal = (b.source_name || b.item_name || '').toLowerCase();
          break;
        case 'category':
          aVal = (a.category || '').toLowerCase();
          bVal = (b.category || '').toLowerCase();
          break;
        case 'amount':
        default:
          aVal = parseFloat(a.amount);
          bVal = parseFloat(b.amount);
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

  // Get monthly trend data
  const getMonthlyTrendData = () => {
    return monthlyData.slice(-12).map(item => ({
      month: `${item.month} ${item.year}`,
      income: parseFloat(item.total_income),
      expenses: parseFloat(item.total_expenses),
      net: parseFloat(item.net_budget)
    }));
  };

  const handleAddEntry = async () => {
    try {
      const [month, year] = selectedMonth.split(' ');
      const response = await fetch('https://juta-dev.ngrok.dev/api/financial/add-entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newEntry,
          month,
          year: parseInt(year),
          amount: parseFloat(newEntry.amount)
        }),
      });

      const result = await response.json();
      if (result.success) {
        setShowAddModal(false);
        setNewEntry({
          type: 'expense',
          name: '',
          amount: '',
          category: 'MARKETING',
          description: ''
        });
        // Refresh data
        fetchFinancialData();
        fetchIncomeSources(month, year);
        fetchExpenseCategories(month, year);
      }
    } catch (error) {
      console.error('Error adding entry:', error);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading financial data...</p>
      </div>
    );
  }

  return (
    <div className="financial-statement-container">


      {/* Quick Stats Bar */}
      <div className="quick-stats-bar">
        <div className="quick-stat">
         
          <div className="quick-stat-content">
            <div className="quick-stat-value">RM {summary.total_income?.toLocaleString() || 0}</div>
            <div className="quick-stat-label">Total Income</div>
          </div>
        </div>
        <div className="quick-stat">
         
          <div className="quick-stat-content">
            <div className="quick-stat-value">RM {summary.total_expenses?.toLocaleString() || 0}</div>
            <div className="quick-stat-label">Total Expenses</div>
          </div>
        </div>
        <div className="quick-stat">
         
          <div className="quick-stat-content">
            <div className={`quick-stat-value ${summary.net_budget >= 0 ? 'positive' : 'negative'}`}>
              RM {summary.net_budget?.toLocaleString() || 0}
            </div>
            <div className="quick-stat-label">Net Budget</div>
          </div>
        </div>
        <div className="quick-stat">
        
          <div className="quick-stat-content">
            <div className="quick-stat-value">{summary.months_count || 0}</div>
            <div className="quick-stat-label">Months Tracked</div>
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
          className={`nav-tab ${viewMode === 'monthly' ? 'active' : ''}`}
          onClick={() => setViewMode('monthly')}
        >
          <Calendar size={16} />
          Monthly Details
        </button>
        <button 
          className={`nav-tab ${viewMode === 'yearly' ? 'active' : ''}`}
          onClick={() => setViewMode('yearly')}
        >
          <TrendingUp size={16} />
          Yearly Summary
        </button>
        <button 
          className={`nav-tab ${viewMode === 'category' ? 'active' : ''}`}
          onClick={() => setViewMode('category')}
        >
          <Filter size={16} />
          Categories
        </button>
      </div>

      {/* Overview Section */}
      {viewMode === 'overview' && (
        <div className="overview-section">
          {/* Current Month Highlight */}
          <div className="current-month-card">
            <div className="current-month-header">
              <h3>Current Month Performance</h3>
         
            </div>
            <div className="current-month-stats">
              {(() => {
                const currentData = monthlyData.find(item => 
                  `${item.month} ${item.year}` === selectedMonth
                );
                if (!currentData) return <div>No data for selected month</div>;
                
                return (
                  <>
                    <div className="current-stat">
                      <div className="current-stat-label">Income</div>
                      <div className="current-stat-value positive">
                        RM {parseFloat(currentData.total_income).toLocaleString()}
                      </div>
                    </div>
                    <div className="current-stat">
                      <div className="current-stat-label">Expenses</div>
                      <div className="current-stat-value negative">
                        RM {parseFloat(currentData.total_expenses).toLocaleString()}
                      </div>
                    </div>
                    <div className="current-stat">
                      <div className="current-stat-label">Net Budget</div>
                      <div className={`current-stat-value ${parseFloat(currentData.net_budget) >= 0 ? 'positive' : 'negative'}`}>
                        RM {parseFloat(currentData.net_budget).toLocaleString()}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* All Months Grid */}
          <div className="all-months-grid">
            <h3>All Months Performance</h3>
            <div className="months-grid">
              {monthlyData.map((month, index) => (
                <div key={index} className="month-card glassmorphic">
                  <div className="month-header">
                    <h4>{month.month} {month.year}</h4>
                    <div className={`month-status ${parseFloat(month.net_budget) >= 0 ? 'positive' : 'negative'}`}>
                      {parseFloat(month.net_budget) >= 0 ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    </div>
                  </div>
                  <div className="month-stats">
                    <div className="month-stat">
                      <span className="month-stat-label">Income:</span>
                      <span className="month-stat-value">RM {parseFloat(month.total_income).toLocaleString()}</span>
                    </div>
                    <div className="month-stat">
                      <span className="month-stat-label">Expenses:</span>
                      <span className="month-stat-value">RM {parseFloat(month.total_expenses).toLocaleString()}</span>
                    </div>
                    <div className="month-stat total">
                      <span className="month-stat-label">Net:</span>
                      <span className={`month-stat-value ${parseFloat(month.net_budget) >= 0 ? 'positive' : 'negative'}`}>
                        RM {parseFloat(month.net_budget).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      {/* Monthly Details - Ultra Modern Design */}
      {viewMode === 'monthly' && (
        <div className="monthly-details-ultra">
          {/* Compact Header */}
          <div className="monthly-header-ultra">
            <div className="header-compact">
              <div className="month-selector-compact">
                <Calendar size={18} />
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="month-select-ultra"
                >
                  {financialData.months.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
              <button className="add-btn-ultra" onClick={() => setShowAddModal(true)}>
                <Plus size={16} />
                Add Item
              </button>
            </div>

            {/* Compact Filters */}
            <div className="filters-compact">
              <div className="search-compact">
                <Search size={14} />
                <input 
                  type="text" 
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input-ultra"
                />
              </div>
              
              <div className="filter-pills">
                <button 
                  className={`filter-pill ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  All
                </button>
                {['MANAGEMENT', 'MARKETING', 'TECHNOLOGY', 'TRANSPORT', 'OFFICE'].map(cat => (
                  <button 
                    key={cat}
                    className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                    style={{ 
                      backgroundColor: selectedCategory === cat ? getCategoryColor(cat) : 'transparent',
                      borderColor: getCategoryColor(cat)
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="view-pills">
                <button 
                  className={`view-pill ${!showIncomeOnly && !showExpensesOnly ? 'active' : ''}`}
                  onClick={() => { setShowIncomeOnly(false); setShowExpensesOnly(false); }}
                >
                  All
                </button>
                <button 
                  className={`view-pill income ${showIncomeOnly ? 'active' : ''}`}
                  onClick={() => { setShowIncomeOnly(true); setShowExpensesOnly(false); }}
                >
                  💰 Income
                </button>
                <button 
                  className={`view-pill expense ${showExpensesOnly ? 'active' : ''}`}
                  onClick={() => { setShowIncomeOnly(false); setShowExpensesOnly(true); }}
                >
                  💸 Expenses
                </button>
              </div>
            </div>
          </div>

          {/* Ultra Modern Content */}
          <div className="content-ultra">
            {/* Income Section */}
            {!showExpensesOnly && (
              <div className="section-ultra income-section">
                <div className="section-header-ultra">
                  <div className="section-info">
                    <h3>💰 Income</h3>
                    <span className="count-badge">
                      {getFilteredAndSortedData(incomeSources, searchTerm, selectedCategory, sortBy, sortOrder, 'income').length}
                    </span>
                  </div>
                  <div className="total-ultra positive">
                    RM {incomeSources.reduce((sum, item) => sum + parseFloat(item.amount), 0).toLocaleString()}
                  </div>
                </div>
                
                <div className="items-list-ultra">
                  {getFilteredAndSortedData(incomeSources, searchTerm, selectedCategory, sortBy, sortOrder, 'income').length > 0 ? (
                    getFilteredAndSortedData(incomeSources, searchTerm, selectedCategory, sortBy, sortOrder, 'income').map((item, index) => (
                      <div key={index} className="item-compact">
                        <div className="item-icon-compact">
                          {getItemLabel(item).split(' ')[0]}
                        </div>
                        <div className="item-content-compact">
                          <div className="item-name-compact">
                            {getItemLabel(item).replace(/^[^\s]+\s/, '')}
                          </div>
                          <div className="item-meta-compact">
                            <span className="category-tag-compact" style={{ backgroundColor: getCategoryColor(item.category) }}>
                              {item.category}
                            </span>
                          </div>
                        </div>
                        <div className="item-amount-compact positive">
                          RM {parseFloat(item.amount).toLocaleString()}
                        </div>
                        <button className="edit-btn-compact" onClick={() => setEditingItem(item)}>
                          <Edit3 size={14} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state-ultra">
                      <div className="empty-icon">📊</div>
                      <div className="empty-text">No income items found</div>
                      <button className="empty-action" onClick={() => setShowAddModal(true)}>
                        <Plus size={14} />
                        Add Income
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Expenses Section */}
            {!showIncomeOnly && (
              <div className="section-ultra expense-section">
                <div className="section-header-ultra">
                  <div className="section-info">
                    <h3>💸 Expenses</h3>
                    <span className="count-badge">
                      {getFilteredAndSortedData(expenseCategories, searchTerm, selectedCategory, sortBy, sortOrder, 'expense').length}
                    </span>
                  </div>
                  <div className="total-ultra negative">
                    RM {expenseCategories.reduce((sum, item) => sum + parseFloat(item.amount), 0).toLocaleString()}
                  </div>
                </div>
                
                <div className="items-list-ultra">
                  {getFilteredAndSortedData(expenseCategories, searchTerm, selectedCategory, sortBy, sortOrder, 'expense').length > 0 ? (
                    getFilteredAndSortedData(expenseCategories, searchTerm, selectedCategory, sortBy, sortOrder, 'expense').map((item, index) => (
                      <div key={index} className="item-compact">
                        <div className="item-icon-compact">
                          {getItemLabel(item).split(' ')[0]}
                        </div>
                        <div className="item-content-compact">
                          <div className="item-name-compact">
                            {getItemLabel(item).replace(/^[^\s]+\s/, '')}
                          </div>
                          <div className="item-meta-compact">
                            <span className="category-tag-compact" style={{ backgroundColor: getCategoryColor(item.category) }}>
                              {item.category}
                            </span>
                          </div>
                        </div>
                        <div className="item-amount-compact negative">
                          RM {parseFloat(item.amount).toLocaleString()}
                        </div>
                        <button className="edit-btn-compact" onClick={() => setEditingItem(item)}>
                          <Edit3 size={14} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state-ultra">
                      <div className="empty-icon">💸</div>
                      <div className="empty-text">No expense items found</div>
                      <button className="empty-action" onClick={() => setShowAddModal(true)}>
                        <Plus size={14} />
                        Add Expense
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Yearly Summary */}
      {viewMode === 'yearly' && (
        <div className="yearly-summary">
          <h3>Yearly Financial Summary</h3>
          <div className="yearly-grid">
            {Object.entries(getYearlySummary()).map(([year, data]) => (
              <div key={year} className="year-card">
                <h4>{year}</h4>
                <div className="year-stats">
                  <div className="year-stat">
                    <span className="stat-label">Income:</span>
                    <span className="stat-value positive">RM {data.income.toLocaleString()}</span>
                  </div>
                  <div className="year-stat">
                    <span className="stat-label">Expenses:</span>
                    <span className="stat-value negative">RM {data.expenses.toLocaleString()}</span>
                  </div>
                  <div className="year-stat total">
                    <span className="stat-label">Net Budget:</span>
                    <span className={`stat-value ${data.budget >= 0 ? 'positive' : 'negative'}`}>
                      RM {data.budget.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Analysis - Ultra Modern */}
      {viewMode === 'category' && (
        <div className="category-analysis-ultra">
          <div className="category-header-ultra">
            <h3>📊 Category Analysis</h3>
            <div className="category-summary">
              <div className="summary-item">
                <span className="summary-label">Total Categories</span>
                <span className="summary-value">{categoriesSummary.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Total Amount</span>
                <span className="summary-value">
                  RM {categoriesSummary.reduce((sum, cat) => sum + parseFloat(cat.total_amount), 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="categories-grid-ultra">
            {categoriesSummary.map((category, index) => (
              <div key={index} className="category-card-ultra">
                <div className="category-header-card">
                  <div className="category-icon" style={{ backgroundColor: getCategoryColor(category.category) }}>
                    {category.category.charAt(0)}
                  </div>
                  <div className="category-info">
                    <h4>{category.category}</h4>
                    <span className="category-count">{category.item_count} items</span>
                  </div>
                  <div className="category-total">
                    RM {parseFloat(category.total_amount).toLocaleString()}
                  </div>
                </div>
                
                <div className="category-stats-ultra">
                  <div className="stat-row">
                    <span className="stat-label">Average per Item</span>
                    <span className="stat-value">
                      RM {Math.round(parseFloat(category.total_amount) / category.item_count).toLocaleString()}
                    </span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Percentage</span>
                    <span className="stat-value">
                      {((parseFloat(category.total_amount) / categoriesSummary.reduce((sum, cat) => sum + parseFloat(cat.total_amount), 0)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="category-progress">
                  <div 
                    className="progress-bar"
                    style={{ 
                      width: `${(parseFloat(category.total_amount) / Math.max(...categoriesSummary.map(cat => parseFloat(cat.total_amount)))) * 100}%`,
                      backgroundColor: getCategoryColor(category.category)
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="modal-overlay-enhanced" onClick={() => setEditingItem(null)}>
          <div className="modal-content-enhanced" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Edit Item</h3>
              <button className="close-btn" onClick={() => setEditingItem(null)}>
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-section">
                <h4>Item Information</h4>
                <div className="form-group-enhanced">
                  <label>Item Name</label>
                  <input 
                    type="text" 
                    value={editingItem.source_name || editingItem.item_name || ''}
                    className="form-input"
                    readOnly
                  />
                </div>
                
                <div className="form-group-enhanced">
                  <label>Amount (RM)</label>
                  <div className="amount-input-group">
                    <span className="currency-symbol">RM</span>
                    <input 
                      type="number" 
                      value={editingItem.amount}
                      className="form-input amount-input"
                      readOnly
                    />
                  </div>
                </div>

                {editingItem.category && (
                  <div className="form-group-enhanced">
                    <label>Category</label>
                    <input 
                      type="text" 
                      value={editingItem.category}
                      className="form-input"
                      readOnly
                    />
                  </div>
                )}

                <div className="form-group-enhanced">
                  <label>Description</label>
                  <textarea 
                    value={editingItem.description || ''}
                    className="form-textarea"
                    rows={2}
                    readOnly
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-actions-enhanced">
              <button className="btn-cancel" onClick={() => setEditingItem(null)}>
                Close
              </button>
              <button className="btn-save" onClick={() => {
                // TODO: Implement edit functionality
                alert('Edit functionality will be implemented in the next update');
                setEditingItem(null);
              }}>
                <Edit3 size={16} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Add Entry Modal */}
      {showAddModal && (
        <div className="modal-overlay-enhanced" onClick={() => setShowAddModal(false)}>
          <div className="modal-content-enhanced" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Add New Financial Entry</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-section">
                <h4>Entry Type</h4>
                <div className="type-selector">
                  <button 
                    className={`type-btn ${newEntry.type === 'income' ? 'active' : ''}`}
                    onClick={() => setNewEntry({...newEntry, type: 'income'})}
                  >
                    💰 Income
                  </button>
                  <button 
                    className={`type-btn ${newEntry.type === 'expense' ? 'active' : ''}`}
                    onClick={() => setNewEntry({...newEntry, type: 'expense'})}
                  >
                    💸 Expense
                  </button>
                </div>
              </div>

              <div className="form-section">
                <h4>Basic Information</h4>
                <div className="form-group-enhanced">
                  <label>Item Name *</label>
                  <input 
                    type="text" 
                    value={newEntry.name}
                    onChange={(e) => setNewEntry({...newEntry, name: e.target.value})}
                    placeholder={newEntry.type === 'income' ? 'e.g., Client Payment, AI Bot Service' : 'e.g., Office Rent, Marketing Ads'}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group-enhanced">
                  <label>Amount (RM) *</label>
                  <div className="amount-input-group">
                    <span className="currency-symbol">RM</span>
                    <input 
                      type="number" 
                      value={newEntry.amount}
                      onChange={(e) => setNewEntry({...newEntry, amount: e.target.value})}
                      placeholder="0.00"
                      step="0.01"
                      className="form-input amount-input"
                    />
                  </div>
                </div>
              </div>

              {newEntry.type === 'expense' && (
                <div className="form-section">
                  <h4>Expense Category</h4>
                  <div className="category-grid">
                    {['MANAGEMENT', 'MARKETING', 'ELECTRONICS', 'TRANSPORT', 'OFFICE', 'ASSET', 'TECHNOLOGY'].map(category => (
                      <button 
                        key={category}
                        className={`category-btn ${newEntry.category === category ? 'active' : ''}`}
                        onClick={() => setNewEntry({...newEntry, category})}
                        style={{ backgroundColor: newEntry.category === category ? getCategoryColor(category) : '#f8f9fa' }}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-section">
                <h4>Additional Details</h4>
                <div className="form-group-enhanced">
                  <label>Description</label>
                  <textarea 
                    value={newEntry.description}
                    onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
                    placeholder="Optional: Add notes, reference numbers, or additional context..."
                    className="form-textarea"
                    rows={3}
                  />
                </div>
              </div>

              <div className="form-section">
                <h4>Month & Year</h4>
                <div className="date-info">
                  <div className="date-display">
                    📅 {selectedMonth}
                  </div>
                  <p className="date-note">This entry will be added to the selected month</p>
                </div>
              </div>
            </div>
            
            <div className="modal-actions-enhanced">
              <button className="btn-cancel" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button 
                className="btn-save" 
                onClick={handleAddEntry}
                disabled={!newEntry.name || !newEntry.amount}
              >
                <Plus size={16} />
                Add {newEntry.type === 'income' ? 'Income' : 'Expense'} Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialStatement;
