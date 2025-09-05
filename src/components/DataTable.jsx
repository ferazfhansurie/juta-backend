import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Building2, User, Mail, Calendar, Download } from 'lucide-react';

const DataTable = ({ 
  title, 
  description, 
  columns, 
  data, 
  loading, 
  onLoad, 
  onSave, 
  onDelete, 
  filters = [], 
  searchFields = [],
  defaultSort = { field: 'created_at', order: 'desc' },
  actions = ['edit', 'delete'],
  modalConfig = null
}) => {
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValues, setFilterValues] = useState({});
  const [sortBy, setSortBy] = useState(defaultSort.field);
  const [sortOrder, setSortOrder] = useState(defaultSort.order);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    if (onLoad) {
      onLoad();
    }
  }, []);

  useEffect(() => {
    filterAndSortData();
  }, [data, searchTerm, filterValues, sortBy, sortOrder]);

  const filterAndSortData = () => {
    let filtered = data.filter(item => {
      // Search filtering
      const matchesSearch = searchFields.length === 0 || searchFields.some(field => 
        item[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Filter filtering
      const matchesFilters = filters.every(filter => {
        const value = filterValues[filter.key];
        return !value || value === 'all' || item[filter.key] === value;
      });
      
      return matchesSearch && matchesFilters;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'created_at' || sortBy === 'updated_at') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredData(filtered);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleSave = async (itemData) => {
    try {
      if (onSave) {
        await onSave(itemData, editingItem);
      }
      setShowModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleDelete = async (item) => {
    if (onDelete) {
      await onDelete(item);
    }
  };

  const renderCell = (item, column) => {
    if (column.render) {
      return column.render(item);
    }

    const value = item[column.key];
    
    if (column.type === 'date') {
      if (!value) return 'N/A';
      try {
        return new Date(value).toLocaleDateString();
      } catch (error) {
        return value; // Return original value if date parsing fails
      }
    }
    
    if (column.type === 'status') {
      return (
        <span style={{
          background: value ? 'var(--accent-green)' : 'var(--accent-red)',
          color: 'white', 
          padding: '0.25rem 0.5rem', 
          borderRadius: '12px', 
          fontSize: '0.75rem'
        }}>
          {value ? 'Active' : 'Inactive'}
        </span>
      );
    }
    
    if (column.type === 'badge') {
      const colors = {
        // Role numbers
        '1': 'var(--accent-blue)',
        '2': 'var(--accent-purple)',
        '3': 'var(--accent-green)',
        '4': 'var(--accent-red)',
        '5': 'var(--accent-orange)',
        // Text roles (fallback)
        admin: 'var(--accent-red)',
        manager: 'var(--accent-purple)',
        user: 'var(--accent-blue)',
        active: 'var(--accent-green)',
        inactive: 'var(--accent-red)'
      };
      
      const roleLabels = {
        '1': 'User',
        '2': 'Manager',
        '3': 'Staff',
        '4': 'Admin',
        '5': 'Super Admin'
      };
      
      return (
        <span style={{
          background: colors[value] || 'var(--accent-blue)',
          color: 'white', 
          padding: '0.25rem 0.5rem', 
          borderRadius: '12px', 
          fontSize: '0.75rem', 
          fontWeight: '500'
        }}>
          {roleLabels[value] || value}
        </span>
      );
    }
    
    if (column.type === 'avatar') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            background: 'var(--accent-blue)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'white',
            fontSize: '0.75rem', 
            fontWeight: '600'
          }}>
            {value?.charAt(0)?.toUpperCase()}
          </div>
          {value}
        </div>
      );
    }
    
    if (column.type === 'link') {
      return (
        <button
          onClick={() => column.onClick?.(item)}
          className="company-link"
          style={{
            background: 'none', 
            border: 'none', 
            color: 'var(--accent-blue)', 
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
          {column.icon && <column.icon size={14} />}
          {value}
        </button>
      );
    }
    
    return value;
  };

  const getIconForColumn = (column) => {
    const iconMap = {
      name: User,
      email: Mail,
      company: Building2,
      created_at: Calendar,
      updated_at: Calendar
    };
    return iconMap[column.key] || null;
  };

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner"></div><p>Loading {title.toLowerCase()}...</p></div>;
  }

  return (
    <div>
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>{title}</h1>
            <p style={{ color: 'var(--text-muted)' }}>{filteredData.length} of {data.length} {title.toLowerCase()}</p>
          </div>
          {modalConfig && (
            <button onClick={() => setShowModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={16} />Add {title.slice(0, -1)}
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {searchFields.length > 0 && (
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div className="search-container">
                <Search size={16} />
                <input
                  type="text"
                  placeholder={`Search ${title.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
          )}
          
          {filters.map(filter => (
            <select 
              key={filter.key}
              value={filterValues[filter.key] || 'all'} 
              onChange={(e) => setFilterValues({ ...filterValues, [filter.key]: e.target.value })} 
              className="filter-select"
            >
              <option value="all">{filter.label}</option>
              {filter.options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          ))}
        </div>
      </div>

      <div className="glass-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map(column => (
                  <th 
                    key={column.key} 
                    onClick={() => column.sortable !== false && handleSort(column.key)} 
                    className={column.sortable !== false ? 'sortable' : ''}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {(() => {
                        const IconComponent = getIconForColumn(column);
                        return IconComponent && <IconComponent size={14} />;
                      })()}
                      {column.label} 
                      {sortBy === column.key && (sortOrder === 'asc' ? '↑' : '↓')}
                    </div>
                  </th>
                ))}
                {actions.length > 0 && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index}>
                  {columns.map(column => (
                    <td key={column.key}>
                      {renderCell(item, column)}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {actions.includes('edit') && (
                          <button onClick={() => handleEdit(item)} className="btn-icon" title={`Edit ${title.slice(0, -1).toLowerCase()}`}>
                            <Edit size={14} />
                          </button>
                        )}
                        {actions.includes('delete') && (
                          <button onClick={() => handleDelete(item)} className="btn-icon btn-danger" title={`Delete ${title.slice(0, -1).toLowerCase()}`}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && modalConfig && (
        <DataTableModal
          item={editingItem}
          config={modalConfig}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingItem(null); }}
        />
      )}
    </div>
  );
};

const DataTableModal = ({ item, config, onSave, onClose }) => {
  const [formData, setFormData] = useState(() => {
    const initial = {};
    config.fields.forEach(field => {
      initial[field.key] = item?.[field.key] || field.default || '';
    });
    return initial;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const renderField = (field) => {
    const value = formData[field.key];
    
    if (field.type === 'select') {
      return (
        <select 
          value={value} 
          onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
          required={field.required}
        >
          {field.options.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      );
    }
    
    if (field.type === 'checkbox') {
      return (
        <label>
          <input 
            type="checkbox" 
            checked={value} 
            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.checked })}
          />
          {field.label}
        </label>
      );
    }
    
    if (field.type === 'textarea') {
      return (
        <textarea 
          value={value} 
          onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
          required={field.required}
          rows={field.rows || 3}
        />
      );
    }
    
    return (
      <input 
        type={field.type || 'text'} 
        value={value} 
        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
        required={field.required}
        placeholder={field.placeholder}
      />
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{item ? `Edit ${config.title}` : `Add New ${config.title}`}</h3>
        <form onSubmit={handleSubmit}>
          {config.fields.map(field => (
            <div key={field.key} className="form-group">
              {field.type !== 'checkbox' && <label>{field.label}</label>}
              {renderField(field)}
            </div>
          ))}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{item ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DataTable;
