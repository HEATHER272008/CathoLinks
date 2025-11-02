import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CrossLogo } from '@/components/CrossLogo';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const AdminAttendance = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  if (userRole !== 'admin') {
    navigate('/dashboard');
    return null;
  }

  useEffect(() => {
    const fetchAttendance = async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .order('scanned_at', { ascending: false })
        .limit(100);

      if (!error && data) {
        setAttendance(data);
      }
      setLoading(false);
    };

    fetchAttendance();

    // Set up real-time subscription
    const channel = supabase
      .channel('attendance-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'attendance'
        },
        (payload) => {
          setAttendance((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-6xl mx-auto">
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CrossLogo size={80} />
            </div>
            <CardTitle className="text-2xl">Attendance Logs</CardTitle>
            <CardDescription>
              All student attendance records
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading records...</p>
              </div>
            ) : attendance.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No attendance records yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Records will appear here once students scan their QR codes
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {attendance.map((record) => (
                  <Card key={record.id} className="border-l-4 border-l-primary">
                    <CardContent className="py-4">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-lg">{record.student_name}</p>
                          <p className="text-sm text-muted-foreground">Section: {record.section}</p>
                        </div>
                        <div className="flex-1 text-left md:text-center">
                          <p className="text-sm font-medium">
                            {format(new Date(record.scanned_at), 'EEEE, MMM d, yyyy')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(record.scanned_at), 'h:mm a')}
                          </p>
                        </div>
                        <div className="flex-1 text-left md:text-right">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Present
                          </span>
                          {record.parent_notified && (
                            <p className="text-xs text-muted-foreground mt-1">Parent notified</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAttendance;