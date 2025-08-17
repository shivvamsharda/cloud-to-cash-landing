import { Button } from "@/components/ui/button";

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
          <Button variant="hero-outline" size="lg" className="px-8 py-3 text-lg font-semibold min-w-[180px] bg-white text-brand-purple border-white hover:bg-white/90">
            Start Earning Now
          </Button>
          <Button variant="hero-outline" size="lg" className="px-8 py-3 text-lg font-semibold min-w-[180px] border-white text-white bg-transparent hover:bg-white/10">
            View Rewards
          </Button>
        </div>
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-white/80 text-lg">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CTASection;