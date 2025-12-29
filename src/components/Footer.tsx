import { Button } from "./ui/button";
import { Mail, Phone, Globe, MapPin } from "lucide-react";

// Import des logos depuis Figma
import sahteeLogoMain from "figma:asset/ac5574e5ec6815d394fbbf49068ce0966f1cd545.png";

interface FooterProps {
  onNavigate?: (view: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer
      className="py-16 relative overflow-hidden"
      style={{ backgroundColor: '#f6f9ee' }}
    >
      {/* Pattern Background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300814e'%3E%3Cpath d='M30 30c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      ></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-3 gap-12 items-start">
          {/* Logo et description */}
          <div>

            <p className="text-gray-600 leading-relaxed mb-6">
              La plateforme digitale pour une santé et sécurité au travail inclusive.
              Prévenir, c'est Performer.
            </p>
            <Button
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
            >
              Accéder à la plateforme
            </Button>
          </div>

          {/* Coordonnées */}
          <div>
            <h3 className="text-xl mb-6 text-gray-900">
              Contactez-nous
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 rounded-full p-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-900">Healthcare Innovation</p>
                  <p className="text-gray-600 text-sm">Cluster HealthTech Tunisie</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-secondary rounded-full p-2">
                  <Globe className="w-4 h-4 text-primary" />
                </div>
                <a
                  href="https://www.sahtee.tn"
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  www.sahtee.tn
                </a>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-green-100 rounded-full p-2">
                  <Mail className="w-4 h-4 text-green-600" />
                </div>
                <a
                  href="mailto:contact@sahtee.tn"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  contact@sahtee.com
                </a>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-secondary rounded-full p-2">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <a
                  href="tel:+216"
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  +216 54 525 267
                </a>
              </div>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-xl mb-6 text-gray-900">
              Liens rapides
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <a href="#" className="block text-gray-600 hover:text-green-600 transition-colors">
                  À propos
                </a>
                <a href="#" className="block text-gray-600 hover:text-green-600 transition-colors">
                  Fonctionnalités
                </a>
                <a href="#" className="block text-gray-600 hover:text-green-600 transition-colors">
                  Secteurs
                </a>
                <a href="#" className="block text-gray-600 hover:text-green-600 transition-colors">
                  Blog
                </a>
              </div>
              <div className="space-y-3">
                <a href="#" className="block text-gray-600 hover:text-primary transition-colors">
                  Support
                </a>
                <a href="#" className="block text-gray-600 hover:text-primary transition-colors">
                  Documentation
                </a>
                <a href="#" className="block text-gray-600 hover:text-primary transition-colors">
                  Packs
                </a>
                <a href="#" className="block text-gray-600 hover:text-primary transition-colors">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-300 mt-12 pt-8 text-center">
          <p className="text-gray-600">
            © {new Date().getFullYear()} SAHTEE - Healthcare Innovation. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}