import { Camera, Gift, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HowItWorksSection = () => {
  const steps = [
    {
      icon: Camera,
      title: "Connect & Track",
      description: "Link your wallet and start tracking your puff sessions with our AI-powered detection system.",
      number: "01"
    },
    {
      icon: Trophy,
      title: "Earn Rewards",
      description: "Get $PUFF tokens for every verified puff. The more you vape, the more you earn.",
      number: "02"  
    },
    {
      icon: Gift,
      title: "Redeem Benefits",
      description: "Use your earned $PUFF for exclusive rewards, discounts, and premium features.",
      number: "03"
    }
  ];

  return (
    <section id="how-it-works" className="bg-[hsl(var(--pure-black))] py-24 px-6 relative overflow-hidden">

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-6">
            How VapeFi <span className="text-[hsl(var(--button-green))]">Works</span>
          </h2>
          <p className="text-white/70 text-xl max-w-2xl mx-auto">
            Transform your vaping sessions into earning opportunities with our revolutionary AI-powered tracking system.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="group relative h-full flex flex-col">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-[hsl(var(--button-green))] to-transparent opacity-30 z-0"></div>
              )}
              
              {/* Step Card */}
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-[hsl(var(--button-green))]/30 transition-all duration-300 h-full flex flex-col">
                {/* Number Badge */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-[hsl(var(--button-green))] text-black font-bold text-lg rounded-full flex items-center justify-center shadow-lg shadow-[hsl(var(--button-green))]/50">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 bg-[hsl(var(--button-green))]/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[hsl(var(--button-green))]/30 transition-colors duration-300">
                  <step.icon className="w-8 h-8 text-[hsl(var(--button-green))]" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                <p className="text-white/70 leading-relaxed flex-grow">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Read Docs Button */}
        <div className="text-center">
          <a 
            href="https://vapefi.gitbook.io/vapefi-docs/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="hero-primary" className="rounded-none px-8 py-3 text-lg font-semibold">
              Read Docs
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};
export default HowItWorksSection;