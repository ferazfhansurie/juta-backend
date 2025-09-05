import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import DataTable from './DataTable';
import { tableConfigs } from './database/configs/tableConfigs.jsx';
import { useDatabaseData } from './database/hooks/useDatabaseData';
import DatabaseHeader from './database/components/DatabaseHeader';
import TableSelector from './database/components/TableSelector';
import './Database.css';

const DatabasePage = () => {
  const navigate = useNavigate();
  const {
    activeTable,
    setActiveTable,
    loading,
    getCurrentData,
    getCurrentLoadFunction,
    getCurrentSaveFunction,
    getCurrentDeleteFunction
  } = useDatabaseData();

  const navigateToCompany = (companyId) => {
    navigate(`/companies?filter=${companyId}`);
  };

  // Make navigation function available globally for table configs
  React.useEffect(() => {
    window.navigateToCompany = navigateToCompany;
    return () => {
      delete window.navigateToCompany;
    };
  }, [navigate]);

  // Get current configuration
  const currentConfig = {
    ...tableConfigs[activeTable],
    data: getCurrentData(),
    onLoad: getCurrentLoadFunction(),
    onSave: getCurrentSaveFunction(),
    onDelete: getCurrentDeleteFunction()
  };



  return (
    <div className="database-container">
      <DatabaseHeader />
      <TableSelector activeTable={activeTable} setActiveTable={setActiveTable} />
      
      {/* Data Table */}
      <div className="table-container">
        <DataTable
          title={currentConfig.title}
          description={currentConfig.description}
          columns={currentConfig.columns}
          data={currentConfig.data}
          loading={loading}
          onLoad={currentConfig.onLoad}
          onSave={currentConfig.onSave}
          onDelete={currentConfig.onDelete}
          filters={currentConfig.filters}
          searchFields={currentConfig.searchFields || ['name', 'email']}
          defaultSort={currentConfig.defaultSort || { field: 'createdAt', order: 'desc' }}
          actions={currentConfig.actions || ['edit', 'delete']}
          modalConfig={currentConfig.modalConfig}
        />
      </div>
    </div>
  );
};

export default DatabasePage;
