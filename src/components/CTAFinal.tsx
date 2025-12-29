import { Button } from "./ui/button";
import { Play, ArrowRight } from "lucide-react";

export function CTAFinal() {
  return (
    <section className="py-20" style={{ backgroundColor: '#1f4993' }}>
      <div className="max-w-6xl mx-auto px-6 text-center">
        <div className="text-white">
          <h2 className="text-4xl md:text-5xl mb-8">
            Découvrez SAHTEE en action
          </h2>
          
          <p className="text-xl md:text-2xl mb-12 text-secondary leading-relaxed max-w-4xl mx-auto">
            Voyez comment SAHTEE peut transformer la santé et sécurité au travail 
            dans votre organisation
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-[var(--sahtee-blue-secondary)] hover:bg-[var(--sahtee-blue-primary)] text-white px-8 py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              Demander une démonstration
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="outline"
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg rounded-lg transition-all duration-300 group"
            >
              <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
              Voir la vidéo
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-16 pt-8 border-t border-primary">
            <p className="text-secondary mb-4">
              Déjà adopté par plus de 100 entreprises
            </p>
            <div className="flex justify-center items-center gap-8 text-secondary">
              <div className="text-center">
                <div className="text-2xl">99.9%</div>
                <div className="text-sm">Disponibilité</div>
              </div>
              <div className="text-center">
                <div className="text-2xl">24/7</div>
                <div className="text-sm">Support</div>
              </div>
              <div className="text-center">
                <div className="text-2xl">ISO 27001</div>
                <div className="text-sm">Certifié</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}