import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CrossLogo } from '@/components/CrossLogo';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminScanner = () => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const [scanning, setScanning] = useState(true);
  const [scannedStudent, setScannedStudent] = useState<any>(null);

  if (userRole !== 'admin') {
    navigate('/dashboard');
    return null;
  }

  const handleScan = async (result: any) => {
    if (!result || !scanning) return;

    try {
      setScanning(false);
      const studentData = JSON.parse(result[0].rawValue);
      
      // Check if already scanned today
      const today = new Date().toISOString().split('T')[0];
      const { data: existingAttendance } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentData.user_id)
        .gte('scanned_at', `${today}T00:00:00`)
        .lte('scanned_at', `${today}T23:59:59`)
        .single();

      if (existingAttendance) {
        toast({
          title: 'Already Recorded',
          description: `${studentData.name} has already been marked present today.`,
          variant: 'destructive',
        });
        
        setTimeout(() => {
          setScanning(true);
        }, 3000);
        return;
      }

      // Record attendance
      const { error } = await supabase
        .from('attendance')
        .insert({
          student_id: studentData.user_id,
          student_name: studentData.name,
          section: studentData.section,
          scanned_by: user?.id,
          parent_notified: false
        });

      if (error) throw error;

      setScannedStudent(studentData);
      
      toast({
        title: 'Attendance Recorded',
        description: `${studentData.name} from ${studentData.section} has been marked present.`,
      });

      // Simulate parent notification (in production, call edge function)
      console.log(`Sending SMS to ${studentData.parent_number}: Your son/daughter, ${studentData.name} from ${studentData.section}, has entered the school safely.`);

      // Reset after 3 seconds
      setTimeout(() => {
        setScannedStudent(null);
        setScanning(true);
      }, 3000);

    } catch (error: any) {
      console.error('Scan error:', error);
      toast({
        variant: 'destructive',
        title: 'Scan Failed',
        description: error.message || 'Invalid QR code',
      });
      
      setTimeout(() => {
        setScanning(true);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-2xl mx-auto">
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
            <CardTitle className="text-2xl">Student QR Scanner</CardTitle>
            <CardDescription>
              Scan student QR codes to record attendance
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex flex-col items-center gap-6">
            {scannedStudent ? (
              <div className="w-full max-w-md text-center space-y-4 py-8">
                <CheckCircle className="h-24 w-24 text-green-500 mx-auto animate-scale-in" />
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-green-600">Attendance Recorded!</h3>
                  <p className="text-lg font-semibold">{scannedStudent.name}</p>
                  <p className="text-muted-foreground">Section: {scannedStudent.section}</p>
                  <p className="text-sm text-muted-foreground">Parent notified at: {scannedStudent.parent_number}</p>
                </div>
              </div>
            ) : scanning ? (
              <div className="w-full max-w-md">
                <Scanner
                  onScan={handleScan}
                  components={{
                    finder: true,
                  }}
                  styles={{
                    container: {
                      width: '100%',
                      borderRadius: '0.75rem',
                      overflow: 'hidden',
                    },
                  }}
                />
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Position the QR code within the frame
                </p>
              </div>
            ) : (
              <div className="w-full max-w-md text-center py-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Processing...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminScanner;