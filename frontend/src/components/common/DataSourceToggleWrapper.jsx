import DraggableDataSourceToggle from './DraggableDataSourceToggle';

const DataSourceToggleWrapper = () => {
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.port === '3000' ||
                      window.location.port === '8000';

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user?.role || user?.active_role || user?.current_role;
  const isSuperAdmin = role === 'super_admin';

  const shouldShow = isLocalhost || isSuperAdmin;

  if (!shouldShow) return null;

  return <DraggableDataSourceToggle />;
};

export default DataSourceToggleWrapper;
