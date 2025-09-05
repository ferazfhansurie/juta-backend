import React from 'react';
import { Database as DatabaseIcon } from 'lucide-react';

const DatabaseHeader = () => {
  return (
    <div className="glass-header">
      <div className="header-content">
        <div className="header-left">
          <div className="header-icon">
            <DatabaseIcon size={24} />
          </div>
          <div className="header-text">
            <h1>Database</h1>
            <p>Manage your data tables and records</p>
          </div>
        </div>
        <div className="header-actions">
          {/* Add any header actions here */}
        </div>
      </div>
    </div>
  );
};

export default DatabaseHeader;
