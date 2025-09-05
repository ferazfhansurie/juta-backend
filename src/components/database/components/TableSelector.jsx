import React from 'react';
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

const TableSelector = ({ activeTable, setActiveTable }) => {
  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'companies', label: 'Companies', icon: Building },
    { id: 'contacts', label: 'Contacts', icon: UserCheck },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'employees', label: 'Employees', icon: Employees },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'feedback', label: 'Feedback', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'scheduled_messages', label: 'Scheduled', icon: Clock },
    { id: 'usage_logs', label: 'Usage Logs', icon: BarChart3 }
  ];

  return (
    <div className="table-selector">
      <div className="selector-tabs">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button 
              key={tab.id}
              className={`tab ${activeTable === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTable(tab.id)}
            >
              <IconComponent size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TableSelector;
