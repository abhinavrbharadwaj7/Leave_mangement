import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const userData = localStorage.getItem('userData');
  
  if (!userData) {
    // Redirect to login if not authenticated
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
