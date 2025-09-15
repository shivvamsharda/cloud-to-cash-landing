import { Crown, Gift, Star, Zap, Trophy, Coins, Battery, Gauge, Target, Shield, Layers, Sparkles, Gamepad2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Rewards = () => {
  const rigStats = [
    {
      name: "Drift",
      description: "The Farm Stat - Raw $VAPE output per puff. High Drift rigs are cash printers that prioritize steady income over everything else.",
      icon: Zap,
      color: "from-yellow-400 to-orange-500",
      strategy: "For grinders who want maximum ROI and consistent farming"
    },
    {
      name: "Juice", 
      description: "The Luck Stat - Governs RNG and Mystery Crate drops. High Juice rigs are slot machines disguised as vapes.",
      icon: Sparkles,
      color: "from-purple-400 to-pink-500", 
      strategy: "For degens who love gambling and chasing jackpots"
    },
    {
      name: "Flow",
      description: "The Endurance Stat - Determines how far your Energy stretches. More Flow = more rewarded puffs per day.",
      icon: Target,
      color: "from-blue-400 to-cyan-500",
      strategy: "For marathon grinders who want maximum session length"
    },
    {
      name: "Burn",
      description: "The Resilience Stat - Governs durability and repair costs. High Burn rigs are tanks that last longer.",
      icon: Shield,
      color: "from-red-400 to-orange-500",
      strategy: "For efficiency freaks who optimize cost per puff"
    }
  ];

  const puffUtilities = [
    {
      title: "Rig Repairs & Maintenance",
      description: "Keep your rigs in fighting condition. Durability matters in the cloud wars.",
      cost: "Variable $VAPE",
      icon: Shield
    },
    {
      title: "Level Upgrades (L10/L20/L30)", 
      description: "Hit milestone multipliers and unlock VAPE governance token at Level 30.",
      cost: "Scaling $VAPE",
      icon: Trophy
    },
    {
      title: "Rig Fusion (5→1)",
      description: "Fuse five rigs into one higher-tier monster. Chase those Rainbow Rigs.",
      cost: "Heavy $VAPE Sink", 
      icon: Layers
    },
    {
      title: "Mystery Crates",
      description: "RNG dopamine hits. Mods, cosmetics, $VAPE packs, and rare shards await.",
      cost: "Variable $VAPE",
      icon: Gift
    },
    {
      title: "Marketplace Fees",
      description: "2% platform fee + 4% royalty. Every trade burns tokens and tightens supply.",
      cost: "Automatic Burn",
      icon: Coins
    },
    {
      title: "Stat Point Allocation",
      description: "Customize your rig's build path. Every level grants 2 points to distribute.",
      cost: "Included in Levels",
      icon: Gauge
    }
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--pure-black))] pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 left-20 w-80 h-80 bg-[hsl(var(--button-green))] rounded-full mix-blend-screen filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-32 right-20 w-96 h-96 bg-[hsl(var(--effect-purple))] rounded-full mix-blend-screen filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            VapeFi <span className="text-[hsl(var(--button-green))]">Rewards</span> System
          </h1>
          <p className="text-white/70 text-xl max-w-4xl mx-auto mb-8">
            The world's first Vape-to-Earn (V2E) ecosystem. Every puff is proof. Every session is a flex. Every NFT is a weapon in the degen arsenal.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[hsl(var(--button-green))] rounded-full"></div>
              AI Puff Verification
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[hsl(var(--effect-purple))] rounded-full"></div>
              90-Day Seasons
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[hsl(var(--button-green))] rounded-full"></div>
              Culture Gaming
            </div>
          </div>
        </div>

        {/* Core Loop Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">The Core Loop</h2>
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-r from-[hsl(var(--effect-purple))]/10 to-[hsl(var(--button-green))]/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-12">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-[hsl(var(--button-green))] mb-4">
                  Puff → Earn → Upgrade → Repeat
                </h3>
                <p className="text-white/70 text-lg">
                  Simple on the surface, but hiding a world of strategy beneath. Welcome to the weaponization of culture.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[hsl(var(--button-green))]/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Zap className="w-8 h-8 text-[hsl(var(--button-green))]" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">1. Puff</h4>
                  <p className="text-white/60 text-sm">AI verification tracks every authentic exhale. No bots, no fakes, just real clouds on-chain.</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-[hsl(var(--effect-purple))]/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Coins className="w-8 h-8 text-[hsl(var(--effect-purple))]" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">2. Earn</h4>
                  <p className="text-white/60 text-sm">Every verified puff transforms into $VAPE tokens. Your rig stats determine the multiplier.</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-[hsl(var(--button-green))]/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Trophy className="w-8 h-8 text-[hsl(var(--button-green))]" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">3. Upgrade</h4>
                  <p className="text-white/60 text-sm">Reinvest $VAPE into repairs, levels, fusions. Build your rig into a monster.</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-[hsl(var(--effect-purple))]/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Target className="w-8 h-8 text-[hsl(var(--effect-purple))]" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">4. Repeat</h4>
                  <p className="text-white/60 text-sm">Wake up stronger. Each loop compounds your power and dominance.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Energy System */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Energy System - The Battery of the Grind</h2>
          
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="text-center mb-8">
                <Battery className="w-16 h-16 text-[hsl(var(--button-green))] mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-4">Energy is your lifeline</h3>
                <p className="text-white/70 text-lg">
                  Every puff costs Energy. When you run out, rewards stop cold. No soft drop-off, no pity points. All or nothing.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-3xl font-bold text-[hsl(var(--button-green))] mb-2">2</div>
                  <div className="text-white font-semibold mb-2">Base Energy</div>
                  <div className="text-white/70 text-sm">~10 minutes of rewarded puffing for everyone</div>
                </div>
                
                <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-3xl font-bold text-[hsl(var(--effect-purple))] mb-2">+2</div>
                  <div className="text-white font-semibold mb-2">Per Side Rig</div>
                  <div className="text-white/70 text-sm">Each additional NFT extends your grind (~10 min each)</div>
                </div>
                
                <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-3xl font-bold text-[hsl(var(--button-green))] mb-2">10</div>
                  <div className="text-white font-semibold mb-2">Energy Cap</div>
                  <div className="text-white/70 text-sm">Maximum ~50 minutes/day with 4 side rigs</div>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-[hsl(var(--button-green))]/10 rounded-xl border border-[hsl(var(--button-green))]/20">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="w-6 h-6 text-[hsl(var(--button-green))]" />
                  <span className="text-[hsl(var(--button-green))] font-bold">Flow Stat Bonus</span>
                </div>
                <p className="text-white/70 text-sm">
                  High Flow rigs bend the rules by slowing Energy depletion. Every point matters in the 90-day sprint.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rig Stats System */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Rig Stats - Choose Your Weapon</h2>
          <p className="text-white/70 text-center mb-12 max-w-3xl mx-auto">
            Every rig has four core stats that define your playstyle. No rig is perfect - every grinder must choose their lane in the cloud wars.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {rigStats.map((stat, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-[hsl(var(--button-green))]/30 transition-all duration-300">
                <div className="flex items-start gap-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">{stat.name}</h3>
                    <p className="text-white/70 text-sm mb-4">{stat.description}</p>
                    
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <p className="text-[hsl(var(--button-green))] text-sm font-medium">Strategy:</p>
                      <p className="text-white/70 text-sm">{stat.strategy}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-[hsl(var(--effect-purple))]/10 to-[hsl(var(--button-green))]/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 max-w-4xl mx-auto">
              <Gamepad2 className="w-8 h-8 text-[hsl(var(--button-green))] mx-auto mb-4" />
              <h4 className="text-xl font-bold text-white mb-2">Level Up & Customize</h4>
              <p className="text-white/70 text-sm">
                Every level grants 2 stat points. Build your rig into a Drift farm machine, Juice slot machine, Flow marathon runner, or Burn efficiency tank.
                Hit milestones at L10, L20, L30 for major multiplier boosts and VAPE token access.
              </p>
            </div>
          </div>
        </div>

        {/* $VAPE Tokenomics */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">$VAPE - The Reward Cloud</h2>
          
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-gradient-to-r from-[hsl(var(--effect-purple))]/10 to-[hsl(var(--button-green))]/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="text-center mb-8">
                <Coins className="w-16 h-16 text-[hsl(var(--button-green))] mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-4">The Lifeblood of VapeFi</h3>
                <p className="text-white/70 text-lg mb-6">
                  $VAPE isn't meant to sit idle. It's designed to flow, burn, and circulate at the speed of vapor.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl font-bold text-[hsl(var(--button-green))] mb-2">1B</div>
                  <div className="text-white/70 text-sm">Total Supply</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl font-bold text-[hsl(var(--effect-purple))] mb-2">200M</div>
                  <div className="text-white/70 text-sm">Season 1 Emissions</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl font-bold text-[hsl(var(--button-green))] mb-2">90</div>
                  <div className="text-white/70 text-sm">Day Sprint</div>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-white/70 text-sm">
                  ~2.2M $VAPE distributed daily across the grinder ecosystem
                </p>
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-white text-center mb-8">Token Utility Sinks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {puffUtilities.map((use, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-[hsl(var(--button-green))]/30 transition-all duration-300">
                <div className="w-12 h-12 bg-[hsl(var(--button-green))]/20 rounded-lg flex items-center justify-center mb-4">
                  <use.icon className="w-6 h-6 text-[hsl(var(--button-green))]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{use.title}</h3>
                <p className="text-white/70 text-sm mb-4">{use.description}</p>
                <div className="text-[hsl(var(--button-green))] font-semibold text-sm">{use.cost}</div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 max-w-3xl mx-auto">
              <h4 className="text-xl font-bold text-[hsl(var(--button-green))] mb-2">The Choice</h4>
              <p className="text-white/70">
                Every $VAPE earned forces a decision: <span className="text-white font-semibold">cash out or reinvest?</span> Short-term profit or long-term dominance? 
                That tension is the beating heart of the VapeFi economy.
              </p>
            </div>
          </div>
        </div>

        {/* VAPE Governance Token */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">VAPE - The Elite Token</h2>
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-[hsl(var(--effect-purple))]/20 to-[hsl(var(--button-green))]/20 backdrop-blur-sm rounded-2xl p-8 border border-[hsl(var(--button-green))]/30">
              <div className="text-center mb-6">
                <Crown className="w-16 h-16 text-[hsl(var(--button-green))] mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-4">The Prestige Era</h3>
                <p className="text-white/70 text-lg">
                  Only the strongest grinders who push their main rigs to <span className="text-[hsl(var(--button-green))] font-bold">Level 30</span> unlock VAPE - 
                  the governance token of influence, prestige, and permanence.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <Users className="w-8 h-8 text-[hsl(var(--button-green))] mb-3" />
                  <h4 className="text-lg font-bold text-white mb-2">DAO Governance</h4>
                  <p className="text-white/70 text-sm">Shape future seasons, vote on emissions, and decide how the ecosystem evolves.</p>
                </div>
                
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <Star className="w-8 h-8 text-[hsl(var(--effect-purple))] mb-3" />
                  <h4 className="text-lg font-bold text-white mb-2">Elite Status</h4>
                  <p className="text-white/70 text-sm">Join the ranks of VapeFi legends who've proven their dedication and grinding prowess.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[hsl(var(--effect-purple))]/20 to-[hsl(var(--button-green))]/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Join the Cloud Wars</h2>
          <p className="text-white/70 text-lg mb-6">
            Every puff is proof. Every session is a flex. Every NFT is a weapon. 
            <span className="block mt-2 text-[hsl(var(--button-green))] font-semibold">Ready to weaponize your culture?</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/track">
              <Button className="bg-[hsl(var(--button-green))] text-black px-8 py-3 rounded-xl font-semibold hover:bg-[hsl(var(--button-green))]/90 transition-colors duration-300">
                Start Puffing & Earning
              </Button>
            </Link>
            <Link to="/mint">
              <Button variant="outline" className="px-8 py-3 rounded-xl font-semibold border-[hsl(var(--button-green))] text-[hsl(var(--button-green))] hover:bg-[hsl(var(--button-green))]/10">
                Get Your Rig
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rewards;