import vapeIcon from "@/assets/vape-icon.png";
import coinIcon from "@/assets/coin-icon.png";
import cashIcon from "@/assets/cash-icon.png";

const HowItWorksSection = () => {
  const steps = [
    {
      icon: vapeIcon,
      title: "Vape & Record",
      description: "Take puffs, tracked in real-time.",
    },
    {
      icon: coinIcon,
      title: "Earn Points",
      description: "Every puff counts as crypto rewards.",
    },
    {
      icon: cashIcon,
      title: "Cash Out",
      description: "Convert your clouds into tokens & prizes.",
    },
  ];

  return (
    <section className="bg-background py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <h2 className="text-4xl md:text-5xl font-bold text-center text-section-text mb-16 tracking-tight">
          HOW IT WORKS
        </h2>
        
        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <img 
                  src={step.icon} 
                  alt={`${step.title} icon`}
                  className="w-20 h-20 md:w-24 md:h-24 object-contain"
                />
              </div>
              
              {/* Title */}
              <h3 className="text-xl md:text-2xl font-bold text-section-text mb-4">
                {step.title}
              </h3>
              
              {/* Description */}
              <p className="text-muted-text text-lg leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;