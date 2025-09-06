import { Crown, Gift, Star, Zap, Trophy, Coins } from "lucide-react";
import { WalletConnectButton } from "@/components/auth/WalletConnectButton";

const Rewards = () => {
  const rewardTiers = [
    {
      title: "Bronze Vaper",
      requirement: "100+ Puffs",
      rewards: ["5% Token Bonus", "Basic Profile Badge", "Community Access"],
      color: "from-amber-600 to-amber-800",
      icon: Star,
      tokens: "50"
    },
    {
      title: "Silver Cloud",
      requirement: "500+ Puffs", 
      rewards: ["10% Token Bonus", "Silver Profile Badge", "Priority Support", "Exclusive Rewards"],
      color: "from-gray-400 to-gray-600",
      icon: Gift,
      tokens: "150"
    },
    {
      title: "Gold Enthusiast",
      requirement: "1,500+ Puffs",
      rewards: ["20% Token Bonus", "Gold Profile Badge", "VIP Access", "Custom Themes", "Monthly Airdrops"],
      color: "from-yellow-400 to-yellow-600", 
      icon: Trophy,
      tokens: "500"
    },
    {
      title: "Platinum Legend",
      requirement: "5,000+ Puffs",
      rewards: ["35% Token Bonus", "Platinum Badge", "Beta Features", "Direct Developer Access", "Exclusive NFTs"],
      color: "from-blue-400 to-blue-600",
      icon: Crown,
      tokens: "2000"
    }
  ];

  const tokenUses = [
    {
      title: "Premium Features",
      description: "Unlock advanced tracking, detailed analytics, and custom themes.",
      cost: "100 Tokens",
      icon: Zap
    },
    {
      title: "Exclusive Merchandise", 
      description: "Redeem tokens for VapeFi branded merchandise and accessories.",
      cost: "250 Tokens",
      icon: Gift
    },
    {
      title: "Hardware Discounts",
      description: "Get discounts on partner vaping hardware and accessories.",
      cost: "500 Tokens", 
      icon: Star
    },
    {
      title: "Cash Rewards",
      description: "Convert your tokens to real cash rewards and crypto payments.",
      cost: "1000 Tokens",
      icon: Coins
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
            Rewards & <span className="text-[hsl(var(--button-green))]">Benefits</span>
          </h1>
          <p className="text-white/70 text-xl max-w-3xl mx-auto">
            Earn VapeFi tokens with every puff and unlock exclusive rewards, premium features, and real-world benefits.
          </p>
        </div>

        {/* Reward Tiers */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Tier System</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rewardTiers.map((tier, index) => (
              <div key={index} className="group relative">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-[hsl(var(--button-green))]/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[hsl(var(--button-green))]/20">
                  {/* Tier Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--button-green))]/20 to-[hsl(var(--effect-purple))]/20 rounded-xl flex items-center justify-center mb-4">
                    <tier.icon className="w-8 h-8 text-[hsl(var(--button-green))]" />
                  </div>

                  {/* Tier Info */}
                  <h3 className="text-xl font-bold text-white mb-2">{tier.title}</h3>
                  <p className="text-[hsl(var(--button-green))] font-semibold mb-4">{tier.requirement}</p>
                  
                  {/* Token Earning */}
                  <div className="bg-[hsl(var(--button-green))]/10 rounded-lg p-3 mb-4">
                    <p className="text-[hsl(var(--button-green))] font-bold">+{tier.tokens} Tokens/Session</p>
                  </div>

                  {/* Rewards List */}
                  <ul className="space-y-2">
                    {tier.rewards.map((reward, idx) => (
                      <li key={idx} className="text-white/70 text-sm flex items-center">
                        <div className="w-1.5 h-1.5 bg-[hsl(var(--button-green))] rounded-full mr-2"></div>
                        {reward}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Token Uses */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">What You Can Do With Tokens</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tokenUses.map((use, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-[hsl(var(--button-green))]/30 transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-[hsl(var(--button-green))]/20 rounded-lg flex items-center justify-center mb-4">
                  <use.icon className="w-6 h-6 text-[hsl(var(--button-green))]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{use.title}</h3>
                <p className="text-white/70 text-sm mb-4">{use.description}</p>
                <div className="text-[hsl(var(--button-green))] font-semibold">{use.cost}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[hsl(var(--effect-purple))]/20 to-[hsl(var(--button-green))]/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Start Earning Today</h2>
          <p className="text-white/70 text-lg mb-6">
            Join the VapeFi community and turn every puff into valuable rewards.
          </p>
          <WalletConnectButton className="bg-[hsl(var(--button-green))] text-black px-8 py-3 rounded-xl font-semibold hover:bg-[hsl(var(--button-green))]/90 transition-colors duration-300 inline-block">
            Start Tracking Puffs
          </WalletConnectButton>
        </div>
      </div>
    </div>
  );
};

export default Rewards;