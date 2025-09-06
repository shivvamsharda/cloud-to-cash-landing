import { Crown, Trophy, Medal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLeaderboard } from "@/hooks/useLeaderboard";

const LeaderboardSection = () => {
  const { leaderboard, loading } = useLeaderboard();

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-[hsl(var(--button-green))]" />;
    if (rank === 2) return <Trophy className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-500" />;
    return null;
  };

  const getStatusBadge = (totalPuffs: number) => {
    const getStatus = (puffs: number) => {
      if (puffs >= 1000) return "Premium";
      if (puffs >= 100) return "Active";
      return "New Player";
    };
    
    const status = getStatus(totalPuffs);
    const variants: Record<string, { className: string; text: string }> = {
      "Premium": { 
        className: "bg-[hsl(var(--button-green))]/20 text-[hsl(var(--button-green))] border-[hsl(var(--button-green))]/30", 
        text: "PREMIUM" 
      },
      "Active": { 
        className: "bg-blue-500/20 text-blue-300 border-blue-500/30", 
        text: "ACTIVE" 
      },
      "New Player": { 
        className: "bg-purple-500/20 text-purple-300 border-purple-500/30", 
        text: "ROOKIE" 
      }
    };
    
    const variant = variants[status] || variants["Active"];
    return (
      <Badge className={`${variant.className} text-xs font-semibold px-2 py-1 rounded-full border`}>
        {variant.text}
      </Badge>
    );
  };

  const getRankDisplay = (rank: number) => {
    if (rank <= 3) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-[hsl(var(--button-green))]">#{rank}</span>
          {getRankIcon(rank)}
        </div>
      );
    }
    return <span className="text-xl font-semibold text-white/80">#{rank}</span>;
  };

  return (
    <section id="leaderboard" className="bg-[hsl(var(--pure-black))] py-24 px-6 relative overflow-hidden">
      {/* Grid Background */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.08) 1px, transparent 0)
          `,
          backgroundSize: '30px 30px'
        }}
      />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            <span className="text-[hsl(var(--button-green))]">LEADERBOARD</span>
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Compete with vapers worldwide and climb to the top
          </p>
        </div>
        
        {/* Leaderboard Container */}
        <div className="bg-gradient-to-br from-[hsl(var(--card-bg))] to-[hsl(var(--pure-black))] border border-[hsl(var(--card-border))] rounded-2xl p-4 md:p-8 backdrop-blur-sm">
          {/* Desktop Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 pb-6 mb-6 border-b border-[hsl(var(--button-green))]/20">
            <div className="col-span-1 text-[hsl(var(--button-green))] font-bold text-sm uppercase tracking-wider">Rank</div>
            <div className="col-span-4 text-[hsl(var(--button-green))] font-bold text-sm uppercase tracking-wider">Player</div>
            <div className="col-span-2 text-[hsl(var(--button-green))] font-bold text-sm uppercase tracking-wider text-center">Puffs</div>
            <div className="col-span-3 text-[hsl(var(--button-green))] font-bold text-sm uppercase tracking-wider text-center">Points</div>
            <div className="col-span-2 text-[hsl(var(--button-green))] font-bold text-sm uppercase tracking-wider text-center">Status</div>
          </div>
          
          {/* Leaderboard Entries */}
          <div className="space-y-3 md:space-y-4">
            {loading ? (
              <div className="text-center text-white/60 py-8">
                Loading leaderboard...
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center text-white/60 py-8">
                No players yet. Be the first to start tracking!
              </div>
            ) : (
              leaderboard.map((player, index) => {
                const rank = index + 1;
                const isTopPlayer = rank <= 3;
                const points = Math.floor((player.total_rewards || 0) * 100); // Convert rewards to points
                
                return (
                  <div key={player.id}>
                    {/* Mobile Layout */}
                    <div className={`md:hidden p-4 rounded-xl transition-colors duration-300 ${
                      isTopPlayer 
                        ? 'bg-gradient-to-r from-[hsl(var(--button-green))]/10 to-transparent border border-[hsl(var(--button-green))]/20' 
                        : 'border border-[hsl(var(--card-border))]/50'
                    }`}>
                      {/* Top Row: Rank, Username, Status */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getRankDisplay(rank)}
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                              isTopPlayer 
                                ? 'from-[hsl(var(--button-green))]/30 to-[hsl(var(--button-green))]/10 border-2 border-[hsl(var(--button-green))]/30' 
                                : 'from-white/10 to-white/5 border border-white/20'
                            } flex items-center justify-center font-bold text-sm`}>
                              {player.username.charAt(0).toUpperCase()}
                            </div>
                            <span className={`font-semibold text-lg ${isTopPlayer ? 'text-white' : 'text-white/90'}`}>
                              {player.username}
                            </span>
                          </div>
                        </div>
                        {getStatusBadge(player.total_puffs || 0)}
                      </div>
                      
                      {/* Bottom Row: Stats */}
                      <div className="flex justify-between items-center">
                        <div className="text-center">
                          <div className={`font-bold text-lg ${isTopPlayer ? 'text-[hsl(var(--button-green))]' : 'text-white'}`}>
                            {(player.total_puffs || 0).toLocaleString()}
                          </div>
                          <div className="text-xs text-white/60 uppercase tracking-wider">Puffs</div>
                        </div>
                        <div className="text-center">
                          <div className={`font-bold text-lg ${isTopPlayer ? 'text-[hsl(var(--button-green))]' : 'text-white'}`}>
                            {points.toLocaleString()}
                          </div>
                          <div className="text-xs text-white/60 uppercase tracking-wider">Points</div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className={`hidden md:grid grid-cols-12 gap-4 py-4 px-4 rounded-xl transition-colors duration-300 group ${
                      isTopPlayer 
                        ? 'bg-gradient-to-r from-[hsl(var(--button-green))]/10 to-transparent border border-[hsl(var(--button-green))]/20' 
                        : 'hover:border-[hsl(var(--card-border))]'
                    }`}>
                      {/* Rank */}
                      <div className="col-span-1 flex items-center">
                        {getRankDisplay(rank)}
                      </div>
                      
                      {/* Username */}
                      <div className="col-span-4 flex items-center">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                            isTopPlayer 
                              ? 'from-[hsl(var(--button-green))]/30 to-[hsl(var(--button-green))]/10 border-2 border-[hsl(var(--button-green))]/30' 
                              : 'from-white/10 to-white/5 border border-white/20'
                          } flex items-center justify-center font-bold text-sm`}>
                            {player.username.charAt(0).toUpperCase()}
                          </div>
                          <span className={`font-semibold ${isTopPlayer ? 'text-white' : 'text-white/90'} group-hover:text-[hsl(var(--button-green))] transition-colors`}>
                            {player.username}
                          </span>
                        </div>
                      </div>
                      
                      {/* Puffs */}
                      <div className="col-span-2 flex items-center justify-center">
                        <div className="text-center">
                          <div className={`font-bold text-lg ${isTopPlayer ? 'text-[hsl(var(--button-green))]' : 'text-white'}`}>
                            {(player.total_puffs || 0).toLocaleString()}
                          </div>
                          <div className="text-xs text-white/60 uppercase tracking-wider">Puffs</div>
                        </div>
                      </div>
                      
                      {/* Points */}
                      <div className="col-span-3 flex items-center justify-center">
                        <div className="text-center">
                          <div className={`font-bold text-lg ${isTopPlayer ? 'text-[hsl(var(--button-green))]' : 'text-white'}`}>
                            {points.toLocaleString()}
                          </div>
                          <div className="text-xs text-white/60 uppercase tracking-wider">Points</div>
                        </div>
                      </div>
                      
                      {/* Status */}
                      <div className="col-span-2 flex items-center justify-center">
                        {getStatusBadge(player.total_puffs || 0)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-[hsl(var(--card-border))] text-center">
            <p className="text-white/60 text-sm">
              Rankings update every hour • Join the competition and earn your spot!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeaderboardSection;