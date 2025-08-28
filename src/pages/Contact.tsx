import { Mail, MessageCircle, Twitter, Github, Users, Clock } from "lucide-react";

const Contact = () => {
  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us your questions and we'll respond within 24 hours.",
      contact: "support@vapefi.io",
      action: "mailto:support@vapefi.io"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team for immediate assistance.",
      contact: "Available 24/7",
      action: "#"
    },
    {
      icon: Twitter,
      title: "Twitter",
      description: "Follow us for updates, news, and community engagement.",
      contact: "@VapeFi_Official", 
      action: "#"
    },
    {
      icon: Github,
      title: "GitHub",
      description: "Contribute to our open-source projects and view our code.",
      contact: "github.com/vapefi",
      action: "#"
    }
  ];

  const teamInfo = [
    {
      icon: Users,
      title: "Community Team",
      description: "Questions about rewards, community events, and general support.",
      hours: "Mon-Fri, 9AM-6PM EST"
    },
    {
      icon: Clock,
      title: "Technical Support", 
      description: "Technical issues, bug reports, and integration support.",
      hours: "24/7 Response"
    }
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--pure-black))] pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 right-20 w-80 h-80 bg-[hsl(var(--button-green))] rounded-full mix-blend-screen filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-32 left-20 w-96 h-96 bg-[hsl(var(--effect-purple))] rounded-full mix-blend-screen filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Get in <span className="text-[hsl(var(--button-green))]">Touch</span>
          </h1>
          <p className="text-white/70 text-xl max-w-2xl mx-auto">
            Have questions, feedback, or need support? Our team is here to help you make the most of VapeFi.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactMethods.map((method, index) => (
            <a 
              key={index}
              href={method.action}
              className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-[hsl(var(--button-green))]/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[hsl(var(--button-green))]/20 block"
            >
              <div className="w-16 h-16 bg-[hsl(var(--button-green))]/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[hsl(var(--button-green))]/30 transition-colors duration-300">
                <method.icon className="w-8 h-8 text-[hsl(var(--button-green))]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{method.title}</h3>
              <p className="text-white/70 text-sm mb-4">{method.description}</p>
              <p className="text-[hsl(var(--button-green))] font-semibold">{method.contact}</p>
            </a>
          ))}
        </div>

        {/* Team Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {teamInfo.map((team, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[hsl(var(--button-green))]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <team.icon className="w-6 h-6 text-[hsl(var(--button-green))]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{team.title}</h3>
                  <p className="text-white/70 mb-3">{team.description}</p>
                  <p className="text-[hsl(var(--button-green))] font-semibold text-sm">{team.hours}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="bg-gradient-to-r from-[hsl(var(--effect-purple))]/20 to-[hsl(var(--button-green))]/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-6">Send us a Message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-semibold mb-2">Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:border-[hsl(var(--button-green))] focus:outline-none transition-colors duration-300"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Email</label>
                  <input 
                    type="email" 
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:border-[hsl(var(--button-green))] focus:outline-none transition-colors duration-300"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Subject</label>
                <input 
                  type="text" 
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:border-[hsl(var(--button-green))] focus:outline-none transition-colors duration-300"
                  placeholder="What can we help you with?"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Message</label>
                <textarea 
                  rows={5}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:border-[hsl(var(--button-green))] focus:outline-none transition-colors duration-300 resize-none"
                  placeholder="Tell us more about your question or feedback..."
                ></textarea>
              </div>
              <div className="text-center">
                <button 
                  type="submit"
                  className="bg-[hsl(var(--button-green))] text-black px-8 py-3 rounded-xl font-semibold hover:bg-[hsl(var(--button-green))]/90 transition-colors duration-300"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;