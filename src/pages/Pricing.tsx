import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface PricingTier {
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  cta: string;
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      'Read unlimited free articles',
      'Comment on posts',
      'Bookmark articles',
      'Follow creators',
      'Basic search',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Premium',
    price: 9.99,
    period: 'month',
    description: 'For serious readers and learners',
    features: [
      'Everything in Free',
      'Access to premium content',
      'Ad-free reading experience',
      'Advanced search filters',
      'Download articles offline',
      'Priority support',
    ],
    popular: true,
    cta: 'Subscribe Now',
  },
  {
    name: 'Creator',
    price: 29.99,
    period: 'month',
    description: 'For content creators and publishers',
    features: [
      'Everything in Premium',
      'Publish unlimited articles',
      'Advanced analytics dashboard',
      'Monetization tools',
      'Custom author page',
      'Newsletter integration',
      'Priority content review',
    ],
    cta: 'Start Creating',
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (tier: PricingTier) => {
    if (tier.price === 0) {
      if (!user) {
        navigate('/login');
      } else {
        toast.success('You already have free access!');
      }
      return;
    }

    if (!user) {
      toast.error('Please sign in to subscribe');
      navigate('/login');
      return;
    }

    setLoading(tier.name);

    try {
      const { data, error } = await supabase.functions.invoke('create_stripe_checkout', {
        body: JSON.stringify({
          items: [
            {
              name: `${tier.name} Subscription`,
              price: tier.price,
              quantity: 1,
            },
          ],
          currency: 'usd',
          payment_method_types: ['card'],
        }),
      });

      if (error) {
        const errorMsg = await error?.context?.text();
        console.error('Edge function error in create_stripe_checkout:', errorMsg);
        toast.error('Failed to create checkout session');
        return;
      }

      if (data?.data?.url) {
        window.location.href = data.data.url;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <Badge className="mb-4 bg-secondary">Pricing Plans</Badge>
        <h1 className="text-4xl xl:text-5xl font-bold mb-4">
          Choose Your Perfect Plan
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Start free and upgrade as you grow. All plans include our core features.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {pricingTiers.map((tier) => (
          <Card
            key={tier.name}
            className={`relative ${
              tier.popular ? 'border-primary shadow-lg scale-105' : ''
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-secondary px-4 py-1">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}

            <CardHeader>
              <CardTitle className="text-2xl">{tier.name}</CardTitle>
              <CardDescription>{tier.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">${tier.price}</span>
                <span className="text-muted-foreground">/{tier.period}</span>
              </div>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Button
                onClick={() => handleSubscribe(tier)}
                disabled={loading === tier.name}
                className="w-full"
                variant={tier.popular ? 'default' : 'outline'}
              >
                {loading === tier.name ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  tier.cta
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="text-muted-foreground mb-4">
          All plans include 30-day money-back guarantee
        </p>
        <p className="text-sm text-muted-foreground">
          Need a custom plan for your team?{' '}
          <Button variant="link" className="p-0 h-auto">
            Contact us
          </Button>
        </p>
      </div>
    </div>
  );
}
