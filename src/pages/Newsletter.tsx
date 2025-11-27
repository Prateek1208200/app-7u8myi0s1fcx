import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { subscribeToNewsletter } from '@/db/api';
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    const success = await subscribeToNewsletter(email, name || null);

    if (success) {
      setSubscribed(true);
      toast.success('Successfully subscribed to newsletter!');
      setEmail('');
      setName('');
    } else {
      toast.error('Failed to subscribe. You may already be subscribed.');
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Subscribe to Our Newsletter</h1>
          <p className="text-xl text-muted-foreground">
            Get the latest articles, insights, and updates delivered to your inbox
          </p>
        </div>

        {subscribed ? (
          <Card className="border-primary">
            <CardContent className="pt-6 text-center py-12">
              <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">You're Subscribed!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for subscribing. Check your inbox for a confirmation email.
              </p>
              <Button onClick={() => setSubscribed(false)} variant="outline">
                Subscribe Another Email
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Join Our Community</CardTitle>
              <CardDescription>
                Stay updated with our latest content and exclusive insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubscribe} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name (Optional)</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Subscribe Now
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By subscribing, you agree to receive our newsletter. You can unsubscribe at any
                  time.
                </p>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">Weekly</div>
              <p className="text-sm text-muted-foreground">Curated content delivered every week</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">Exclusive</div>
              <p className="text-sm text-muted-foreground">
                Access to subscriber-only articles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">Free</div>
              <p className="text-sm text-muted-foreground">No cost, unsubscribe anytime</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
