const HeroSection = () => {
  return (
    <section 
      className="min-h-screen pt-16 relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(https://paugtcnvqdbjcrrmjxma.supabase.co/storage/v1/object/public/website/VapeFi_Hero2.png)'
      }}
    >
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
    </section>
  );
};
export default HeroSection;