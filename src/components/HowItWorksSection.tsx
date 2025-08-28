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
          
          {steps.map((step, index) => (
            <div key={index} className="relative group flex flex-col items-center">
              {/* Step Number Badge */}
              <div className="absolute -top-4 z-20">
                <div className="w-12 h-12 bg-[hsl(var(--button-green))] text-[hsl(var(--pure-black))] rounded-full flex items-center justify-center font-bold text-lg shadow-lg border-2 border-[hsl(var(--pure-black))]">
                  {step.number}
                </div>
              </div>
              
              {/* Cloud Shape Container */}
              <div 
                className="relative w-[280px] h-[200px] bg-[hsl(var(--button-green))] hover:bg-[hsl(var(--button-green))]/90 transition-all duration-500 group-hover:scale-110 p-12 pt-16 pb-8 shadow-[0_0_40px_hsl(var(--button-green)/0.4)] hover:shadow-[0_0_60px_hsl(var(--button-green)/0.6)] flex flex-col items-center justify-center"
                style={{
                  borderRadius: '60px'
                }}
              >
                {/* Cloud Puffs - Left */}
                <div 
                  className="absolute bg-[hsl(var(--button-green))] group-hover:bg-[hsl(var(--button-green))]/90 transition-colors duration-500"
                  style={{
                    top: '-40px',
                    left: '20px',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50px',
                    transform: 'rotate(-45deg)'
                  }}
                />
                
                {/* Cloud Puffs - Right */}
                <div 
                  className="absolute bg-[hsl(var(--button-green))] group-hover:bg-[hsl(var(--button-green))]/90 transition-colors duration-500"
                  style={{
                    top: '-30px',
                    right: '30px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '40px',
                    transform: 'rotate(15deg)'
                  }}
                />
                
                {/* Additional Cloud Puffs for More Realistic Look */}
                <div 
                  className="absolute bg-[hsl(var(--button-green))] group-hover:bg-[hsl(var(--button-green))]/90 transition-colors duration-500"
                  style={{
                    top: '-25px',
                    left: '100px',
                    width: '50px',
                    height: '50px',
                    borderRadius: '30px',
                    transform: 'rotate(30deg)'
                  }}
                />
                
                <div 
                  className="absolute bg-[hsl(var(--button-green))] group-hover:bg-[hsl(var(--button-green))]/90 transition-colors duration-500"
                  style={{
                    top: '-15px',
                    right: '80px',
                    width: '40px',
                    height: '40px',
                    borderRadius: '25px',
                    transform: 'rotate(-20deg)'
                  }}
                />
                
                {/* Icon Container */}
                <div className="relative z-10 mb-6">
                  <div className="w-16 h-16 bg-[hsl(var(--pure-black))]/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-[hsl(var(--pure-black))]/30">
                    <img 
                      src={step.icon} 
                      alt={`${step.title} icon`}
                      className="w-10 h-10 object-contain filter brightness-0"
                    />
                  </div>
                </div>
                
                {/* Content */}
                <div className="text-center space-y-3 relative z-10">
                  <h3 className="text-xl font-bold text-[hsl(var(--pure-black))] tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-[hsl(var(--pure-black))]/80 text-sm leading-relaxed px-2">
                    {step.description}
                  </p>
                </div>
                
                {/* Inner Glow Effect */}
                <div className="absolute inset-0 rounded-[60px] bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;