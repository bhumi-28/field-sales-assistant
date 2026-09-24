import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Visits from './pages/Visits';
import Tasks from './pages/Tasks';
import Reps from './pages/Reps';
import AiAssistant from './pages/AiAssistant';
import AiInsights from './pages/AiInsights';

function ProtectedRoute({ children, roles }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');

  if (!token) return <Navigate to="/login" />;
  if (roles && !roles.includes(role)) {
    return <Navigate to={role === 'SALES_REP' ? '/visits' : '/dashboard'} />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute roles={['ADMIN']}><Dashboard /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute roles={['ADMIN']}><Customers /></ProtectedRoute>} />
        <Route path="/visits" element={<ProtectedRoute roles={['ADMIN', 'SALES_REP']}><Visits /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute roles={['ADMIN']}><Tasks /></ProtectedRoute>} />
        <Route path="/reps" element={<ProtectedRoute roles={['ADMIN']}><Reps /></ProtectedRoute>} />
        <Route path="/insights" element={<ProtectedRoute roles={['ADMIN']}><AiInsights /></ProtectedRoute>} />
        <Route path="/assistant" element={<ProtectedRoute roles={['ADMIN', 'SALES_REP']}><AiAssistant /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;