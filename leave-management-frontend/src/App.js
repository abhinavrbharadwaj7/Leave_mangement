import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import EmployeeDashboard from './components/EmployeeDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import { ConfigProvider } from 'antd';
import 'antd/dist/reset.css';

function App() {
  return (
    <ConfigProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
          <Route path="/manager-dashboard" element={<ManagerDashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
