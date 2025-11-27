import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/db/supabase';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setError('No session ID found');
      setVerifying(false);
      return;
    }

    verifyPayment(sessionId);
  }, [searchParams]);

  const verifyPayment = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify_stripe_payment', {
        body: JSON.stringify({ sessionId }),
      });

      if (error) {
        const errorMsg = await error?.context?.text();
        console.error('Edge function error in verify_stripe_payment:', errorMsg);
        setError('Failed to verify payment');
        return;
      }

      if (data?.data?.verified) {
        setVerified(true);
      } else {
        setError('Payment not verified');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('An error occurred during verification');
    } finally {
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Verifying Payment</h2>
            <p className="text-muted-foreground">Please wait while we confirm your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !verified) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16 text-destructive" />
            </div>
            <CardTitle className="text-center text-2xl">Payment Failed</CardTitle>
            <CardDescription className="text-center">
              {error || 'We could not verify your payment'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => navigate('/pricing')} className="w-full">
              Try Again
            </Button>
            <Button onClick={() => navigate('/')} variant="outline" className="w-full">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-center text-2xl">Payment Successful!</CardTitle>
          <CardDescription className="text-center">
            Thank you for your subscription. Your account has been upgraded.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">What's Next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Access to premium content</li>
              <li>✓ Ad-free reading experience</li>
              <li>✓ Advanced features unlocked</li>
            </ul>
          </div>
          <Button onClick={() => navigate('/')} className="w-full">
            Start Exploring
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
