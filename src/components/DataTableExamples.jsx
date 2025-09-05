import React, { useState, useEffect } from 'react';
import { Building2, User, Mail, Calendar, Phone, Globe, MapPin } from 'lucide-react';
import DataTable from './DataTable';

// Example 1: Simple Products Table
const ProductsTable = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    // Simulate API call
    setTimeout(() => {
      setProducts([
        { id: 1, name: 'Laptop', category: 'Electronics', price: 999.99, stock: 50, active: true },
        { id: 2, name: 'Mouse', category: 'Electronics', price: 29.99, stock: 100, active: true },
        { id: 3, name: 'Desk', category: 'Furniture', price: 199.99, stock: 25, active: false },
      ]);
      setLoading(false);
    }, 1000);
  };

  const columns = [
    { key: 'name', label: 'Product Name' },
    { key: 'category', label: 'Category', type: 'badge' },
    { key: 'price', label: 'Price', render: (product) => `$${product.price}` },
    { key: 'stock', label: 'Stock' },
    { key: 'active', label: 'Status', type: 'status' }
  ];

  const filters = [
    {
      key: 'category',
      label: 'All Categories',
      options: [
        { value: 'Electronics', label: 'Electronics' },
        { value: 'Furniture', label: 'Furniture' }
      ]
    }
  ];

  const modalConfig = {
    title: 'Product',
    fields: [
      { key: 'name', label: 'Product Name', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'select', required: true, options: [
        { value: 'Electronics', label: 'Electronics' },
        { value: 'Furniture', label: 'Furniture' }
      ]},
      { key: 'price', label: 'Price', type: 'number', required: true },
      { key: 'stock', label: 'Stock', type: 'number', required: true },
      { key: 'active', label: 'Active', type: 'checkbox', default: true }
    ]
  };

  return (
    <DataTable
      title="Products"
      description="Manage your product inventory"
      columns={columns}
      data={products}
      loading={loading}
      onLoad={loadProducts}
      filters={filters}
      searchFields={['name', 'category']}
      actions={['edit', 'delete']}
      modalConfig={modalConfig}
    />
  );
};

// Example 2: Orders Table with Complex Data
const OrdersTable = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setTimeout(() => {
      setOrders([
        { 
          id: 1, 
          customerName: 'John Doe', 
          customerEmail: 'john@example.com',
          total: 1029.98, 
          status: 'completed', 
          orderDate: '2024-01-15',
          items: 2
        },
        { 
          id: 2, 
          customerName: 'Jane Smith', 
          customerEmail: 'jane@example.com',
          total: 199.99, 
          status: 'pending', 
          orderDate: '2024-01-16',
          items: 1
        },
      ]);
      setLoading(false);
    }, 1000);
  };

  const columns = [
    {
      key: 'customerName',
      label: 'Customer',
      type: 'avatar',
      render: (order) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-blue)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
            fontSize: '0.75rem', fontWeight: '600'
          }}>
            {order.customerName?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: '500' }}>{order.customerName}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{order.customerEmail}</div>
          </div>
        </div>
      )
    },
    { key: 'total', label: 'Total', render: (order) => `$${order.total}` },
    { key: 'items', label: 'Items' },
    { key: 'status', label: 'Status', type: 'badge' },
    { key: 'orderDate', label: 'Order Date', type: 'date' }
  ];

  const filters = [
    {
      key: 'status',
      label: 'All Statuses',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
      ]
    }
  ];

  return (
    <DataTable
      title="Orders"
      description="Track customer orders"
      columns={columns}
      data={orders}
      loading={loading}
      onLoad={loadOrders}
      filters={filters}
      searchFields={['customerName', 'customerEmail']}
      defaultSort={{ field: 'orderDate', order: 'desc' }}
      actions={['edit']}
    />
  );
};

// Example 3: Analytics Table (Read-only)
const AnalyticsTable = () => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    setTimeout(() => {
      setAnalytics([
        { 
          page: '/dashboard', 
          views: 1250, 
          uniqueVisitors: 890, 
          bounceRate: '23%', 
          avgTime: '2m 34s',
          lastUpdated: '2024-01-16'
        },
        { 
          page: '/products', 
          views: 890, 
          uniqueVisitors: 567, 
          bounceRate: '45%', 
          avgTime: '1m 12s',
          lastUpdated: '2024-01-16'
        },
      ]);
      setLoading(false);
    }, 1000);
  };

  const columns = [
    { key: 'page', label: 'Page' },
    { key: 'views', label: 'Views' },
    { key: 'uniqueVisitors', label: 'Unique Visitors' },
    { key: 'bounceRate', label: 'Bounce Rate' },
    { key: 'avgTime', label: 'Avg. Time' },
    { key: 'lastUpdated', label: 'Last Updated', type: 'date' }
  ];

  return (
    <DataTable
      title="Page Analytics"
      description="Website performance metrics"
      columns={columns}
      data={analytics}
      loading={loading}
      onLoad={loadAnalytics}
      searchFields={['page']}
      defaultSort={{ field: 'views', order: 'desc' }}
      actions={[]} // Read-only table
    />
  );
};

// Example 4: Settings Table with Custom Actions
const SettingsTable = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    setTimeout(() => {
      setSettings([
        { 
          key: 'site_name', 
          value: 'My Store', 
          category: 'General', 
          description: 'Website name',
          editable: true
        },
        { 
          key: 'maintenance_mode', 
          value: 'false', 
          category: 'System', 
          description: 'Enable maintenance mode',
          editable: true
        },
        { 
          key: 'api_version', 
          value: 'v2.1.0', 
          category: 'System', 
          description: 'Current API version',
          editable: false
        },
      ]);
      setLoading(false);
    }, 1000);
  };

  const columns = [
    { key: 'key', label: 'Setting Key' },
    { key: 'value', label: 'Value' },
    { key: 'category', label: 'Category', type: 'badge' },
    { key: 'description', label: 'Description' },
    { 
      key: 'editable', 
      label: 'Editable', 
      render: (setting) => (
        <span style={{
          background: setting.editable ? 'var(--accent-green)' : 'var(--accent-red)',
          color: 'white', padding: '0.25rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem'
        }}>
          {setting.editable ? 'Yes' : 'No'}
        </span>
      )
    }
  ];

  const filters = [
    {
      key: 'category',
      label: 'All Categories',
      options: [
        { value: 'General', label: 'General' },
        { value: 'System', label: 'System' }
      ]
    }
  ];

  const modalConfig = {
    title: 'Setting',
    fields: [
      { key: 'key', label: 'Setting Key', type: 'text', required: true },
      { key: 'value', label: 'Value', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'select', required: true, options: [
        { value: 'General', label: 'General' },
        { value: 'System', label: 'System' }
      ]},
      { key: 'description', label: 'Description', type: 'textarea', required: true },
      { key: 'editable', label: 'Editable', type: 'checkbox', default: true }
    ]
  };

  return (
    <DataTable
      title="Settings"
      description="Configure application settings"
      columns={columns}
      data={settings}
      loading={loading}
      onLoad={loadSettings}
      filters={filters}
      searchFields={['key', 'description']}
      actions={['edit']}
      modalConfig={modalConfig}
    />
  );
};

// Main component that demonstrates all examples
const DataTableExamples = () => {
  const [activeExample, setActiveExample] = useState('products');

  const examples = {
    products: { component: ProductsTable, label: 'Products Table' },
    orders: { component: OrdersTable, label: 'Orders Table' },
    analytics: { component: AnalyticsTable, label: 'Analytics Table' },
    settings: { component: SettingsTable, label: 'Settings Table' }
  };

  const ActiveComponent = examples[activeExample].component;

  return (
    <div>
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h1>DataTable Component Examples</h1>
        <p>Demonstrating the reusable DataTable component with different configurations</p>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          {Object.entries(examples).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => setActiveExample(key)}
              className={activeExample === key ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <ActiveComponent />
    </div>
  );
};

export default DataTableExamples;
