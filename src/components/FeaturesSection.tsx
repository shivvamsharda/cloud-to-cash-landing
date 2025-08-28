import { Zap, Gift, Shield, Users, Wallet, DollarSign } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Zap,
      title: "Real-Time Tracking",
      description: "Every puff is tracked instantly with precision technology, ensuring accurate reward calculations.",
    },
    {
      icon: Gift,
      title: "Instant Rewards",
      description: "Get rewarded immediately for your activity. No waiting periods, no delays - instant gratification.",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is protected with bank-level security. Your privacy is our priority.",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Join thousands of users in a vibrant community. Compete, share, and grow together.",
    },
    {
      icon: Wallet,
      title: "Easy Withdrawal",
      description: "Cash out your rewards effortlessly to your preferred wallet or payment method.",
    },
    {
      icon: DollarSign,
      title: "No Hidden Fees",
      description: "Transparent pricing with no surprise charges. What you earn is what you keep.",
    },
  ];

  return (
    <section className="bg-[hsl(var(--pure-black))] py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-16 tracking-tight">
          WHY CHOOSE VAPEFI
        </h2>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/10 flex items-center justify-center">
                  <feature.icon className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </div>
              </div>
              
              {/* Title */}
              <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
                {feature.title}
              </h3>
              
              {/* Description */}
              <p className="text-white/80 text-lg leading-relaxed max-w-xs mx-auto">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;