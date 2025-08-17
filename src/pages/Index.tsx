import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import FeaturesSection from "@/components/FeaturesSection";
import LeaderboardSection from "@/components/LeaderboardSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <LeaderboardSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
};

export default Index;
