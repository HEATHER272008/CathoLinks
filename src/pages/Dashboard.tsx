import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { CrossLogo } from '@/components/CrossLogo';
import StudentDashboard from './StudentDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, userRole, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading || !userRole) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <CrossLogo size={120} />
          <p className="mt-4 text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return userRole === 'admin' ? <AdminDashboard /> : <StudentDashboard />;
};

export default Dashboard;