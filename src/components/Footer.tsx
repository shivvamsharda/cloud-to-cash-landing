import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Mail, MapPin } from "lucide-react";

const Footer = () => {
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Rewards", href: "/rewards" },
    { name: "Contact", href: "/contact" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "FAQ", href: "/faq" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
  ];

  return (
    <footer className="bg-[hsl(var(--pure-black))] py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-4">
              <img 
                src="https://paugtcnvqdbjcrrmjxma.supabase.co/storage/v1/object/public/website/VapeFi_Trans.png" 
                alt="VapeFi Logo" 
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain mr-3"
              />
              <span className="text-xl sm:text-2xl font-bold text-white">VapeFi</span>
            </div>
            <p className="text-white/70 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
              Turn your clouds into coins. The revolutionary platform that rewards vapers for their activity.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-[hsl(var(--button-green))]/10 rounded-full flex items-center justify-center text-[hsl(var(--button-green))] hover:bg-[hsl(var(--button-green))] hover:text-white transition-colors"
                >
                  <social.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-2 sm:space-y-3">
              {navLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-[hsl(var(--button-green))] transition-colors text-sm sm:text-base"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Legal</h3>
            <ul className="space-y-2 sm:space-y-3">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-[hsl(var(--button-green))] transition-colors text-sm sm:text-base"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Get In Touch</h3>
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              <div className="flex items-start space-x-3">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(var(--button-green))] mt-0.5 flex-shrink-0" />
                <span className="text-white/70 text-sm sm:text-base">support@vapefi.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(var(--button-green))] mt-0.5 flex-shrink-0" />
                <span className="text-white/70 text-sm sm:text-base">Global Community Platform</span>
              </div>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-white/70 mb-2 sm:mb-3">Stay updated with our newsletter</p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-md sm:rounded-l-md sm:rounded-r-none text-xs sm:text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--button-green))] focus:border-transparent"
                />
                <button className="px-4 py-2 bg-[hsl(var(--button-green))] text-black rounded-md sm:rounded-l-none sm:rounded-r-md hover:bg-[hsl(var(--button-green))]/90 transition-colors text-xs sm:text-sm font-medium">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <p className="text-white/70 text-xs sm:text-sm text-center sm:text-left">
              © 2024 VapeFi. All rights reserved.
            </p>
            <div className="flex space-x-4 sm:space-x-6 text-xs sm:text-sm">
              <Link to="/privacy" className="text-white/70 hover:text-[hsl(var(--button-green))] transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="text-white/70 hover:text-[hsl(var(--button-green))] transition-colors">
                Terms
              </Link>
              <Link to="/cookies" className="text-white/70 hover:text-[hsl(var(--button-green))] transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;