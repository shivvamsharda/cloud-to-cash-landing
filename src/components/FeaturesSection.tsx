import { Zap, Gift, Shield, Users, Wallet, DollarSign } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Zap,
      title: "Real-Time Tracking",
      description: "Every puff is tracked instantly with precision technology, ensuring accurate reward calculations.",
      gradient: "from-[hsl(var(--button-green))]/20 to-blue-500/10"
    },
    {
      icon: Gift,
      title: "Instant Rewards",
      description: "Get rewarded immediately for your activity. No waiting periods, no delays - instant gratification.",
      gradient: "from-[hsl(var(--button-green))]/20 to-purple-500/10"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is protected with bank-level security. Your privacy is our priority.",
      gradient: "from-[hsl(var(--button-green))]/20 to-green-500/10"
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Join thousands of users in a vibrant community. Compete, share, and grow together.",
      gradient: "from-[hsl(var(--button-green))]/20 to-orange-500/10"
    },
    {
      icon: Wallet,
      title: "Easy Withdrawal",
      description: "Cash out your rewards effortlessly to your preferred wallet or payment method.",
      gradient: "from-[hsl(var(--button-green))]/20 to-cyan-500/10"
    },
    {
      icon: DollarSign,
      title: "No Hidden Fees",
      description: "Transparent pricing with no surprise charges. What you earn is what you keep.",
      gradient: "from-[hsl(var(--button-green))]/20 to-yellow-500/10"
    },
  ];

  return (
    <section className="bg-[hsl(var(--pure-black))] py-24 px-6 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--button-green))_1px,transparent_1px)] bg-[length:40px_40px]" />
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-40 left-10 w-2 h-2 bg-[hsl(var(--button-green))] rounded-full opacity-60 animate-pulse" />
      <div className="absolute top-60 right-20 w-1 h-1 bg-[hsl(var(--button-green))] rounded-full opacity-40 animate-pulse delay-1000" />
      <div className="absolute bottom-40 left-1/4 w-1.5 h-1.5 bg-[hsl(var(--button-green))] rounded-full opacity-50 animate-pulse delay-500" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Title */}
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            WHY CHOOSE
            <span className="block text-[hsl(var(--button-green))] mt-2">VAPEFI</span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Experience the future of vaping with cutting-edge technology and instant rewards
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group relative">
              {/* Card */}
              <div className="relative h-full bg-gradient-to-br from-[hsl(var(--card-bg))] to-[hsl(var(--pure-black))] border border-[hsl(var(--card-border))] rounded-2xl p-8 hover:border-[hsl(var(--button-green))]/50 transition-all duration-500 hover:shadow-[0_0_50px_hsl(var(--button-green)/0.2)] group-hover:transform group-hover:scale-[1.02]">
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Green Corner Accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[hsl(var(--button-green))]/10 to-transparent rounded-2xl" />
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="mb-6">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[hsl(var(--button-green))]/20 to-[hsl(var(--button-green))]/5 border border-[hsl(var(--button-green))]/20 flex items-center justify-center group-hover:shadow-[0_0_20px_hsl(var(--button-green)/0.4)] transition-all duration-500">
                      <feature.icon className="w-8 h-8 text-[hsl(var(--button-green))] group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-[hsl(var(--button-green))] transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-white/70 leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
                
                {/* Bottom Accent Line */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[hsl(var(--button-green))]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;