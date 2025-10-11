import { Button } from "./ui/button";
import sahteeLogoBlue from "figma:asset/2c9287bd076e1cc144dd8b599ad076a48185b78b.png";

interface HeroProps {
  heroImage: string;
  onNavigate?: (view: string) => void;
}

export function Hero({ heroImage, onNavigate }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--sahtee-blue-primary)]/80 to-[var(--sahtee-blue-secondary)]/60"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center text-white">
        <h1 className="mb-6 tracking-tight">
          <img src={sahteeLogoBlue} alt="SAHTEE" className="inline-block h-40 md:h-48 w-auto mx-auto filter brightness-0 invert rounded-[11px] pt-[-21px] pr-[5px] pb-[5px] pl-[-12px] mx-[60px] my-[-15px]" />
          <span className="block text-2xl md:text-3xl mt-4 text-blue-300">
            Prévenir, c'est Performer
          </span>
        </h1>
        
        <h2 className="text-xl md:text-2xl mb-8 text-blue-200">
          Vers des environnements de travail durables
        </h2>
        
        <p className="text-lg md:text-xl mb-12 max-w-4xl mx-auto leading-relaxed text-gray-100">
          La plateforme digitale pour une santé et sécurité au travail inclusive. 
          Réduisez vos risques, engagez vos équipes et construisez une culture de prévention durable.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-[var(--sahtee-blue-secondary)] hover:bg-[var(--sahtee-blue-primary)] text-white px-8 py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => onNavigate?.('dashboard')}
          >
            Demander une démonstration
          </Button>
          <Button 
            variant="outline"
            size="lg" 
            className="border-white text-white hover:bg-white hover:text-[var(--sahtee-blue-primary)] px-8 py-4 text-lg rounded-lg transition-all duration-300 bg-[var(--sahtee-blue-primary)]/40"
            onClick={() => onNavigate?.('login')}
          >
            Connexion / Inscription
          </Button>
        </div>
      </div>
    </section>
  );
}