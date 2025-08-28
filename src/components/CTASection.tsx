import { Button } from "@/components/ui/button";
import SolanaWalletAuth from "@/components/SolanaWalletAuth";

const CTASection = () => {
  const stats = [
    { label: "Active Users", value: "10K+" },
    { label: "Puffs Recorded", value: "50M+" },
    { label: "Rewards Paid", value: "$100K+" },
  ];

  return (
    <section className="bg-brand-purple py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Headline */}
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
          Ready to Turn Your Clouds Into Coins?
        </h2>
        
        {/* Subtext */}
        <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
          Join thousands of vapers already earning rewards. Start tracking your puffs and watch your earnings grow.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <SolanaWalletAuth className="px-8 py-3 text-lg font-semibold min-w-[180px] bg-white text-brand-purple border-white hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]">
            Start Earning Now
          </SolanaWalletAuth>
          <Button variant="hero-outline" size="lg" className="px-8 py-3 text-lg font-semibold min-w-[180px] border-[hsl(var(--button-green))] text-[hsl(var(--button-green))] bg-transparent hover:bg-[hsl(var(--button-green))]/10 hover:shadow-[0_0_30px_hsl(var(--button-green)/0.4)] transition-all duration-300">
            View Rewards
          </Button>
        </div>
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:border-[hsl(var(--button-green))]/50 hover:bg-white/15 transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--button-green)/0.2)]">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2 group-hover:text-[hsl(var(--button-green))] transition-colors duration-300">
                  {stat.value}
                </div>
                <div className="text-white/80 text-lg group-hover:text-white transition-colors duration-300">
                  {stat.label}
                </div>
                <div className="mt-4 h-0.5 bg-gradient-to-r from-transparent via-[hsl(var(--button-green))]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CTASection;