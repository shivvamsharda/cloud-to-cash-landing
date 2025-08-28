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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          {/* Connector Lines */}
          <div className="hidden lg:block absolute top-1/2 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-[hsl(var(--button-green))] via-[hsl(var(--button-green))] to-[hsl(var(--button-green))] opacity-30" />
          
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Step Card */}
              <div className="relative bg-[hsl(var(--card-bg))] border border-[hsl(var(--card-border))] rounded-2xl p-8 hover:border-[hsl(var(--button-green))] transition-all duration-500 hover:shadow-[0_0_40px_hsl(var(--button-green)/0.3)] group-hover:transform group-hover:scale-105">
                {/* Green Accent Line */}
                <div className="absolute top-0 left-8 right-8 h-0.5 bg-[hsl(var(--button-green))] opacity-60" />
                
                {/* Step Number Badge */}
                <div className="absolute -top-6 left-8">
                  <div className="w-12 h-12 bg-[hsl(var(--button-green))] text-[hsl(var(--pure-black))] rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    {step.number}
                  </div>
                </div>
                
                {/* Icon Container */}
                <div className="flex justify-center mb-8 mt-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[hsl(var(--button-green))]/20 to-transparent border border-[hsl(var(--button-green))]/30 flex items-center justify-center backdrop-blur-sm">
                      <img 
                        src={step.icon} 
                        alt={`${step.title} icon`}
                        className="w-12 h-12 object-contain filter brightness-0 invert"
                      />
                    </div>
                    {/* Icon Glow */}
                    <div className="absolute inset-0 w-24 h-24 rounded-2xl bg-[hsl(var(--button-green))]/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-white/80 text-lg leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;