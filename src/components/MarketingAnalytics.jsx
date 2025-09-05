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
  ComposedChart
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
  XCircle,
  Target,
  Zap,
  Users,
  MousePointer,
  Percent,
  DollarSign as DollarIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from 'lucide-react';

const MarketingAnalytics = () => {
  const [marketingData, setMarketingData] = useState({
    campaigns: [],
    adSpend: {},
    revenue: {},
    platforms: {
      'FACEBOOK': ['Facebook Ads', 'Instagram Ads', 'Meta Ads'],
      'GOOGLE': ['Google Ads', 'YouTube Ads', 'Google Display'],
      'TIKTOK': ['TikTok Ads', 'TikTok For Business'],
      'LINKEDIN': ['LinkedIn Ads', 'LinkedIn Sponsored'],
      'TWITTER': ['Twitter Ads', 'X Ads'],
      'OTHER': ['Snapchat', 'Pinterest', 'Reddit', 'Native Ads']
    },
    campaignTypes: [
      'Lead Generation', 'Brand Awareness', 'Sales Conversion', 'Retargeting',
      'Lookalike Audiences', 'Video Campaigns', 'Carousel Ads', 'Story Ads'
    ]
  });

  const [selectedMonth, setSelectedMonth] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    platform: 'FACEBOOK',
    campaignType: 'Lead Generation',
    adSpend: '',
    revenue: '',
    impressions: '',
    clicks: '',
    conversions: '',
    ctr: '',
    cpc: '',
    cpm: '',
    roas: '',
    description: ''
  });
  const [viewMode, setViewMode] = useState('overview'); // overview, campaigns, roi, platforms
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [summary, setSummary] = useState({});
  const [roiData, setRoiData] = useState([]);
  const [showDetails, setShowDetails] = useState(true);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [sortBy, setSortBy] = useState('roas'); // roas, adSpend, revenue, ctr
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [showLowPerforming, setShowLowPerforming] = useState(false);

  // Fetch data from database
  useEffect(() => {
    fetchMarketingData();
  }, []);

  const fetchMarketingData = async () => {
    try {
      setLoading(true);
      
      // Fetch monthly marketing data
      const monthlyResponse = await fetch('https://juta-dev.ngrok.dev/api/marketing/monthly-data');
      const monthlyResult = await monthlyResponse.json();
      
      if (monthlyResult.success) {
        setMonthlyData(monthlyResult.data);
        
        // Transform data for charts
        const months = monthlyResult.data.map(item => `${item.month} ${item.year}`);
        const adSpend = {};
        const revenue = {};
        
        monthlyResult.data.forEach(item => {
          const monthKey = `${item.month} ${item.year}`;
          adSpend[monthKey] = parseFloat(item.total_ad_spend);
          revenue[monthKey] = parseFloat(item.total_revenue);
        });
        
        setMarketingData(prev => ({
          ...prev,
          months,
          adSpend,
          revenue
        }));
        
        if (months.length > 0) {
          setSelectedMonth(months[months.length - 1]);
        }
      }

      // Fetch marketing summary
      const summaryResponse = await fetch('https://juta-dev.ngrok.dev/api/marketing/summary');
      const summaryResult = await summaryResponse.json();
      if (summaryResult.success) {
        setSummary(summaryResult.summary);
      }

      // Fetch campaigns data
      const campaignsResponse = await fetch('https://juta-dev.ngrok.dev/api/marketing/campaigns');
      const campaignsResult = await campaignsResponse.json();
      if (campaignsResult.success) {
        setCampaigns(campaignsResult.data);
      }

      // Fetch platforms data
      const platformsResponse = await fetch('https://juta-dev.ngrok.dev/api/marketing/platforms');
      const platformsResult = await platformsResponse.json();
      if (platformsResult.success) {
        setPlatforms(platformsResult.data);
      }

      // Fetch ROI data
      const roiResponse = await fetch('https://juta-dev.ngrok.dev/api/marketing/roi-data');
      const roiResult = await roiResponse.json();
      if (roiResult.success) {
        setRoiData(roiResult.data);
      }

    } catch (error) {
      console.error('Error fetching marketing data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate ROI metrics
  const calculateROI = (adSpend, revenue) => {
    if (adSpend === 0) return 0;
    return ((revenue - adSpend) / adSpend) * 100;
  };

  const calculateROAS = (adSpend, revenue) => {
    if (adSpend === 0) return 0;
    return revenue / adSpend;
  };

  // Get totals
  const getTotals = () => {
    const totalAdSpend = Object.values(marketingData.adSpend).reduce((sum, val) => sum + val, 0);
    const totalRevenue = Object.values(marketingData.revenue).reduce((sum, val) => sum + val, 0);
    const totalROI = calculateROI(totalAdSpend, totalRevenue);
    const totalROAS = calculateROAS(totalAdSpend, totalRevenue);
    
    return {
      adSpend: totalAdSpend,
      revenue: totalRevenue,
      roi: totalROI,
      roas: totalROAS,
      profit: totalRevenue - totalAdSpend
    };
  };

  // Get monthly trend data
  const getMonthlyTrendData = () => {
    return monthlyData.slice(-12).map(item => ({
      month: `${item.month} ${item.year}`,
      adSpend: parseFloat(item.total_ad_spend),
      revenue: parseFloat(item.total_revenue),
      roi: calculateROI(parseFloat(item.total_ad_spend), parseFloat(item.total_revenue)),
      roas: calculateROAS(parseFloat(item.total_ad_spend), parseFloat(item.total_revenue))
    }));
  };

  // Get platform performance data
  const getPlatformPerformance = () => {
    return platforms.map(platform => ({
      name: platform.platform,
      adSpend: parseFloat(platform.total_ad_spend),
      revenue: parseFloat(platform.total_revenue),
      roi: calculateROI(parseFloat(platform.total_ad_spend), parseFloat(platform.total_revenue)),
      roas: calculateROAS(parseFloat(platform.total_ad_spend), parseFloat(platform.total_revenue)),
      campaigns: platform.campaign_count
    }));
  };

  // Get campaign performance data
  const getCampaignPerformance = () => {
    return campaigns.map(campaign => ({
      name: campaign.campaign_name,
      platform: campaign.platform,
      adSpend: parseFloat(campaign.ad_spend),
      revenue: parseFloat(campaign.revenue),
      roi: calculateROI(parseFloat(campaign.ad_spend), parseFloat(campaign.revenue)),
      roas: calculateROAS(parseFloat(campaign.ad_spend), parseFloat(campaign.revenue)),
      ctr: parseFloat(campaign.ctr),
      cpc: parseFloat(campaign.cpc),
      conversions: parseInt(campaign.conversions)
    }));
  };

  // Filter and sort campaigns
  const getFilteredAndSortedCampaigns = () => {
    let filtered = campaigns;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(campaign => 
        campaign.campaign_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.platform?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.campaign_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply platform filter
    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(campaign => campaign.platform === selectedPlatform);
    }
    
    // Apply low performing filter
    if (showLowPerforming) {
      filtered = filtered.filter(campaign => {
        const roas = calculateROAS(parseFloat(campaign.ad_spend), parseFloat(campaign.revenue));
        return roas < 2.0; // ROAS less than 2.0
      });
    }
    
    // Sort campaigns
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'name':
          aVal = (a.campaign_name || '').toLowerCase();
          bVal = (b.campaign_name || '').toLowerCase();
          break;
        case 'platform':
          aVal = (a.platform || '').toLowerCase();
          bVal = (b.platform || '').toLowerCase();
          break;
        case 'adSpend':
          aVal = parseFloat(a.ad_spend);
          bVal = parseFloat(b.ad_spend);
          break;
        case 'revenue':
          aVal = parseFloat(a.revenue);
          bVal = parseFloat(b.revenue);
          break;
        case 'roas':
        default:
          aVal = calculateROAS(parseFloat(a.ad_spend), parseFloat(a.revenue));
          bVal = calculateROAS(parseFloat(b.ad_spend), parseFloat(b.revenue));
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

  // Helper function to get platform color
  const getPlatformColor = (platform) => {
    const colors = {
      'FACEBOOK': '#1877F2',
      'GOOGLE': '#4285F4', 
      'TIKTOK': '#000000',
      'LINKEDIN': '#0077B5',
      'TWITTER': '#1DA1F2',
      'OTHER': '#6B7280'
    };
    return colors[platform] || '#6B7280';
  };

  // Helper function to get performance status
  const getPerformanceStatus = (roas) => {
    if (roas >= 4.0) return { status: 'excellent', color: '#10B981', icon: '🚀' };
    if (roas >= 3.0) return { status: 'good', color: '#059669', icon: '✅' };
    if (roas >= 2.0) return { status: 'average', color: '#F59E0B', icon: '⚠️' };
    return { status: 'poor', color: '#EF4444', icon: '❌' };
  };

  const handleAddCampaign = async () => {
    try {
      const [month, year] = selectedMonth.split(' ');
      const response = await fetch('https://juta-dev.ngrok.dev/api/marketing/add-campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newCampaign,
          month,
          year: parseInt(year),
          adSpend: parseFloat(newCampaign.adSpend),
          revenue: parseFloat(newCampaign.revenue),
          impressions: parseInt(newCampaign.impressions),
          clicks: parseInt(newCampaign.clicks),
          conversions: parseInt(newCampaign.conversions)
        }),
      });

      const result = await response.json();
      if (result.success) {
        setShowAddModal(false);
        setNewCampaign({
          name: '',
          platform: 'FACEBOOK',
          campaignType: 'Lead Generation',
          adSpend: '',
          revenue: '',
          impressions: '',
          clicks: '',
          conversions: '',
          ctr: '',
          cpc: '',
          cpm: '',
          roas: '',
          description: ''
        });
        // Refresh data
        fetchMarketingData();
      }
    } catch (error) {
      console.error('Error adding campaign:', error);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading marketing analytics...</p>
      </div>
    );
  }

  const totals = getTotals();

  return (
    <div className="marketing-analytics-container">
      {/* Quick Stats Bar */}
      <div className="quick-stats-bar">
        <div className="quick-stat">
          <div className="quick-stat-content">
            <div className="quick-stat-value">RM {totals.adSpend.toLocaleString()}</div>
            <div className="quick-stat-label">Total Ad Spend</div>
          </div>
        </div>
        <div className="quick-stat">
          <div className="quick-stat-content">
            <div className="quick-stat-value">RM {totals.revenue.toLocaleString()}</div>
            <div className="quick-stat-label">Total Revenue</div>
          </div>
        </div>
        <div className="quick-stat">
          <div className="quick-stat-content">
            <div className={`quick-stat-value ${totals.roi >= 0 ? 'positive' : 'negative'}`}>
              {totals.roi.toFixed(1)}%
            </div>
            <div className="quick-stat-label">ROI</div>
          </div>
        </div>
        <div className="quick-stat">
          <div className="quick-stat-content">
            <div className={`quick-stat-value ${totals.roas >= 2.0 ? 'positive' : 'negative'}`}>
              {totals.roas.toFixed(2)}x
            </div>
            <div className="quick-stat-label">ROAS</div>
          </div>
        </div>
        <div className="quick-stat">
          <div className="quick-stat-content">
            <div className={`quick-stat-value ${totals.profit >= 0 ? 'positive' : 'negative'}`}>
              RM {totals.profit.toLocaleString()}
            </div>
            <div className="quick-stat-label">Net Profit</div>
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
          className={`nav-tab ${viewMode === 'campaigns' ? 'active' : ''}`}
          onClick={() => setViewMode('campaigns')}
        >
          <Target size={16} />
          Campaigns
        </button>
        <button 
          className={`nav-tab ${viewMode === 'roi' ? 'active' : ''}`}
          onClick={() => setViewMode('roi')}
        >
          <TrendingUp size={16} />
          ROI Analysis
        </button>
        <button 
          className={`nav-tab ${viewMode === 'platforms' ? 'active' : ''}`}
          onClick={() => setViewMode('platforms')}
        >
          <Filter size={16} />
          Platforms
        </button>
      </div>

      {/* Overview Section */}
      {viewMode === 'overview' && (
        <div className="overview-section">
          {/* Money Machine Status */}
          <div className="money-machine-card">
            <div className="money-machine-header">
              <h3>💰 Money Machine Status</h3>
              <div className={`status-indicator ${totals.roas >= 3.0 ? 'profitable' : totals.roas >= 2.0 ? 'break-even' : 'losing'}`}>
                {totals.roas >= 3.0 ? '🚀 PROFITABLE' : totals.roas >= 2.0 ? '⚖️ BREAK-EVEN' : '❌ LOSING MONEY'}
              </div>
            </div>
            <div className="money-machine-stats">
              <div className="machine-stat">
                <div className="machine-stat-label">ROAS (Return on Ad Spend)</div>
                <div className={`machine-stat-value ${totals.roas >= 2.0 ? 'positive' : 'negative'}`}>
                  {totals.roas.toFixed(2)}x
                </div>
                <div className="machine-stat-desc">
                  {totals.roas >= 4.0 ? 'Excellent! Keep scaling!' : 
                   totals.roas >= 3.0 ? 'Good performance' : 
                   totals.roas >= 2.0 ? 'Break-even point' : 
                   'Need optimization'}
                </div>
              </div>
              <div className="machine-stat">
                <div className="machine-stat-label">ROI (Return on Investment)</div>
                <div className={`machine-stat-value ${totals.roi >= 0 ? 'positive' : 'negative'}`}>
                  {totals.roi.toFixed(1)}%
                </div>
                <div className="machine-stat-desc">
                  {totals.roi >= 200 ? 'Outstanding returns!' : 
                   totals.roi >= 100 ? 'Great returns' : 
                   totals.roi >= 0 ? 'Profitable' : 
                   'Losing money'}
                </div>
              </div>
              <div className="machine-stat">
                <div className="machine-stat-label">Net Profit</div>
                <div className={`machine-stat-value ${totals.profit >= 0 ? 'positive' : 'negative'}`}>
                  RM {totals.profit.toLocaleString()}
                </div>
                <div className="machine-stat-desc">
                  {totals.profit >= 0 ? 'Making money!' : 'Burning cash'}
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Performance Chart */}
          <div className="chart-section">
            <h3>📈 Monthly Performance Trend</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={getMonthlyTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'roi' ? `${value.toFixed(1)}%` : 
                      name === 'roas' ? `${value.toFixed(2)}x` : 
                      `RM ${value.toLocaleString()}`,
                      name === 'adSpend' ? 'Ad Spend' :
                      name === 'revenue' ? 'Revenue' :
                      name === 'roi' ? 'ROI' : 'ROAS'
                    ]}
                  />
                  <Bar yAxisId="left" dataKey="adSpend" fill="#EF4444" name="adSpend" />
                  <Bar yAxisId="left" dataKey="revenue" fill="#10B981" name="revenue" />
                  <Line yAxisId="right" type="monotone" dataKey="roas" stroke="#3B82F6" strokeWidth={3} name="roas" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Platform Performance */}
          <div className="platforms-overview">
            <h3>🎯 Platform Performance</h3>
            <div className="platforms-grid">
              {getPlatformPerformance().map((platform, index) => {
                const performance = getPerformanceStatus(platform.roas);
                return (
                  <div key={index} className="platform-card">
                    <div className="platform-header">
                      <div className="platform-icon" style={{ backgroundColor: getPlatformColor(platform.name) }}>
                        {platform.name.charAt(0)}
                      </div>
                      <div className="platform-info">
                        <h4>{platform.name}</h4>
                        <span className="campaign-count">{platform.campaigns} campaigns</span>
                      </div>
                      <div className={`performance-badge ${performance.status}`}>
                        {performance.icon} {platform.roas.toFixed(2)}x
                      </div>
                    </div>
                    <div className="platform-stats">
                      <div className="platform-stat">
                        <span className="stat-label">Ad Spend:</span>
                        <span className="stat-value">RM {platform.adSpend.toLocaleString()}</span>
                      </div>
                      <div className="platform-stat">
                        <span className="stat-label">Revenue:</span>
                        <span className="stat-value">RM {platform.revenue.toLocaleString()}</span>
                      </div>
                      <div className="platform-stat">
                        <span className="stat-label">ROI:</span>
                        <span className={`stat-value ${platform.roi >= 0 ? 'positive' : 'negative'}`}>
                          {platform.roi.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Campaigns Section */}
      {viewMode === 'campaigns' && (
        <div className="campaigns-section">
          <div className="campaigns-header">
            <div className="header-compact">
              <div className="month-selector-compact">
                <Calendar size={18} />
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="month-select-ultra"
                >
                  {marketingData.months.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
              <button className="add-btn-ultra" onClick={() => setShowAddModal(true)}>
                <Plus size={16} />
                Add Campaign
              </button>
            </div>

            <div className="filters-compact">
              <div className="search-compact">
                <Search size={14} />
                <input 
                  type="text" 
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input-ultra"
                />
              </div>
              
              <div className="filter-pills">
                <button 
                  className={`filter-pill ${selectedPlatform === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedPlatform('all')}
                >
                  All Platforms
                </button>
                {['FACEBOOK', 'GOOGLE', 'TIKTOK', 'LINKEDIN', 'TWITTER'].map(platform => (
                  <button 
                    key={platform}
                    className={`filter-pill ${selectedPlatform === platform ? 'active' : ''}`}
                    onClick={() => setSelectedPlatform(platform)}
                    style={{ 
                      backgroundColor: selectedPlatform === platform ? getPlatformColor(platform) : 'transparent',
                      borderColor: getPlatformColor(platform)
                    }}
                  >
                    {platform}
                  </button>
                ))}
              </div>

              <div className="view-pills">
                <button 
                  className={`view-pill ${!showLowPerforming ? 'active' : ''}`}
                  onClick={() => setShowLowPerforming(false)}
                >
                  All Campaigns
                </button>
                <button 
                  className={`view-pill ${showLowPerforming ? 'active' : ''}`}
                  onClick={() => setShowLowPerforming(true)}
                >
                  ⚠️ Low Performing
                </button>
              </div>
            </div>
          </div>

          <div className="campaigns-list">
            {getFilteredAndSortedCampaigns().length > 0 ? (
              getFilteredAndSortedCampaigns().map((campaign, index) => {
                const roas = calculateROAS(parseFloat(campaign.ad_spend), parseFloat(campaign.revenue));
                const roi = calculateROI(parseFloat(campaign.ad_spend), parseFloat(campaign.revenue));
                const performance = getPerformanceStatus(roas);
                
                return (
                  <div key={index} className="campaign-card">
                    <div className="campaign-header">
                      <div className="campaign-info">
                        <h4>{campaign.campaign_name}</h4>
                        <div className="campaign-meta">
                          <span className="platform-tag" style={{ backgroundColor: getPlatformColor(campaign.platform) }}>
                            {campaign.platform}
                          </span>
                          <span className="campaign-type">{campaign.campaign_type}</span>
                        </div>
                      </div>
                      <div className={`performance-indicator ${performance.status}`}>
                        {performance.icon} {roas.toFixed(2)}x ROAS
                      </div>
                    </div>
                    
                    <div className="campaign-stats">
                      <div className="stat-group">
                        <div className="stat-item">
                          <span className="stat-label">Ad Spend:</span>
                          <span className="stat-value">RM {parseFloat(campaign.ad_spend).toLocaleString()}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Revenue:</span>
                          <span className="stat-value">RM {parseFloat(campaign.revenue).toLocaleString()}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">ROI:</span>
                          <span className={`stat-value ${roi >= 0 ? 'positive' : 'negative'}`}>
                            {roi.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="stat-group">
                        <div className="stat-item">
                          <span className="stat-label">CTR:</span>
                          <span className="stat-value">{parseFloat(campaign.ctr).toFixed(2)}%</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">CPC:</span>
                          <span className="stat-value">RM {parseFloat(campaign.cpc).toFixed(2)}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Conversions:</span>
                          <span className="stat-value">{campaign.conversions}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="campaign-actions">
                      <button className="edit-btn" onClick={() => setEditingCampaign(campaign)}>
                        <Edit3 size={14} />
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🎯</div>
                <div className="empty-text">No campaigns found</div>
                <button className="empty-action" onClick={() => setShowAddModal(true)}>
                  <Plus size={14} />
                  Add Campaign
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ROI Analysis Section */}
      {viewMode === 'roi' && (
        <div className="roi-analysis">
          <h3>📊 ROI Analysis</h3>
          
          <div className="roi-charts">
            <div className="chart-card">
              <h4>ROAS Trend Over Time</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getMonthlyTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value.toFixed(2)}x`, 'ROAS']} />
                  <Line type="monotone" dataKey="roas" stroke="#3B82F6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="chart-card">
              <h4>ROI by Platform</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getPlatformPerformance()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'ROI']} />
                  <Bar dataKey="roi" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Platforms Section */}
      {viewMode === 'platforms' && (
        <div className="platforms-analysis">
          <h3>🎯 Platform Performance Analysis</h3>
          
          <div className="platforms-detailed">
            {getPlatformPerformance().map((platform, index) => {
              const performance = getPerformanceStatus(platform.roas);
              return (
                <div key={index} className="platform-detail-card">
                  <div className="platform-detail-header">
                    <div className="platform-detail-info">
                      <div className="platform-icon-large" style={{ backgroundColor: getPlatformColor(platform.name) }}>
                        {platform.name.charAt(0)}
                      </div>
                      <div>
                        <h4>{platform.name}</h4>
                        <span className="campaign-count">{platform.campaigns} campaigns</span>
                      </div>
                    </div>
                    <div className={`performance-score ${performance.status}`}>
                      <div className="score-value">{platform.roas.toFixed(2)}x</div>
                      <div className="score-label">ROAS</div>
                    </div>
                  </div>
                  
                  <div className="platform-detail-stats">
                    <div className="stat-row">
                      <span className="stat-label">Total Ad Spend</span>
                      <span className="stat-value">RM {platform.adSpend.toLocaleString()}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Total Revenue</span>
                      <span className="stat-value">RM {platform.revenue.toLocaleString()}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">ROI</span>
                      <span className={`stat-value ${platform.roi >= 0 ? 'positive' : 'negative'}`}>
                        {platform.roi.toFixed(1)}%
                      </span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Net Profit</span>
                      <span className={`stat-value ${(platform.revenue - platform.adSpend) >= 0 ? 'positive' : 'negative'}`}>
                        RM {(platform.revenue - platform.adSpend).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="platform-recommendation">
                    {platform.roas >= 4.0 ? (
                      <div className="recommendation excellent">
                        🚀 Excellent performance! Consider increasing budget allocation.
                      </div>
                    ) : platform.roas >= 3.0 ? (
                      <div className="recommendation good">
                        ✅ Good performance. Monitor and optimize further.
                      </div>
                    ) : platform.roas >= 2.0 ? (
                      <div className="recommendation average">
                        ⚠️ Break-even performance. Needs optimization.
                      </div>
                    ) : (
                      <div className="recommendation poor">
                        ❌ Poor performance. Consider pausing or major optimization.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Campaign Modal */}
      {showAddModal && (
        <div className="modal-overlay-enhanced" onClick={() => setShowAddModal(false)}>
          <div className="modal-content-enhanced" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🎯 Add New Marketing Campaign</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-section">
                <h4>Campaign Information</h4>
                <div className="form-group-enhanced">
                  <label>Campaign Name *</label>
                  <input 
                    type="text" 
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                    placeholder="e.g., Summer Sale 2024, Lead Gen Campaign"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group-enhanced">
                  <label>Platform *</label>
                  <select 
                    value={newCampaign.platform}
                    onChange={(e) => setNewCampaign({...newCampaign, platform: e.target.value})}
                    className="form-input"
                  >
                    {Object.keys(marketingData.platforms).map(platform => (
                      <option key={platform} value={platform}>{platform}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group-enhanced">
                  <label>Campaign Type *</label>
                  <select 
                    value={newCampaign.campaignType}
                    onChange={(e) => setNewCampaign({...newCampaign, campaignType: e.target.value})}
                    className="form-input"
                  >
                    {marketingData.campaignTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-section">
                <h4>Financial Metrics</h4>
                <div className="form-row">
                  <div className="form-group-enhanced">
                    <label>Ad Spend (RM) *</label>
                    <div className="amount-input-group">
                      <span className="currency-symbol">RM</span>
                      <input 
                        type="number" 
                        value={newCampaign.adSpend}
                        onChange={(e) => setNewCampaign({...newCampaign, adSpend: e.target.value})}
                        placeholder="0.00"
                        step="0.01"
                        className="form-input amount-input"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group-enhanced">
                    <label>Revenue Generated (RM) *</label>
                    <div className="amount-input-group">
                      <span className="currency-symbol">RM</span>
                      <input 
                        type="number" 
                        value={newCampaign.revenue}
                        onChange={(e) => setNewCampaign({...newCampaign, revenue: e.target.value})}
                        placeholder="0.00"
                        step="0.01"
                        className="form-input amount-input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Performance Metrics</h4>
                <div className="form-row">
                  <div className="form-group-enhanced">
                    <label>Impressions</label>
                    <input 
                      type="number" 
                      value={newCampaign.impressions}
                      onChange={(e) => setNewCampaign({...newCampaign, impressions: e.target.value})}
                      placeholder="0"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group-enhanced">
                    <label>Clicks</label>
                    <input 
                      type="number" 
                      value={newCampaign.clicks}
                      onChange={(e) => setNewCampaign({...newCampaign, clicks: e.target.value})}
                      placeholder="0"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group-enhanced">
                    <label>Conversions</label>
                    <input 
                      type="number" 
                      value={newCampaign.conversions}
                      onChange={(e) => setNewCampaign({...newCampaign, conversions: e.target.value})}
                      placeholder="0"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Additional Details</h4>
                <div className="form-group-enhanced">
                  <label>Description</label>
                  <textarea 
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                    placeholder="Optional: Add campaign notes, target audience, or additional context..."
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
                onClick={handleAddCampaign}
                disabled={!newCampaign.name || !newCampaign.adSpend || !newCampaign.revenue}
              >
                <Plus size={16} />
                Add Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingAnalytics;
