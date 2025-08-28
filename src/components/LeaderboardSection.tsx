import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Crown, Medal } from "lucide-react";

const LeaderboardSection = () => {
  const leaderboardData = [
    { rank: 1, username: "VapeKing420", puffs: 50247, points: 125618, status: "Premium", isTop: true },
    { rank: 2, username: "CloudMaster", puffs: 48390, points: 120975, status: "Premium", isTop: true },
    { rank: 3, username: "MistWizard", puffs: 45821, points: 114553, status: "Active", isTop: true },
    { rank: 4, username: "VaporChamp", puffs: 42156, points: 105390, status: "Active", isTop: false },
    { rank: 5, username: "PuffLegend", puffs: 39847, points: 99618, status: "Premium", isTop: false },
    { rank: 6, username: "CloudChaser", puffs: 37294, points: 93235, status: "Active", isTop: false },
    { rank: 7, username: "MistMaster", puffs: 35678, points: 89195, status: "Active", isTop: false },
    { rank: 8, username: "VapeNinja", puffs: 33521, points: 83803, status: "Premium", isTop: false },
    { rank: 9, username: "SmokeSignal", puffs: 31847, points: 79618, status: "Active", isTop: false },
    { rank: 10, username: "CloudSurfer", puffs: 29653, points: 74133, status: "New Player", isTop: false },
    { rank: 11, username: "VaporTrail", puffs: 27891, points: 69728, status: "Active", isTop: false },
    { rank: 12, username: "MistRunner", puffs: 25437, points: 63593, status: "Active", isTop: false },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Trophy className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Premium":
        return <Badge variant="default" className="bg-primary text-primary-foreground">{status}</Badge>;
      case "Active":
        return <Badge variant="secondary">{status}</Badge>;
      case "New Player":
        return <Badge variant="outline">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <section className="bg-[hsl(var(--pure-black))] py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-16 tracking-tight">
          LEADERBOARD
        </h2>
        
        {/* Leaderboard Table */}
        <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-20 text-center font-bold">Rank</TableHead>
                  <TableHead className="font-bold">Player</TableHead>
                  <TableHead className="text-center font-bold">Total Puffs</TableHead>
                  <TableHead className="text-center font-bold">Points</TableHead>
                  <TableHead className="text-center font-bold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData.map((player) => (
                  <TableRow 
                    key={player.rank}
                    className={`${player.isTop ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/30'} transition-colors`}
                  >
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {getRankIcon(player.rank)}
                        <span className={`font-bold ${player.isTop ? 'text-primary' : 'text-muted-foreground'}`}>
                          #{player.rank}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-semibold ${player.isTop ? 'text-section-text' : 'text-foreground'}`}>
                        {player.username}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {player.puffs.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center font-medium text-primary">
                      {player.points.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(player.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </ScrollArea>
        
        {/* Footer Note */}
        <p className="text-center text-white/70 text-sm mt-6">
          Rankings update every 24 hours. Keep puffing to climb the leaderboard!
        </p>
      </div>
    </section>
  );
};

export default LeaderboardSection;