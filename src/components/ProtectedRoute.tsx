import { Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();
  const [paymentStatus, setPaymentStatus] = useState<boolean | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(true);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!user) {
        setCheckingPayment(false);
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('payment_status')
        .eq('user_id', user.id)
        .single();

      setPaymentStatus(data?.payment_status ?? false);
      setCheckingPayment(false);
    };

    if (!loading) {
      checkPaymentStatus();
    }
  }, [user, loading]);

  if (loading || checkingPayment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Redirect to payment if user hasn't paid (unless they're an admin)
  if (!paymentStatus && !isAdmin) {
    return <Navigate to="/payment" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
