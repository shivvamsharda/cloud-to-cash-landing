import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { Trophy, Target, Zap, Users, Star, TrendingUp, Calendar, Gift, ArrowRight, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { useUserProfile } from '@/hooks/useUserProfile';
import { usePuffSessions } from '@/hooks/usePuffSessions';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { EarningsChart } from '@/components/dashboard/EarningsChart';
import { NFTGallery } from '@/components/dashboard/NFTGallery';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';

const Dashboard = () => {
  const { profile } = useUserProfile();
  const { sessions } = usePuffSessions();
  const { leaderboard } = useLeaderboard();
  const { stats, loading } = useDashboardStats();
  const { dailySlots, getTotalRemainingTime, getAvailableSlotType } = useTimeSlots();

  // Calculate user rank
  const userRank = leaderboard.findIndex(user => user.id === profile?.id) + 1;
  const totalUsers = leaderboard.length;

  // Calculate current tier progress
  const getCurrentTier = (puffs: number) => {
    if (puffs >= 10000) return { name: 'Diamond', color: 'bg-gradient-to-r from-cyan-400 to-blue-500', progress: 100, next: null };
    if (puffs >= 5000) return { name: 'Gold', color: 'bg-gradient-to-r from-yellow-400 to-orange-500', progress: ((puffs - 5000) / 5000) * 100, next: 'Diamond (10,000 puffs)' };
    if (puffs >= 1000) return { name: 'Silver', color: 'bg-gradient-to-r from-gray-300 to-gray-500', progress: ((puffs - 1000) / 4000) * 100, next: 'Gold (5,000 puffs)' };
    if (puffs >= 100) return { name: 'Bronze', color: 'bg-gradient-to-r from-amber-600 to-yellow-600', progress: ((puffs - 100) / 900) * 100, next: 'Silver (1,000 puffs)' };
    return { name: 'Starter', color: 'bg-gradient-to-r from-green-400 to-green-600', progress: (puffs / 100) * 100, next: 'Bronze (100 puffs)' };
  };

  const currentTier = getCurrentTier(stats?.totalPuffs || 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-pure-black pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-button-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pure-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-hero-text mb-2">
            Welcome back, {profile?.username || 'Vaper'}!
          </h1>
          <p className="text-muted-text">
            Track your progress and manage your VapeFi journey
          </p>
        </div>

        {/* Beta Notice */}
        <Alert variant="destructive" className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            These stats are in beta mode currently. Real stats will go live post NFT mint or 48 hrs, whichever is sooner.
          </AlertDescription>
        </Alert>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Earnings */}
          <Card className="bg-card-bg border-card-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-text flex items-center gap-2">
                <Zap className="h-4 w-4 text-button-green" />
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-hero-text">
                {(stats?.totalEarnings || 0).toFixed(1)} $PUFF
              </div>
              <p className="text-xs text-muted-text mt-1">
                +{stats?.weeklyEarnings || 0} this week
              </p>
            </CardContent>
          </Card>

          {/* Total Puffs */}
          <Card className="bg-card-bg border-card-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-text flex items-center gap-2">
                <Target className="h-4 w-4 text-brand-purple" />
                Total Puffs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-hero-text">
                {stats?.totalPuffs || 0}
              </div>
              <p className="text-xs text-muted-text mt-1">
                +{stats?.weeklyPuffs || 0} this week
              </p>
            </CardContent>
          </Card>

          {/* Current Tier */}
          <Card className="bg-card-bg border-card-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-text flex items-center gap-2">
                <Target className="h-4 w-4 text-button-green" />
                Energy Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-hero-text">
                {getTotalRemainingTime()} min
              </div>
              <p className="text-xs text-muted-text mt-1">
                {getAvailableSlotType().multiplier}x rig multiplier active
              </p>
            </CardContent>
          </Card>

          {/* Leaderboard Rank */}
          <Card className="bg-card-bg border-card-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-text flex items-center gap-2">
                <Users className="h-4 w-4 text-hero-bg" />
                Your Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-hero-text">
                #{userRank || '--'}
              </div>
              <p className="text-xs text-muted-text mt-1">
                of {totalUsers} users
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Earnings Chart */}
            <Card className="bg-card-bg border-card-border">
              <CardHeader>
                <CardTitle className="text-hero-text flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-button-green" />
                  Earnings Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EarningsChart />
              </CardContent>
            </Card>

            {/* NFT Gallery */}
            <Card className="bg-card-bg border-card-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-hero-text flex items-center gap-2">
                  <Star className="h-5 w-5 text-brand-yellow" />
                  My NFTs
                </CardTitle>
                <Link to="/mint">
                  <Button variant="outline" size="sm">
                    Mint NFT
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <NFTGallery />
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-card-bg border-card-border">
              <CardHeader>
                <CardTitle className="text-hero-text flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-brand-purple" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RecentActivity sessions={sessions} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Quick Actions & Time Slots */}
            <Card className="bg-card-bg border-card-border">
              <CardHeader>
                <CardTitle className="text-hero-text flex items-center gap-2">
                  <Zap className="h-5 w-5 text-button-green" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QuickActions />
              </CardContent>
            </Card>

            {/* Time Slots Status */}
            <Card className="bg-card-bg border-card-border">
              <CardHeader>
                <CardTitle className="text-hero-text flex items-center gap-2">
                  <Target className="h-5 w-5 text-button-green" />
                  Today's Energy
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dailySlots ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-pure-black/30 rounded-lg border border-card-border">
                        <div className="text-sm text-muted-text">Base Energy</div>
                        <div className="text-lg font-bold text-hero-text">
                          {dailySlots.free_slot_minutes_remaining}/10
                        </div>
                        <div className="text-xs text-muted-text">Everyone gets 2 Energy</div>
                      </div>
                      <div className="text-center p-3 bg-pure-black/30 rounded-lg border border-card-border">
                        <div className="text-sm text-muted-text">Rig Energy</div>
                        <div className="text-lg font-bold text-button-green">
                          {dailySlots.nft_slot_minutes_remaining}/{dailySlots.total_available_nft_minutes}
                        </div>
                        <div className="text-xs text-muted-text">+2 per side rig owned</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-button-green/10 rounded-lg border border-button-green/20">
                      <span className="text-sm font-medium text-hero-text">Main Rig Multiplier:</span>
                      <span className="text-lg font-bold text-button-green">
                        {getAvailableSlotType().multiplier}x
                      </span>
                    </div>
                    
                    {getTotalRemainingTime() > 0 ? (
                      <Link to="/track" className="block">
                        <Button className="w-full bg-button-green hover:bg-button-green/90 text-black">
                          Start Puffing ({getTotalRemainingTime()} Energy left)
                        </Button>
                      </Link>
                    ) : (
                      <div className="text-center p-3 bg-card-bg rounded-lg border border-card-border">
                        <div className="text-sm text-muted-text">
                          No Energy remaining today
                        </div>
                        <div className="text-xs text-muted-text">
                          Battery resets at midnight
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-text">
                    Loading Energy status...
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tier Progress */}
            <Card className="bg-card-bg border-card-border">
              <CardHeader>
                <CardTitle className="text-hero-text flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-brand-yellow" />
                  Tier Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-hero-text">
                    {currentTier.name}
                  </span>
                  <Badge className={currentTier.color}>
                    Current
                  </Badge>
                </div>
                {currentTier.next && (
                  <>
                    <Progress value={currentTier.progress} className="h-3" />
                    <div className="text-sm text-muted-text">
                      Progress to {currentTier.next}
                    </div>
                  </>
                )}
                <Link to="/rewards" className="block">
                  <Button variant="outline" className="w-full" size="sm">
                    View All Tiers
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card className="bg-card-bg border-card-border">
              <CardHeader>
                <CardTitle className="text-hero-text flex items-center gap-2">
                  <Users className="h-5 w-5 text-hero-bg" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.slice(0, 5).map((user, index) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-button-green/20 to-button-green/40 text-xs font-bold text-button-green">
                          {index + 1}
                        </div>
                        <span className="text-sm text-hero-text truncate">
                          {user.username}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-muted-text">
                        {user.total_puffs}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Link to="/leaderboard" className="block">
                    <Button variant="outline" className="w-full" size="sm">
                      View Full Leaderboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;