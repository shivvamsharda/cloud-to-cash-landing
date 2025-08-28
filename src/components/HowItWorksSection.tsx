import vapeIcon from "@/assets/vape-icon.png";
import coinIcon from "@/assets/coin-icon.png";
import cashIcon from "@/assets/cash-icon.png";

const CLOUD_SRC = "https://paugtcnvqdbjcrrmjxma.supabase.co/storage/v1/object/public/website/cloud.png";

const CloudCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`relative w-[280px] h-[200px] md:w-[320px] md:h-[240px] ${className}`}>
    <img
      src={CLOUD_SRC}
      alt="Cloud backdrop"
      loading="lazy"
      decoding="async"
      className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.15)] pointer-events-none select-none"
    />
    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 pt-10 text-black">
      {children}
    </div>
  </div>
);

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
            return (
              <div key={index} className="relative group flex flex-col items-center">
                {/* Step Number Badge */}
                <div className="absolute -top-6 z-30">
                  <div className="w-12 h-12 bg-[hsl(var(--button-green))] text-[hsl(var(--pure-black))] rounded-full flex items-center justify-center font-bold text-lg shadow-lg border-2 border-[hsl(var(--pure-black))]">
                    {step.number}
                  </div>
                </div>
                
                {/* Cloud with black text overlay */}
                <CloudCard className="transition-transform duration-300 group-hover:scale-[1.02]">
                  <div className="mb-4">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center border border-black/10 bg-white/60 backdrop-blur-sm">
                      <img
                        src={step.icon}
                        alt={`${step.title} icon`}
                        loading="lazy"
                        className="w-8 h-8 object-contain filter brightness-0"
                      />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold tracking-tight text-black">{step.title}</h3>
                    <p className="text-black/80 text-sm leading-relaxed px-4">{step.description}</p>
                  </div>
                </CloudCard>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;