import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Target, Star, User, Trophy, Zap, Gift } from 'lucide-react';

const QuickActions = () => {
  const actions = [
    {
      icon: Target,
      label: 'Start Tracking',
      description: 'Begin a new puff session',
      href: '/track',
      variant: 'hero-primary' as const,
    },
    {
      icon: Star,
      label: 'Mint NFT',
      description: 'Get your VapeFi NFT',
      href: '/mint',
      variant: 'outline' as const,
    },
    {
      icon: User,
      label: 'Edit Profile',
      description: 'Update your info',
      href: '/profile',
      variant: 'outline' as const,
    },
    {
      icon: Trophy,
      label: 'View Rewards',
      description: 'See all tier benefits',
      href: '/rewards',
      variant: 'outline' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3">
      {actions.map((action) => {
        const IconComponent = action.icon;
        
        return (
          <Link key={action.label} to={action.href} className="block">
            <Button 
              variant={action.variant}
              className="w-full h-auto p-4 justify-start"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="w-8 h-8 rounded-full bg-current/10 flex items-center justify-center">
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium text-sm">
                    {action.label}
                  </div>
                  <div className="text-xs opacity-70">
                    {action.description}
                  </div>
                </div>
              </div>
            </Button>
          </Link>
        );
      })}

      {/* Special Promo Section */}
      <div className="mt-4 p-4 bg-gradient-to-r from-brand-purple/10 to-brand-yellow/10 border border-brand-purple/20 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-yellow/20 flex items-center justify-center">
            <Gift className="h-4 w-4 text-brand-yellow" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-hero-text">
              Daily Bonus
            </div>
            <div className="text-xs text-muted-text">
              Complete 10 puffs for +5 $VAPE
            </div>
          </div>
        </div>
        <div className="mt-3">
          <div className="w-full bg-card-border rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-brand-purple to-brand-yellow h-2 rounded-full transition-all duration-300" 
              style={{ width: '60%' }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-text mt-1">
            <span>6 / 10 puffs</span>
            <span>+5 $VAPE</span>
          </div>
        </div>
      </div>

      {/* Weekly Challenge */}
      <div className="p-4 bg-gradient-to-r from-button-green/10 to-hero-bg/10 border border-button-green/20 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-button-green/20 flex items-center justify-center">
            <Zap className="h-4 w-4 text-button-green" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-hero-text">
              Weekly Challenge
            </div>
            <div className="text-xs text-muted-text">
              Track 5 days this week for bonus multiplier
            </div>
          </div>
        </div>
        <div className="mt-3">
          <div className="w-full bg-card-border rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-button-green to-hero-bg h-2 rounded-full transition-all duration-300" 
              style={{ width: '80%' }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-text mt-1">
            <span>4 / 5 days</span>
            <span>1.5x multiplier</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export { QuickActions };