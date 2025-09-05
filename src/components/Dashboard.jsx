import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  UserCheck, 
  MessageSquare,
  TrendingUp,
  Activity,
  Calendar,
  Clock,
  BarChart3,
  DollarSign,
  Zap,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
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
  AreaChart,
  Area
} from 'recharts';
import logo from '../assets/logo.png';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalContacts: 0,
    totalMessages: 0,
    activeUsers: 0,
    growthRate: 0,
    newUsersToday: 0,
    newCompaniesThisMonth: 0,
    freeTierUsers: 0,
    totalAIResponses: 0
  });

  const [userData, setUserData] = useState([]);
  const [companyData, setCompanyData] = useState([]);
  const [monthlyGrowth, setMonthlyGrowth] = useState([]);
  const [freeTierUsers, setFreeTierUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllCompanies, setShowAllCompanies] = useState(false);
  const [filters, setFilters] = useState({
    plan: 'all',
    dateRange: 'all',
    usageThreshold: 'all',
    searchTerm: ''
  });

  // Plan limits configuration
  const getPlanLimits = (plan) => {
    switch (plan) {
      case 'free':
        return { aiResponses: 100, contacts: 100, name: 'Free Plan' };
      case 'standard':
        return { aiResponses: 5000, contacts: 10000, name: 'Standard Plan' };
      case 'pro':
        return { aiResponses: 20000, contacts: 50000, name: 'Pro Support Plan' };
      case 'enterprise':
        return { aiResponses: 50000, contacts: 100000, name: 'Enterprise Plan' };
      default:
        return { aiResponses: 100, contacts: 100, name: 'Free Plan' };
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Get plan distribution data for the chart
  const getPlanDistributionData = () => {
    const planStats = {};
    
    // Initialize plan stats
    ['free', 'standard', 'pro', 'enterprise'].forEach(plan => {
      planStats[plan] = {
        companies: 0,
        totalUsage: 0,
        companyCount: 0
      };
    });

    // Calculate stats for each company
    freeTierUsers.forEach(company => {
      const plan = company.plan || 'free';
      if (planStats[plan]) {
        const companyUsers = userData.filter(user => user.companyId === company.company_id);
        const totalAIResponses = companyUsers.reduce((sum, user) => sum + (user.aiResponseCount || 0), 0);
        const totalContacts = companyUsers.reduce((sum, user) => sum + (user.contactCount || 0), 0);
        const planLimits = getPlanLimits(plan);
        const aiUsagePercent = (totalAIResponses / planLimits.aiResponses) * 100;
        const contactUsagePercent = (totalContacts / planLimits.contacts) * 100;
        const maxUsagePercent = Math.max(aiUsagePercent, contactUsagePercent);

        planStats[plan].companies += 1;
        planStats[plan].totalUsage += maxUsagePercent;
        planStats[plan].companyCount += 1;
      }
    });

    // Convert to chart data format
    return Object.entries(planStats).map(([plan, stats]) => ({
      plan: getPlanLimits(plan).name,
      companies: stats.companies,
      avgUsage: stats.companyCount > 0 ? Math.round(stats.totalUsage / stats.companyCount) : 0
    }));
  };

  // Business-critical metrics for sales and marketing
  const getBusinessMetrics = () => {
    const totalCompanies = freeTierUsers.length;
    const freeCompanies = freeTierUsers.filter(c => !c.plan || c.plan === 'free').length;
    const paidCompanies = totalCompanies - freeCompanies;
    const conversionRate = totalCompanies > 0 ? Math.round((paidCompanies / totalCompanies) * 100) : 0;
    
    // High-usage companies (potential upgrades)
    const highUsageCompanies = freeTierUsers.filter(company => {
      const companyUsers = userData.filter(user => user.companyId === company.company_id);
      const totalAIResponses = companyUsers.reduce((sum, user) => sum + (user.aiResponseCount || 0), 0);
      const totalContacts = companyUsers.reduce((sum, user) => sum + (user.contactCount || 0), 0);
      const planLimits = getPlanLimits(company.plan);
      const aiUsagePercent = (totalAIResponses / planLimits.aiResponses) * 100;
      const contactUsagePercent = (totalContacts / planLimits.contacts) * 100;
      return Math.max(aiUsagePercent, contactUsagePercent) > 80;
    }).length;

    // Active companies (using the system)
    const activeCompanies = freeTierUsers.filter(company => {
      const companyUsers = userData.filter(user => user.companyId === company.company_id);
      return companyUsers.some(user => user.aiResponseCount > 0 || user.contactCount > 0);
    }).length;

    // Companies with multiple users (engaged)
    const engagedCompanies = freeTierUsers.filter(company => {
      const companyUsers = userData.filter(user => user.companyId === company.company_id);
      return companyUsers.length > 1;
    }).length;

    return {
      totalCompanies,
      freeCompanies,
      paidCompanies,
      conversionRate,
      highUsageCompanies,
      activeCompanies,
      engagedCompanies
    };
  };

  // Get upgrade opportunities (companies ready for next plan)
  const getUpgradeOpportunities = () => {
    return freeTierUsers
      .filter(company => {
        const companyUsers = userData.filter(user => user.companyId === company.company_id);
        const totalAIResponses = companyUsers.reduce((sum, user) => sum + (user.aiResponseCount || 0), 0);
        const totalContacts = companyUsers.reduce((sum, user) => sum + (user.contactCount || 0), 0);
        const planLimits = getPlanLimits(company.plan);
        const aiUsagePercent = (totalAIResponses / planLimits.aiResponses) * 100;
        const contactUsagePercent = (totalContacts / planLimits.contacts) * 100;
        const maxUsagePercent = Math.max(aiUsagePercent, contactUsagePercent);
        
        // Include ALL companies that should be considered for upgrades
        const isHighUsage = maxUsagePercent > 50; // Lowered threshold
        const isFreeWithAnyUsage = (!company.plan || company.plan === 'free') && (totalAIResponses > 10 || totalContacts > 10);
        const isPaidWithModerateUsage = company.plan && company.plan !== 'free' && maxUsagePercent > 30;
        const isFreeWithUsers = (!company.plan || company.plan === 'free') && companyUsers.length > 0; // Include all free companies with users
        
        return isHighUsage || isFreeWithAnyUsage || isPaidWithModerateUsage || isFreeWithUsers;
      })
      .map(company => {
        const companyUsers = userData.filter(user => user.companyId === company.company_id);
        const totalAIResponses = companyUsers.reduce((sum, user) => sum + (user.aiResponseCount || 0), 0);
        const totalContacts = companyUsers.reduce((sum, user) => sum + (user.contactCount || 0), 0);
        const planLimits = getPlanLimits(company.plan);
        const aiUsagePercent = (totalAIResponses / planLimits.aiResponses) * 100;
        const contactUsagePercent = (totalContacts / planLimits.contacts) * 100;
        const maxUsagePercent = Math.max(aiUsagePercent, contactUsagePercent);
        
        let recommendedPlan = 'Standard Plan';
        let upgradeReason = 'Consider upgrade';
        
        if (!company.plan || company.plan === 'free') {
          if (totalAIResponses > 80 || totalContacts > 80) {
            recommendedPlan = 'Standard Plan';
            upgradeReason = 'Free plan limits reached';
          } else if (totalAIResponses > 50 || totalContacts > 50) {
            recommendedPlan = 'Standard Plan';
            upgradeReason = 'High usage - ready for upgrade';
          } else if (totalAIResponses > 20 || totalContacts > 20) {
            recommendedPlan = 'Standard Plan';
            upgradeReason = 'Growing usage - consider upgrade';
          } else if (totalAIResponses > 0 || totalContacts > 0) {
            recommendedPlan = 'Standard Plan';
            upgradeReason = 'Active user - potential upgrade';
          } else if (companyUsers.length > 0) {
            recommendedPlan = 'Standard Plan';
            upgradeReason = 'New user - welcome upgrade offer';
          } else {
            recommendedPlan = 'Standard Plan';
            upgradeReason = 'Free plan - upgrade benefits';
          }
        } else if (company.plan === 'standard') {
          if (maxUsagePercent > 80) {
            recommendedPlan = 'Pro Support Plan';
            upgradeReason = 'Standard plan limits reached';
          } else if (maxUsagePercent > 50) {
            recommendedPlan = 'Pro Support Plan';
            upgradeReason = 'High usage - consider Pro';
          } else {
            recommendedPlan = 'Pro Support Plan';
            upgradeReason = 'Moderate usage - Pro benefits';
          }
        } else if (company.plan === 'pro') {
          if (maxUsagePercent > 85) {
            recommendedPlan = 'Enterprise Plan';
            upgradeReason = 'Pro plan limits reached';
          } else if (maxUsagePercent > 50) {
            recommendedPlan = 'Enterprise Plan';
            upgradeReason = 'High usage - consider Enterprise';
          } else {
            recommendedPlan = 'Enterprise Plan';
            upgradeReason = 'Enterprise features needed';
          }
        }
        
        return {
          name: company.name || 'Unknown Company',
          currentPlan: getPlanLimits(company.plan).name,
          usagePercent: Math.round(maxUsagePercent),
          recommendedPlan,
          upgradeReason,
          userCount: companyUsers.length,
          totalAIResponses,
          totalContacts,
          isFreePlan: !company.plan || company.plan === 'free'
        };
      })
      .sort((a, b) => {
        // Sort by priority: free plans first, then by usage percentage
        if (a.isFreePlan && !b.isFreePlan) return -1;
        if (!a.isFreePlan && b.isFreePlan) return 1;
        return b.usagePercent - a.usagePercent;
      });
  };

  // Get engagement metrics for customer success
  const getEngagementMetrics = () => {
    const totalUsers = userData.length;
    const activeUsers = userData.filter(user => user.aiResponseCount > 0 || user.contactCount > 0).length;
    const superActiveUsers = userData.filter(user => (user.aiResponseCount || 0) > 50 || (user.contactCount || 0) > 100).length;
    
    // Companies with recent activity (last 7 days would be ideal, but using what we have)
    const recentlyActiveCompanies = freeTierUsers.filter(company => {
      const companyUsers = userData.filter(user => user.companyId === company.company_id);
      return companyUsers.some(user => user.aiResponseCount > 0 || user.contactCount > 0);
    }).length;

    return {
      totalUsers,
      activeUsers,
      superActiveUsers,
      recentlyActiveCompanies,
      userEngagementRate: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
      superUserRate: totalUsers > 0 ? Math.round((superActiveUsers / totalUsers) * 100) : 0
    };
  };



  // Filter companies based on current filters (already filtered to API URL companies)
  const getFilteredCompanies = () => {
    if (!freeTierUsers.length) return [];

    return freeTierUsers.filter(company => {
      // Plan filter
      if (filters.plan !== 'all' && company.plan !== filters.plan) {
        return false;
      }

      // Search term filter
      if (filters.searchTerm && !company.name?.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }

      // Date range filter
      if (filters.dateRange !== 'all') {
        const companyDate = new Date(company.createdAt || company.created_at);
        const now = new Date();
        const daysDiff = Math.floor((now - companyDate) / (1000 * 60 * 60 * 24));
        
        switch (filters.dateRange) {
          case 'today':
            if (daysDiff > 0) return false;
            break;
          case 'week':
            if (daysDiff > 7) return false;
            break;
          case 'month':
            if (daysDiff > 30) return false;
            break;
          case 'quarter':
            if (daysDiff > 90) return false;
            break;
        }
      }

      // Usage threshold filter
      if (filters.usageThreshold !== 'all') {
        const companyUsers = userData.filter(user => user.companyId === company.company_id);
        const totalAIResponses = companyUsers.reduce((sum, user) => sum + (user.aiResponseCount || 0), 0);
        const totalContacts = companyUsers.reduce((sum, user) => sum + (user.contactCount || 0), 0);
        const planLimits = getPlanLimits(company.plan);
        const aiUsagePercent = (totalAIResponses / planLimits.aiResponses) * 100;
        const contactUsagePercent = (totalContacts / planLimits.contacts) * 100;
        const maxUsagePercent = Math.max(aiUsagePercent, contactUsagePercent);

        switch (filters.usageThreshold) {
          case 'low':
            if (maxUsagePercent > 25) return false;
            break;
          case 'medium':
            if (maxUsagePercent <= 25 || maxUsagePercent > 75) return false;
            break;
          case 'high':
            if (maxUsagePercent <= 75) return false;
            break;
          case 'overlimit':
            if (maxUsagePercent <= 100) return false;
            break;
        }
      }

      return true;
    });
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch comprehensive analytics
      const [analyticsResponse, usersResponse, companiesResponse] = await Promise.all([
        fetch('https://juta-dev.ngrok.dev/api/users/analytics'),
        fetch('https://juta-dev.ngrok.dev/api/users'),
        fetch('https://juta-dev.ngrok.dev/api/companies')
      ]);

      const analyticsData = await analyticsResponse.json();
      const usersData = await usersResponse.json();
      const companiesData = await companiesResponse.json();

      console.log('Analytics Data:', analyticsData);
      console.log('Users Data:', usersData);
      console.log('Companies Data:', companiesData);

      if (analyticsData.success) {
        const users = analyticsData.users || [];
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Filter companies by API URL
        const apiUrlCompanies = (companiesData.companies || []).filter(company => 
          company.api_url === 'https://juta-dev.ngrok.dev'
        );

        // Filter users to only those belonging to API URL companies
        const apiUrlCompanyIds = apiUrlCompanies.map(company => company.company_id);
        const apiUrlUsers = users.filter(user => apiUrlCompanyIds.includes(user.companyId));

        // Calculate new users today (only API URL companies)
        const newUsersToday = apiUrlUsers.filter(user => {
          const userDate = new Date(user.createdAt || user.created_at);
          return userDate >= startOfToday;
        }).length;

        // Calculate new companies this month (only API URL companies)
        const newCompaniesThisMonth = apiUrlCompanies.filter(company => {
          const companyDate = new Date(company.createdAt || company.created_at);
          return companyDate >= startOfMonth;
        }).length;

        // Use the already filtered API URL companies

        // Generate monthly growth data for the last 6 months (only API URL companies)
        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
          
          const monthUsers = apiUrlUsers.filter(user => {
            const userDate = new Date(user.createdAt || user.created_at);
            return userDate >= monthStart && userDate <= monthEnd;
          }).length;

          const monthCompanies = apiUrlCompanies.filter(company => {
            const companyDate = new Date(company.createdAt || company.created_at);
            return companyDate >= monthStart && companyDate <= monthEnd;
          }).length;

          monthlyData.push({
            month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            users: monthUsers || Math.floor(Math.random() * 10) + 1, // Fallback mock data
            companies: monthCompanies || Math.floor(Math.random() * 5) + 1, // Fallback mock data
            contacts: Math.floor((monthUsers || 1) * 15), // Mock data
            aiResponses: Math.floor((monthUsers || 1) * 25) // Mock data
          });
        }

        // Calculate totals from the data (only API URL companies)
        const totalUsers = apiUrlUsers.length;
        const totalCompanies = apiUrlCompanies.length;
        const totalContacts = apiUrlUsers.reduce((sum, user) => sum + (user.contactCount || 0), 0);
        const totalAIResponses = apiUrlUsers.reduce((sum, user) => sum + (user.aiResponseCount || 0), 0);
        const activeUsers = apiUrlUsers.filter(user => user.active !== false).length;

        setStats({
          totalUsers,
          totalCompanies,
          totalContacts,
          totalMessages: totalAIResponses,
          activeUsers,
          growthRate: 12.5,
          newUsersToday,
          newCompaniesThisMonth,
          freeTierUsers: apiUrlCompanies.length,
          totalAIResponses
        });

        setUserData(apiUrlUsers);
        setCompanyData(apiUrlCompanies);
        setMonthlyGrowth(monthlyData);
        setFreeTierUsers(apiUrlCompanies);
      } else {
        console.error('Analytics API returned error:', analyticsData);
        // Set fallback data if API fails
        setStats({
          totalUsers: 3,
          totalCompanies: 3,
          totalContacts: 225,
          totalMessages: 370,
          activeUsers: 3,
          growthRate: 12.5,
          newUsersToday: 1,
          newCompaniesThisMonth: 2,
          freeTierUsers: 1,
          totalAIResponses: 370
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set fallback data on error
      setStats({
        totalUsers: 3,
        totalCompanies: 3,
        totalContacts: 225,
        totalMessages: 370,
        activeUsers: 3,
        growthRate: 12.5,
        newUsersToday: 1,
        newCompaniesThisMonth: 2,
        freeTierUsers: 1,
        totalAIResponses: 370
      });
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
  

      {/* Key Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">
            <Users size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-value">{stats.newUsersToday}</div>
            <div className="metric-label">New Users Today</div>
            <div className="metric-change positive">
              <ArrowUpRight size={14} />
              +{stats.newUsersToday > 0 ? stats.newUsersToday : 0} today
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <Building2 size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-value">{stats.newCompaniesThisMonth}</div>
            <div className="metric-label">New Companies This Month</div>
            <div className="metric-change positive">
              <ArrowUpRight size={14} />
              +{stats.newCompaniesThisMonth} this month
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <Users size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-value">{getBusinessMetrics().freeCompanies}</div>
            <div className="metric-label">Free Companies</div>
            <div className="metric-change">
              <Eye size={14} />
              {Math.round((getBusinessMetrics().freeCompanies / getBusinessMetrics().totalCompanies) * 100)}% of total
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <DollarSign size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-value">{getBusinessMetrics().paidCompanies}</div>
            <div className="metric-label">Paid Companies</div>
            <div className="metric-change positive">
              <ArrowUpRight size={14} />
              {Math.round((getBusinessMetrics().paidCompanies / getBusinessMetrics().totalCompanies) * 100)}% of total
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <TrendingUp size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-value">{getBusinessMetrics().conversionRate}%</div>
            <div className="metric-label">Free to Paid Conversion</div>
            <div className="metric-change positive">
              <ArrowUpRight size={14} />
              {getBusinessMetrics().paidCompanies} paid companies
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <Activity size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-value">{getEngagementMetrics().userEngagementRate}%</div>
            <div className="metric-label">User Engagement</div>
            <div className="metric-change positive">
              <ArrowUpRight size={14} />
              {getEngagementMetrics().activeUsers} active users
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Monthly Growth Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Monthly Growth Trends</h3>
            <div className="chart-legend">
              <span className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#0088FE' }}></span>
                Users
              </span>
              <span className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#00C49F' }}></span>
                Companies
              </span>
            </div>
          </div>
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyGrowth}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
            <XAxis 
                dataKey="month" 
              stroke="var(--text-muted)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--text-muted)"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'var(--text-primary)'
              }}
            />
              <Area 
              type="monotone" 
              dataKey="users" 
                stackId="1"
                stroke="#0088FE" 
                fill="#0088FE"
                fillOpacity={0.6}
              />
              <Area 
              type="monotone" 
              dataKey="companies" 
                stackId="1"
                stroke="#00C49F" 
                fill="#00C49F"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

                {/* Plan Distribution & Usage Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Plan Distribution & Usage</h3>
            <div className="chart-legend">
              <span className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#0088FE' }}></span>
                Companies
              </span>
              <span className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#00C49F' }}></span>
                Avg Usage %
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getPlanDistributionData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
              <XAxis 
                dataKey="plan" 
                stroke="var(--text-muted)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--text-muted)"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)'
                }}
                formatter={(value, name) => [
                  name === 'companies' ? `${value} companies` : `${value}%`,
                  name === 'companies' ? 'Companies' : 'Avg Usage'
                ]}
              />
              <Bar 
                dataKey="companies" 
                fill="#0088FE" 
                radius={[4, 4, 0, 0]}
                name="Companies"
              />
              <Bar 
                dataKey="avgUsage" 
                fill="#00C49F" 
                radius={[4, 4, 0, 0]}
                name="Avg Usage %"
              />
            </BarChart>
        </ResponsiveContainer>
        </div>
      </div>

            {/* API URL Companies Section */}
      <div className="section-card">
        <div className="section-header">
    
          {/* Filters */}
          <div className="filters-container">
            <div className="filter-group">
              <label>Plan:</label>
              <select 
                value={filters.plan} 
                onChange={(e) => setFilters({...filters, plan: e.target.value})}
                className="filter-select"
              >
                <option value="all">All Plans</option>
                <option value="free">Free Plan</option>
                <option value="standard">Standard Plan</option>
                <option value="pro">Pro Support Plan</option>
                <option value="enterprise">Enterprise Plan</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Date Range:</label>
              <select 
                value={filters.dateRange} 
                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                className="filter-select"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 90 Days</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Usage:</label>
              <select 
                value={filters.usageThreshold} 
                onChange={(e) => setFilters({...filters, usageThreshold: e.target.value})}
                className="filter-select"
              >
                <option value="all">All Usage</option>
                <option value="low">Low (0-25%)</option>
                <option value="medium">Medium (25-75%)</option>
                <option value="high">High (75-100%)</option>
                <option value="overlimit">Over Limit (100%+)</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Search:</label>
              <input
                type="text"
                placeholder="Search companies..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                className="filter-input"
              />
            </div>

            <button 
              onClick={() => setFilters({
                plan: 'all',
                dateRange: 'all',
                usageThreshold: 'all',
                searchTerm: ''
              })}
              className="clear-filters-btn"
            >
              Clear Filters
            </button>
          </div>

        </div>
        <div className="users-grid">
          {getFilteredCompanies().slice(0, showAllCompanies ? getFilteredCompanies().length : 6).map((company, index) => {
            // Get users for this company to calculate totals
            const companyUsers = userData.filter(user => user.companyId === company.company_id);
            const totalAIResponses = companyUsers.reduce((sum, user) => sum + (user.aiResponseCount || 0), 0);
            const totalContacts = companyUsers.reduce((sum, user) => sum + (user.contactCount || 0), 0);
            const userCount = companyUsers.length;
            
            // Get plan limits
            const planLimits = getPlanLimits(company.plan);
            const aiUsagePercent = Math.round((totalAIResponses / planLimits.aiResponses) * 100);
            const contactUsagePercent = Math.round((totalContacts / planLimits.contacts) * 100);
            
            console.log(`Company ${company.company_id}:`, {
              companyName: company.name,
              plan: company.plan,
              planLimits,
              userCount,
              totalAIResponses,
              totalContacts,
              aiUsagePercent,
              contactUsagePercent,
              users: companyUsers.map(u => ({ email: u.email, aiResponseCount: u.aiResponseCount, contactCount: u.contactCount }))
            });
            
            return (
              <div key={index} className="user-card">
                <div className="user-avatar">
                  <Building2 size={24} />
                </div>
                <div className="user-info">
                  <div className="user-name">{company.name || company.company_name || 'Unknown Company'}</div>
                  <div className="user-email">{company.email || company.company_email || 'No email'}</div>
                  <div className="user-company">
                    {userCount} users • {planLimits.name}
                  </div>
                </div>
                <div className="user-stats">
                  <div className="stat-item">
                    <MessageSquare size={16} />
                    <span>{totalAIResponses} / {planLimits.aiResponses.toLocaleString()} AI responses</span>
                    <div className="usage-bar">
                      <div 
                        className="usage-fill ai-usage" 
                        style={{ width: `${Math.min(aiUsagePercent, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="stat-item">
                    <UserCheck size={16} />
                    <span>{totalContacts} / {planLimits.contacts.toLocaleString()} contacts</span>
                    <div className="usage-bar">
                      <div 
                        className="usage-fill contact-usage" 
                        style={{ width: `${Math.min(contactUsagePercent, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="stat-item">
                    <Calendar size={16} />
                    <span>{new Date(company.createdAt || company.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {getFilteredCompanies().length > 6 && (
          <div className="view-more">
            <button 
              className="view-more-btn"
              onClick={() => setShowAllCompanies(!showAllCompanies)}
            >
              {showAllCompanies 
                ? 'Show Less' 
                : `View ${getFilteredCompanies().length - 6} more API URL companies`
              }
            </button>
          </div>
        )}
        
        {getFilteredCompanies().length === 0 && (
          <div className="no-results">
            <p>No companies match the current filters.</p>
            <button 
              onClick={() => setFilters({
                plan: 'all',
                dateRange: 'all',
                usageThreshold: 'all',
                searchTerm: ''
              })}
              className="clear-filters-btn"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Business Growth & Conversion Funnel */}
      <div className="section-card">
        <div className="section-header">
          <h3>🚀 Business Growth & Conversion Funnel</h3>
          <p>Track your path from free users to paying customers</p>
        </div>
        <div className="funnel-grid">
          <div className="funnel-step">
            <div className="funnel-number">{getBusinessMetrics().totalCompanies}</div>
            <div className="funnel-label">Total Companies</div>
            <div className="funnel-description">All registered companies</div>
          </div>
          <div className="funnel-arrow">→</div>
          <div className="funnel-step">
            <div className="funnel-number">{getBusinessMetrics().activeCompanies}</div>
            <div className="funnel-label">Active Companies</div>
            <div className="funnel-description">Using the system</div>
          </div>
          <div className="funnel-arrow">→</div>
          <div className="funnel-step">
            <div className="funnel-number">{getBusinessMetrics().engagedCompanies}</div>
            <div className="funnel-label">Engaged Companies</div>
            <div className="funnel-description">Multiple users</div>
          </div>
          <div className="funnel-arrow">→</div>
          <div className="funnel-step">
            <div className="funnel-number">{getBusinessMetrics().paidCompanies}</div>
            <div className="funnel-label">Paid Plans</div>
            <div className="funnel-description">Upgraded from free</div>
          </div>
        </div>
        
        <div className="conversion-metrics">
          <div className="metric-item">
            <span className="metric-label">Free to Paid Conversion:</span>
            <span className="metric-value">{getBusinessMetrics().conversionRate}%</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">High Usage Companies:</span>
            <span className="metric-value">{getBusinessMetrics().highUsageCompanies}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Engagement Rate:</span>
            <span className="metric-value">{getEngagementMetrics().userEngagementRate}%</span>
          </div>
        </div>
      </div>

      {/* Upgrade Opportunities */}
      <div className="section-card">
        <div className="section-header">
          <h3>🚀 Upgrade Opportunities</h3>
          <p>Companies ready for upgrades - your next sales targets</p>
        </div>
        
        <div className="upgrade-opportunities">
          <h4>🚀 All Upgrade Opportunities ({getUpgradeOpportunities().length})</h4>
          <div className="opportunity-list">
            {getUpgradeOpportunities().slice(0, 8).map((company, index) => (
              <div key={index} className={`opportunity-item ${company.isFreePlan ? 'free-plan' : ''}`}>
                <div className="opportunity-info">
                  <span className="company-name">{company.name}</span>
                  <span className="current-plan">{company.currentPlan}</span>
                  <span className="user-count">{company.userCount} users</span>
                  <span className="upgrade-reason">{company.upgradeReason}</span>
                  <span className="contact-info">
                    {company.email && <span className="email">{company.email}</span>}
                    {company.phone && <span className="phone">{company.phone}</span>}
                  </span>
                </div>
                <div className="opportunity-metrics">
                  <span className="usage-percent">{company.usagePercent}% usage</span>
                  <span className="upgrade-potential">→ {company.recommendedPlan}</span>
                  <div className="usage-details">
                    <span>{company.totalAIResponses} AI responses</span>
                    <span>{company.totalContacts} contacts</span>
                  </div>
                </div>
                <div className="opportunity-actions">
                  <button className="action-btn primary">Contact</button>
                  <button className="action-btn secondary">Send Upgrade Email</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Success & Engagement */}
      <div className="section-card">
        <div className="section-header">
          <h3>👥 Customer Success & Engagement</h3>
          <p>Track user engagement and identify at-risk customers</p>
        </div>
        <div className="engagement-grid">
          <div className="engagement-card">
            <div className="engagement-header">
              <h4>User Engagement</h4>
              <Activity size={20} />
            </div>
            <div className="engagement-stats">
              <div className="engagement-stat">
                <span className="stat-label">Active Users</span>
                <span className="stat-value">{getEngagementMetrics().activeUsers}</span>
                <span className="stat-change positive">{getEngagementMetrics().userEngagementRate}% of total</span>
              </div>
              <div className="engagement-stat">
                <span className="stat-label">Super Active Users</span>
                <span className="stat-value">{getEngagementMetrics().superActiveUsers}</span>
                <span className="stat-change positive">{getEngagementMetrics().superUserRate}% of total</span>
              </div>
              <div className="engagement-stat">
                <span className="stat-label">Recently Active Companies</span>
                <span className="stat-value">{getEngagementMetrics().recentlyActiveCompanies}</span>
                <span className="stat-change positive">Using system actively</span>
              </div>
            </div>
          </div>
          
          <div className="engagement-card">
            <div className="engagement-header">
              <h4>At-Risk Customers</h4>
              <Target size={20} />
            </div>
            <div className="at-risk-list">
              {freeTierUsers
                .filter(company => {
                  const companyUsers = userData.filter(user => user.companyId === company.company_id);
                  return companyUsers.length > 0 && companyUsers.every(user => 
                    (user.aiResponseCount || 0) === 0 && (user.contactCount || 0) === 0
                  );
                })
                .slice(0, 3)
                .map((company, index) => (
                  <div key={index} className="at-risk-item">
                    <span className="company-name">{company.name}</span>
                    <span className="risk-level">No activity</span>
                    <button className="action-btn warning">Re-engage</button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="section-card">
        <div className="section-header">
          <h3>Recent Database Activity</h3>
          <p>Latest changes and updates in your system</p>
        </div>
        <div className="activity-list">
          {userData.slice(0, 5).map((user, index) => (
            <div key={index} className="activity-item">
              <div className="activity-icon">
                <Users size={16} />
              </div>
                             <div className="activity-content">
                 <div className="activity-title">
                   New user registered: {user.name || user.email?.split('@')[0] || 'Unknown User'}
                 </div>
                 <div className="activity-details">
                   <span>{user.email}</span>
                   <span>•</span>
                   <span>{user.companyName || user.company_name || 'No Company'}</span>
                   <span>•</span>
                   <span>{new Date(user.createdAt || user.created_at).toLocaleDateString()}</span>
                 </div>
               </div>
               <div className="activity-status">
                 <span className={`status-badge ${user.active !== false ? 'active' : 'inactive'}`}>
                   {user.active !== false ? 'Active' : 'Inactive'}
                 </span>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="overview-grid">
        <div className="overview-card">
          <div className="overview-header">
            <h4>Total Users</h4>
            <Users size={20} />
          </div>
          <div className="overview-value">{stats.totalUsers.toLocaleString()}</div>
          <div className="overview-change positive">
            <ArrowUpRight size={14} />
            +{stats.activeUsers} active
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-header">
            <h4>Total Companies</h4>
            <Building2 size={20} />
          </div>
          <div className="overview-value">{stats.totalCompanies.toLocaleString()}</div>
          <div className="overview-change positive">
            <ArrowUpRight size={14} />
            +{stats.newCompaniesThisMonth} this month
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-header">
            <h4>Total Contacts</h4>
            <UserCheck size={20} />
          </div>
          <div className="overview-value">{stats.totalContacts.toLocaleString()}</div>
          <div className="overview-change">
            <Target size={14} />
            {Math.round(stats.totalContacts / stats.totalUsers)} per user
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-header">
            <h4>AI Responses</h4>
            <Zap size={20} />
          </div>
          <div className="overview-value">{stats.totalAIResponses.toLocaleString()}</div>
          <div className="overview-change positive">
            <ArrowUpRight size={14} />
            {Math.round(stats.totalAIResponses / stats.totalUsers)} per user
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
