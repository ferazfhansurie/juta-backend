import { 
  Users, 
  Building, 
  UserCheck, 
  MessageSquare,
  Calendar,
  FileText,
  Users as Employees,
  Bell,
  Clock,
  BarChart3
} from 'lucide-react';

export const tableConfigs = {
  users: {
    title: 'Users',
    description: 'Manage user accounts and permissions',
    icon: Users,
    searchFields: ['name', 'email', 'companyName'],
    defaultSort: { field: 'createdAt', order: 'desc' },
    actions: ['edit', 'delete'],
    columns: [
      { key: 'name', label: 'Name', type: 'avatar' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role', type: 'badge' },
              { 
          key: 'companyName', 
          label: 'Company', 
          render: (user) => (
            <button 
              onClick={() => {
                // Navigate to company page or filter
                if (window.navigateToCompany) {
                  window.navigateToCompany(user.companyId);
                } else {
                  console.log('Navigate to company:', user.companyId);
                }
              }} 
              className="company-link"
              style={{
                background: 'none', 
                border: 'none', 
                color: '#60a5fa', 
                cursor: 'pointer',
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.25rem', 
                padding: '0.25rem 0.5rem',
                borderRadius: '6px', 
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(59, 130, 246, 0.1)'}
              onMouseLeave={(e) => e.target.style.background = 'none'}
            >
              <span>🏢</span>
              {user.companyName || user.companyId || 'No company'}
            </button>
          )
        },
      { key: 'active', label: 'Status', type: 'status' },
      { key: 'createdAt', label: 'Created', type: 'date' }
    ],
    filters: [
      {
        key: 'role',
        label: 'All Roles',
        options: [
          { value: '1', label: 'User' },
          { value: '2', label: 'Manager' },
          { value: '3', label: 'Staff' },
          { value: '4', label: 'Admin' },
          { value: '5', label: 'Super Admin' }
        ]
      }
    ],
    modalConfig: {
      title: 'User',
      fields: [
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'role', label: 'Role', type: 'select', required: true, options: [
          { value: '1', label: 'User' },
          { value: '2', label: 'Manager' },
          { value: '3', label: 'Staff' },
          { value: '4', label: 'Admin' },
          { value: '5', label: 'Super Admin' }
        ]},
        { key: 'active', label: 'Active', type: 'checkbox', default: true }
      ]
    }
  },
  companies: {
    title: 'Companies',
    description: 'Manage company information and settings',
    icon: Building,
    searchFields: ['name', 'email', 'phone'],
    defaultSort: { field: 'createdAt', order: 'desc' },
    actions: ['edit', 'delete'],
    columns: [
      { key: 'name', label: 'Company Name', type: 'avatar' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'status', label: 'Status', type: 'badge' },
      { key: 'enabled', label: 'Enabled', type: 'status' },
      { key: 'createdAt', label: 'Created', type: 'date' }
    ],
    filters: [
      {
        key: 'status',
        label: 'All Statuses',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'suspended', label: 'Suspended' }
        ]
      }
    ],
    modalConfig: {
      title: 'Company',
      fields: [
        { key: 'name', label: 'Company Name', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'phone', label: 'Phone', type: 'text' },
        { key: 'status', label: 'Status', type: 'select', options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'suspended', label: 'Suspended' }
        ]},
        { key: 'enabled', label: 'Enabled', type: 'checkbox', default: true }
      ]
    }
  },
  contacts: {
    title: 'Contacts',
    description: 'Manage customer contacts and information',
    icon: UserCheck,
    searchFields: ['name', 'phone', 'email', 'company'],
    defaultSort: { field: 'createdAt', order: 'desc' },
    actions: ['edit', 'delete'],
    columns: [
      { key: 'name', label: 'Name', type: 'avatar' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'company', label: 'Company' },
      { key: 'assigned_to', label: 'Assigned To' },
      { key: 'createdAt', label: 'Created', type: 'date' }
    ],
    filters: [
      {
        key: 'assigned_to',
        label: 'All Assignments',
        options: [
          { value: 'unassigned', label: 'Unassigned' },
          { value: 'assigned', label: 'Assigned' }
        ]
      }
    ],
    modalConfig: {
      title: 'Contact',
      fields: [
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'phone', label: 'Phone', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'company', label: 'Company', type: 'text' },
        { key: 'assigned_to', label: 'Assigned To', type: 'text' }
      ]
    }
  },
  messages: {
    title: 'Messages',
    description: 'View and manage message history',
    icon: MessageSquare,
    searchFields: ['customer_phone', 'content'],
    defaultSort: { field: 'timestamp', order: 'desc' },
    actions: [],
    columns: [
      { key: 'customer_phone', label: 'Phone' },
      { key: 'content', label: 'Content', render: (msg) => msg.content?.substring(0, 50) + '...' },
      { key: 'message_type', label: 'Type', type: 'badge' },
      { key: 'direction', label: 'Direction', type: 'badge' },
      { key: 'status', label: 'Status', type: 'badge' },
      { key: 'timestamp', label: 'Time', type: 'date' }
    ],
    filters: [
      {
        key: 'message_type',
        label: 'All Types',
        options: [
          { value: 'text', label: 'Text' },
          { value: 'media', label: 'Media' },
          { value: 'document', label: 'Document' }
        ]
      }
    ],
    modalConfig: null
  },
  employees: {
    title: 'Employees',
    description: 'Manage employee information and assignments',
    icon: Employees,
    searchFields: ['name', 'email', 'phone_number'],
    defaultSort: { field: 'createdAt', order: 'desc' },
    actions: ['edit', 'delete'],
    columns: [
      { key: 'name', label: 'Name', type: 'avatar' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role', type: 'badge' },
      { key: 'phone_number', label: 'Phone' },
      { key: 'active', label: 'Status', type: 'status' },
      { key: 'createdAt', label: 'Created', type: 'date' }
    ],
    filters: [
      {
        key: 'role',
        label: 'All Roles',
        options: [
          { value: 'manager', label: 'Manager' },
          { value: 'employee', label: 'Employee' },
          { value: 'admin', label: 'Admin' }
        ]
      }
    ],
    modalConfig: {
      title: 'Employee',
      fields: [
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'role', label: 'Role', type: 'select', options: [
          { value: 'manager', label: 'Manager' },
          { value: 'employee', label: 'Employee' },
          { value: 'admin', label: 'Admin' }
        ]},
        { key: 'phone_number', label: 'Phone', type: 'text' },
        { key: 'active', label: 'Active', type: 'checkbox', default: true }
      ]
    }
  },
  appointments: {
    title: 'Appointments',
    description: 'Manage scheduled appointments and bookings',
    icon: Calendar,
    searchFields: ['title', 'contact_id'],
    defaultSort: { field: 'scheduled_time', order: 'desc' },
    actions: ['edit', 'delete'],
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'contact_id', label: 'Contact' },
      { key: 'scheduled_time', label: 'Scheduled', type: 'date' },
      { key: 'duration_minutes', label: 'Duration' },
      { key: 'status', label: 'Status', type: 'badge' },
      { key: 'createdAt', label: 'Created', type: 'date' }
    ],
    filters: [
      {
        key: 'status',
        label: 'All Statuses',
        options: [
          { value: 'scheduled', label: 'Scheduled' },
          { value: 'completed', label: 'Completed' },
          { value: 'cancelled', label: 'Cancelled' }
        ]
      }
    ],
    modalConfig: {
      title: 'Appointment',
      fields: [
        { key: 'title', label: 'Title', type: 'text', required: true },
        { key: 'contact_id', label: 'Contact ID', type: 'text', required: true },
        { key: 'scheduled_time', label: 'Scheduled Time', type: 'datetime-local', required: true },
        { key: 'duration_minutes', label: 'Duration (minutes)', type: 'number', required: true },
        { key: 'status', label: 'Status', type: 'select', options: [
          { value: 'scheduled', label: 'Scheduled' },
          { value: 'completed', label: 'Completed' },
          { value: 'cancelled', label: 'Cancelled' }
        ]}
      ]
    }
  },
  feedback: {
    title: 'Feedback',
    description: 'View customer feedback and ratings',
    icon: FileText,
    searchFields: ['user_id', 'comments'],
    defaultSort: { field: 'createdAt', order: 'desc' },
    actions: [],
    columns: [
      { key: 'user_id', label: 'User' },
      { key: 'type', label: 'Type', type: 'badge' },
      { key: 'rating', label: 'Rating', render: (fb) => '⭐'.repeat(fb.rating || 0) },
      { key: 'comments', label: 'Comments', render: (fb) => fb.comments?.substring(0, 50) + '...' },
      { key: 'createdAt', label: 'Submitted', type: 'date' }
    ],
    filters: [
      {
        key: 'type',
        label: 'All Types',
        options: [
          { value: 'service', label: 'Service' },
          { value: 'product', label: 'Product' },
          { value: 'support', label: 'Support' }
        ]
      }
    ],
    modalConfig: null
  },
  notifications: {
    title: 'Notifications',
    description: 'Manage system notifications and alerts',
    icon: Bell,
    searchFields: ['title'],
    defaultSort: { field: 'createdAt', order: 'desc' },
    actions: [],
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'type', label: 'Type', type: 'badge' },
      { key: 'read', label: 'Read', type: 'status' },
      { key: 'createdAt', label: 'Created', type: 'date' }
    ],
    filters: [
      {
        key: 'type',
        label: 'All Types',
        options: [
          { value: 'info', label: 'Info' },
          { value: 'warning', label: 'Warning' },
          { value: 'error', label: 'Error' }
        ]
      }
    ],
    modalConfig: null
  },
  scheduled_messages: {
    title: 'Scheduled Messages',
    description: 'Manage scheduled and automated messages',
    icon: Clock,
    searchFields: ['contact_id', 'message_content'],
    defaultSort: { field: 'scheduled_time', order: 'desc' },
    actions: [],
    columns: [
      { key: 'contact_id', label: 'Contact' },
      { key: 'message_content', label: 'Content', render: (msg) => msg.message_content?.substring(0, 50) + '...' },
      { key: 'scheduled_time', label: 'Scheduled', type: 'date' },
      { key: 'status', label: 'Status', type: 'badge' },
      { key: 'createdAt', label: 'Created', type: 'date' }
    ],
    filters: [
      {
        key: 'status',
        label: 'All Statuses',
        options: [
          { value: 'pending', label: 'Pending' },
          { value: 'sent', label: 'Sent' },
          { value: 'failed', label: 'Failed' }
        ]
      }
    ],
    modalConfig: null
  },
  usage_logs: {
    title: 'Usage Logs',
    description: 'Track feature usage and analytics',
    icon: BarChart3,
    searchFields: ['feature'],
    defaultSort: { field: 'date', order: 'desc' },
    actions: [],
    columns: [
      { key: 'feature', label: 'Feature', type: 'badge' },
      { key: 'usage_count', label: 'Count' },
      { key: 'date', label: 'Date', type: 'date' }
    ],
    filters: [
      {
        key: 'feature',
        label: 'All Features',
        options: [
          { value: 'ai_response', label: 'AI Response' },
          { value: 'message', label: 'Message' },
          { value: 'appointment', label: 'Appointment' }
        ]
      }
    ],
    modalConfig: null
  }
};
