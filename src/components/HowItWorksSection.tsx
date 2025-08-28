import vapeIcon from "@/assets/vape-icon.png";
import coinIcon from "@/assets/coin-icon.png";
import cashIcon from "@/assets/cash-icon.png";

const HowItWorksSection = () => {
  const steps = [
    {
      icon: vapeIcon,
      title: "Vape & Record",
      description: "Take puffs, tracked in real-time with precision technology.",
      number: "01"
    },
    {
      icon: coinIcon,
      title: "Earn Points",
      description: "Every puff converts into crypto rewards automatically.",
      number: "02"
    },
    {
      icon: cashIcon,
      title: "Cash Out",
      description: "Convert your clouds into tokens & prizes instantly.",
      number: "03"
    },
  ];

  return (
    <section className="bg-[hsl(var(--pure-black))] py-24 px-6 relative overflow-hidden">
      {/* Ambient Glow Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[hsl(var(--button-green))] rounded-full blur-[100px] opacity-20" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-[hsl(var(--button-green))] rounded-full blur-[100px] opacity-20" />
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Title */}
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            HOW IT WORKS
          </h2>
          <div className="w-24 h-1 bg-[hsl(var(--button-green))] mx-auto rounded-full" />
        </div>
        
        {/* Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
          {/* Floating Cloud Connector Elements */}
          <div className="hidden lg:block absolute top-1/2 left-1/4 right-1/4 h-2 opacity-20 pointer-events-none">
            <div className="w-full h-full flex items-center justify-between">
              <div className="w-8 h-8 bg-[hsl(var(--button-green))] rounded-full animate-pulse"></div>
              <div className="w-6 h-6 bg-[hsl(var(--button-green))] rounded-full animate-pulse delay-100"></div>
              <div className="w-4 h-4 bg-[hsl(var(--button-green))] rounded-full animate-pulse delay-200"></div>
              <div className="w-6 h-6 bg-[hsl(var(--button-green))] rounded-full animate-pulse delay-300"></div>
              <div className="w-8 h-8 bg-[hsl(var(--button-green))] rounded-full animate-pulse delay-500"></div>
            </div>
          </div>
          
          {steps.map((step, index) => {
            // Different cloud shapes for variety
            const getCloudStyle = (index: number) => {
              const cloudVariations = [
                // Cloud 1 - Fluffy with multiple bumps
                {
                  clipPath: "polygon(20% 80%, 5% 70%, 0% 50%, 10% 35%, 25% 25%, 45% 30%, 60% 15%, 80% 20%, 95% 35%, 100% 50%, 90% 70%, 85% 85%, 70% 90%, 50% 85%, 30% 90%)"
                },
                // Cloud 2 - Rounded with smooth curves
                {
                  clipPath: "polygon(15% 85%, 3% 65%, 8% 40%, 20% 25%, 40% 20%, 65% 25%, 85% 30%, 95% 45%, 92% 65%, 80% 80%, 60% 88%, 35% 85%)"
                },
                // Cloud 3 - Irregular with more character
                {
                  clipPath: "polygon(25% 85%, 8% 75%, 2% 55%, 12% 30%, 30% 18%, 50% 22%, 70% 12%, 88% 25%, 96% 45%, 85% 68%, 75% 82%, 45% 90%, 20% 88%)"
                }
              ];
              return cloudVariations[index % 3];
            };

            const cloudStyle = getCloudStyle(index);

            return (
              <div key={index} className="relative group flex flex-col items-center">
                {/* Step Number Badge */}
                <div className="absolute -top-6 z-30">
                  <div className="w-12 h-12 bg-[hsl(var(--button-green))] text-[hsl(var(--pure-black))] rounded-full flex items-center justify-center font-bold text-lg shadow-lg border-2 border-[hsl(var(--pure-black))]">
                    {step.number}
                  </div>
                </div>
                
                {/* Organic Cloud Shape Container */}
                <div className="relative">
                  {/* Main Cloud Body */}
                  <div 
                    className="w-[320px] h-[240px] bg-[hsl(var(--button-green))] hover:bg-[hsl(var(--button-green))]/90 transition-all duration-500 group-hover:scale-105 shadow-[0_0_40px_hsl(var(--button-green)/0.4)] hover:shadow-[0_0_60px_hsl(var(--button-green)/0.6)] relative"
                    style={cloudStyle}
                  >
                    {/* Content Container */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 pt-12">
                      {/* Icon Container */}
                      <div className="mb-6">
                        <div className="w-16 h-16 bg-[hsl(var(--pure-black))]/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-[hsl(var(--pure-black))]/30">
                          <img 
                            src={step.icon} 
                            alt={`${step.title} icon`}
                            className="w-10 h-10 object-contain filter brightness-0"
                          />
                        </div>
                      </div>
                      
                      {/* Text Content */}
                      <div className="text-center space-y-3">
                        <h3 className="text-xl font-bold text-[hsl(var(--pure-black))] tracking-tight">
                          {step.title}
                        </h3>
                        <p className="text-[hsl(var(--pure-black))]/80 text-sm leading-relaxed px-4">
                          {step.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Inner Glow Effect */}
                    <div 
                      className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={cloudStyle}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;