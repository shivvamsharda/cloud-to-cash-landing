import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, Target, Zap } from 'lucide-react';

interface PuffSession {
  id: string;
  puffs_count: number;
  session_duration: number;
  rewards_earned: number;
  created_at: string;
}

interface RecentActivityProps {
  sessions: PuffSession[];
}

const RecentActivity = ({ sessions }: RecentActivityProps) => {
  const recentSessions = sessions.slice(0, 8);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getSessionQuality = (puffs: number) => {
    if (puffs >= 50) return { label: 'Excellent', color: 'bg-button-green text-pure-black' };
    if (puffs >= 30) return { label: 'Great', color: 'bg-brand-yellow text-pure-black' };
    if (puffs >= 15) return { label: 'Good', color: 'bg-brand-purple text-white' };
    return { label: 'Light', color: 'bg-muted text-muted-foreground' };
  };

  if (recentSessions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-br from-brand-purple/20 to-hero-bg/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="h-8 w-8 text-muted-text" />
        </div>
        <h3 className="text-lg font-semibold text-hero-text mb-2">
          No Activity Yet
        </h3>
        <p className="text-muted-text text-sm">
          Start tracking your first session to see your activity here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recentSessions.map((session) => {
        const quality = getSessionQuality(session.puffs_count);
        
        return (
          <Card key={session.id} className="bg-card-bg/50 border-card-border hover:border-button-green/30 transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-button-green/20 to-button-green/40 rounded-full flex items-center justify-center">
                    <Target className="h-5 w-5 text-button-green" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-hero-text">
                        Tracking Session
                      </span>
                      <Badge className={quality.color}>
                        {quality.label}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-text">
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {session.puffs_count} puffs
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(session.session_duration)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        +{session.rewards_earned.toFixed(1)} VFI
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-muted-text">
                    <Calendar className="h-3 w-3" />
                    {formatDate(session.created_at)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {sessions.length > 8 && (
        <div className="text-center pt-2">
          <p className="text-xs text-muted-text">
            Showing {recentSessions.length} of {sessions.length} sessions
          </p>
        </div>
      )}
    </div>
  );
};

export { RecentActivity };