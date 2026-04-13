import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Check, Crown, Zap, Shield } from 'lucide-react';

const Pricing: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);

  const plans = [
    {
      id: 'growth',
      name: 'Growth',
      price: '$79',
      period: '/month',
      description: 'Perfect for growing businesses',
      icon: Zap,
      features: [
        'Unlimited transactions',
        'Advanced Nexus Sentinel',
        'Multi-state filing support',
        'Email support',
        'Monthly reporting',
        'Tax calculation engine',
      ],
      stripePriceId: 'price_1OqN2R2eZvKYlo2C7X2Q2Q2Q2',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$199',
      period: '/month',
      description: 'For large-scale operations',
      icon: Crown,
      features: [
        'Everything in Growth',
        'Priority support',
        'Custom integrations',
        'Advanced analytics',
        'API access',
        'Dedicated account manager',
      ],
      stripePriceId: 'price_1OqN2R2eZvKYlo2C7X2Q2Q2Q3',
    },
  ];

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      // Redirect to login if user is not authenticated
      navigate('/login');
      return;
    }

    try {
      setLoading(planId);
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          planId: planId.toUpperCase(),
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      alert('Failed to start subscription. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Start free, upgrade when you're ready
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card key={plan.id} className="relative">
                <CardHeader className="text-center pb-8">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold">
                    {plan.name}
                  </CardTitle>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-600 ml-1">{plan.period}</span>
                  </div>
                  <CardDescription className="text-gray-600">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading === plan.id}
                    className="w-full"
                    size="lg"
                  >
                    {loading === plan.id ? (
                      'Processing...'
                    ) : user ? (
                      `Subscribe to ${plan.name}`
                    ) : (
                      'Sign in to Subscribe'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-blue-900">
                30-Day Money Back Guarantee
              </h3>
            </div>
            <p className="text-blue-700">
              Not satisfied? Get a full refund within 30 days, no questions asked.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
