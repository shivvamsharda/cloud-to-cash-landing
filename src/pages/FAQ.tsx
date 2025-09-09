import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = () => {
  const faqData = [
    {
      question: "What is VapeFi?",
      answer: "VapeFi is a blockchain-based platform that tracks your vaping sessions using AI-powered detection and rewards you with tokens based on your verified activity. It gamifies the vaping experience while providing transparency through blockchain technology."
    },
    {
      question: "How does the puff tracking work?",
      answer: "VapeFi uses advanced AI and computer vision technology through your device's camera to detect and count your vaping puffs in real-time. Our MediaPipe integration ensures accurate tracking while maintaining your privacy."
    },
    {
      question: "How do I earn rewards?",
      answer: "You earn $PUFF tokens by completing verified vaping sessions. Each detected puff contributes to your score, and rewards are automatically calculated and distributed to your connected wallet based on your activity level."
    },
    {
      question: "What wallet do I need?",
      answer: "VapeFi supports Solana-based wallets including Phantom, Solflare, and other popular Solana wallet providers. Simply connect your wallet to start earning and receiving rewards."
    },
    {
      question: "Is my data secure and private?",
      answer: "Yes, your privacy is our priority. All tracking happens locally on your device, and we only store necessary session data. Your personal information is encrypted and protected according to our privacy policy."
    },
    {
      question: "Can I compete with other users?",
      answer: "Absolutely! VapeFi features real-time leaderboards where you can see how your vaping activity compares to other users. Compete for top positions and earn additional rewards for high performance."
    },
    {
      question: "How accurate is the tracking?",
      answer: "Our AI-powered tracking system is highly accurate, using state-of-the-art computer vision technology. However, tracking accuracy depends on lighting conditions, camera quality, and proper positioning during vaping sessions."
    },
    {
      question: "What devices are supported?",
      answer: "VapeFi works on any device with a camera and modern web browser, including smartphones, tablets, and computers. No app installation is required - it runs directly in your web browser."
    },
    {
      question: "How do I get started?",
      answer: "Getting started is easy: 1) Connect your Solana wallet, 2) Create your profile, 3) Allow camera access for tracking, 4) Start a vaping session and begin earning rewards immediately!"
    },
    {
      question: "What if the tracking doesn't work properly?",
      answer: "If you experience tracking issues, ensure good lighting conditions, position your device properly, and check that camera permissions are enabled. Contact our support team through our social channels for additional help."
    }
  ];

  return (
    <main className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground text-lg">
            Find answers to common questions about VapeFi and how to get the most out of the platform.
          </p>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <Accordion type="single" collapsible className="w-full">
            {faqData.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-border">
                <AccordionTrigger className="text-left text-lg font-semibold text-foreground hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-card rounded-lg border p-8">
            <h3 className="text-2xl font-bold text-primary mb-4">Still Have Questions?</h3>
            <p className="text-muted-foreground mb-6">
              Can't find what you're looking for? Reach out to our community on Telegram or X for support and updates.
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="https://t.me/vape_fi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Join Telegram
              </a>
              <a
                href="https://x.com/vape_fi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                Follow on X
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default FAQ;