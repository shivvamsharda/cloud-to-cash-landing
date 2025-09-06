const HeroSection = () => {
  return (
    <section 
      className="min-h-[calc(100vh-4rem)] mt-16 relative overflow-hidden bg-[hsl(var(--pure-black))]"
    >
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Desktop Hero Image */}
      <img
        src="/images/hero-desktop.png"
        alt="VapeFi Hero"
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="hidden md:block absolute inset-0 w-full h-full object-cover z-10 opacity-0 animate-fade-in"
        style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
      />
      
      {/* Mobile Hero Image */}
      <img
        src="/images/hero-mobile.png"
        alt="VapeFi Hero Mobile"
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="block md:hidden absolute inset-0 w-full h-full object-cover z-10 opacity-0 animate-fade-in"
        style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
      />
    </section>
  );
};
export default HeroSection;