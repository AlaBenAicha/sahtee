import { useState } from "react";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";

// Import du nouveau logo SAHTEE
import sahteeLogoMain from "../assets/sahtee-logo-full.png";

interface NavigationProps {
  onNavigate?: (view: string) => void;
}

export function Navigation({ onNavigate }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { label: "À propos", href: "#about" },
    { label: "Pourquoi SAHTEE", href: "#home" },
    { label: "Fonctionnalités clés", href: "#features" },
    { label: "Principes", href: "#principles" },
    { label: "Secteurs", href: "#sectors" },
    { label: "Contact", href: "#contact" }
  ];

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src={sahteeLogoMain}
              alt="SAHTEE"
              className="h-10"
            />
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="text-gray-700 hover:text-[var(--sahtee-blue-primary)] transition-colors duration-200"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button
              variant="outline"
              className="border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-primary)] hover:text-white"
              onClick={() => onNavigate?.('login')}
            >
              Connexion
            </Button>
            <Button
              className="bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)] text-white"
              onClick={() => onNavigate?.('dashboard')}
            >
              Démonstration
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <div className="space-y-4">
              {menuItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="block py-2 text-gray-700 hover:text-[var(--sahtee-blue-primary)] transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}

              <div className="pt-4 space-y-2">
                <Button
                  variant="outline"
                  className="w-full border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-primary)] hover:text-white"
                  onClick={() => {
                    onNavigate?.('login');
                    setIsMenuOpen(false);
                  }}
                >
                  Connexion
                </Button>
                <Button
                  className="w-full bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)] text-white"
                  onClick={() => {
                    onNavigate?.('dashboard');
                    setIsMenuOpen(false);
                  }}
                >
                  Démonstration
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}