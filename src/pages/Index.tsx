import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { CrossLogo } from '@/components/CrossLogo';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate('/dashboard');
      } else {
        navigate('/auth');
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <div className="text-center">
        <CrossLogo size={120} />
        <p className="mt-4 text-lg text-muted-foreground">Loading CathoLink...</p>
      </div>
    </div>
  );
};

export default Index;
