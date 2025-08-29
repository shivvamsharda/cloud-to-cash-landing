import { Crown, Trophy, Medal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const LeaderboardSection = () => {
  const leaderboardData = [
    { rank: 1, username: "CloudMaster", puffs: 15234, points: 45702, status: "Premium", isTopPlayer: true },
    { rank: 2, username: "VapeKing", puffs: 12890, points: 38670, status: "Premium", isTopPlayer: true },
    { rank: 3, username: "PuffQueen", puffs: 11456, points: 34368, status: "Active", isTopPlayer: true },
    { rank: 4, username: "SmokeWave", puffs: 9876, points: 29628, status: "Active", isTopPlayer: false },
    { rank: 5, username: "CloudNinja", puffs: 8765, points: 26295, status: "Premium", isTopPlayer: false },
    { rank: 6, username: "VapeLord", puffs: 7654, points: 22962, status: "New Player", isTopPlayer: false },
    { rank: 7, username: "PuffMaster", puffs: 6543, points: 19629, status: "Active", isTopPlayer: false },
    { rank: 8, username: "CloudChaser", puffs: 5432, points: 16296, status: "Active", isTopPlayer: false },
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-[hsl(var(--button-green))]" />;
    if (rank === 2) return <Trophy className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-500" />;
    return null;
  };

  const getStatusBadge = (status: string) => {
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
    <section className="bg-[hsl(var(--pure-black))] py-12 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Glowing Orbs */}
      <div className="absolute top-20 left-10 w-32 h-32 sm:w-40 sm:h-40 bg-[hsl(var(--button-green))] rounded-full blur-[80px] opacity-20" />
      <div className="absolute bottom-20 right-10 w-32 h-32 sm:w-40 sm:h-40 bg-[hsl(var(--button-green))] rounded-full blur-[80px] opacity-20" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Title */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-4 sm:mb-6 tracking-tight">
            <span className="text-[hsl(var(--button-green))]">LEADERBOARD</span>
          </h2>
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto px-4">
            Compete with vapers worldwide and climb to the top
          </p>
        </div>
        
        {/* Mobile Card Layout */}
        <div className="lg:hidden space-y-4">
          {leaderboardData.map((player) => (
            <div 
              key={player.rank} 
              className={`bg-gradient-to-br from-[hsl(var(--card-bg))] to-[hsl(var(--pure-black))] border border-[hsl(var(--card-border))] rounded-2xl p-4 backdrop-blur-sm ${
                player.isTopPlayer 
                  ? 'border-[hsl(var(--button-green))]/30 shadow-[0_0_20px_hsl(var(--button-green)/0.1)]' 
                  : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getRankDisplay(player.rank)}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    player.isTopPlayer 
                      ? 'bg-gradient-to-br from-[hsl(var(--button-green))]/30 to-[hsl(var(--button-green))]/10 border-2 border-[hsl(var(--button-green))]/30 text-white' 
                      : 'bg-white/10 border border-white/20 text-white/90'
                  }`}>
                    {player.username.charAt(0)}
                  </div>
                  <div className={`font-semibold ${player.isTopPlayer ? 'text-white' : 'text-white/90'}`}>
                    {player.username}
                  </div>
                </div>
                {getStatusBadge(player.status)}
              </div>
              <div className="flex justify-between items-center">
                <div className="text-center">
                  <div className="text-xs text-white/60 uppercase tracking-wider mb-1">Puffs</div>
                  <div className={`font-bold text-lg ${player.isTopPlayer ? 'text-[hsl(var(--button-green))]' : 'text-white'}`}>
                    {player.puffs.toLocaleString()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-white/60 uppercase tracking-wider mb-1">Points</div>
                  <div className={`font-bold text-lg ${player.isTopPlayer ? 'text-[hsl(var(--button-green))]' : 'text-white'}`}>
                    {player.points.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden lg:block bg-gradient-to-br from-[hsl(var(--card-bg))] to-[hsl(var(--pure-black))] border border-[hsl(var(--card-border))] rounded-2xl p-8 backdrop-blur-sm">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 pb-6 mb-6 border-b border-[hsl(var(--button-green))]/20">
            <div className="col-span-1 text-[hsl(var(--button-green))] font-bold text-sm uppercase tracking-wider">Rank</div>
            <div className="col-span-4 text-[hsl(var(--button-green))] font-bold text-sm uppercase tracking-wider">Player</div>
            <div className="col-span-2 text-[hsl(var(--button-green))] font-bold text-sm uppercase tracking-wider text-center">Puffs</div>
            <div className="col-span-3 text-[hsl(var(--button-green))] font-bold text-sm uppercase tracking-wider text-center">Points</div>
            <div className="col-span-2 text-[hsl(var(--button-green))] font-bold text-sm uppercase tracking-wider text-center">Status</div>
          </div>
          
          {/* Leaderboard Entries */}
          <div className="space-y-4">
            {leaderboardData.map((player) => (
              <div 
                key={player.rank} 
                className={`grid grid-cols-12 gap-4 py-4 px-4 rounded-xl transition-all duration-300 hover:bg-[hsl(var(--button-green))]/5 group ${
                  player.isTopPlayer 
                    ? 'bg-gradient-to-r from-[hsl(var(--button-green))]/10 to-transparent border border-[hsl(var(--button-green))]/20 shadow-[0_0_20px_hsl(var(--button-green)/0.1)]' 
                    : 'hover:border-[hsl(var(--card-border))] hover:shadow-lg'
                }`}
              >
                {/* Rank */}
                <div className="col-span-1 flex items-center">
                  {getRankDisplay(player.rank)}
                </div>
                
                {/* Username */}
                <div className="col-span-4 flex items-center">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                      player.isTopPlayer 
                        ? 'from-[hsl(var(--button-green))]/30 to-[hsl(var(--button-green))]/10 border-2 border-[hsl(var(--button-green))]/30' 
                        : 'from-white/10 to-white/5 border border-white/20'
                    } flex items-center justify-center font-bold text-sm`}>
                      {player.username.charAt(0)}
                    </div>
                    <span className={`font-semibold ${player.isTopPlayer ? 'text-white' : 'text-white/90'} group-hover:text-[hsl(var(--button-green))] transition-colors`}>
                      {player.username}
                    </span>
                  </div>
                </div>
                
                {/* Puffs */}
                <div className="col-span-2 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`font-bold text-lg ${player.isTopPlayer ? 'text-[hsl(var(--button-green))]' : 'text-white'}`}>
                      {player.puffs.toLocaleString()}
                    </div>
                    <div className="text-xs text-white/60 uppercase tracking-wider">Puffs</div>
                  </div>
                </div>
                
                {/* Points */}
                <div className="col-span-3 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`font-bold text-lg ${player.isTopPlayer ? 'text-[hsl(var(--button-green))]' : 'text-white'}`}>
                      {player.points.toLocaleString()}
                    </div>
                    <div className="text-xs text-white/60 uppercase tracking-wider">Points</div>
                  </div>
                </div>
                
                {/* Status */}
                <div className="col-span-2 flex items-center justify-center">
                  {getStatusBadge(player.status)}
                </div>
              </div>
            ))}
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