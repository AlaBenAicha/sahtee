import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

export function CTAIntermediate() {
  return (
    <section className="py-20" style={{ backgroundColor: '#1f4993' }}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="bg-white rounded-2xl p-12 shadow-xl">
          <h2 className="text-4xl mb-8 text-gray-900">
            Découvrez comment SAHTEE peut transformer votre organisation
          </h2>

          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Rejoignez les entreprises qui ont déjà révolutionné leur approche
            de la santé et sécurité au travail avec notre plateforme digitale.
          </p>

          <Button
            size="lg"
            className="bg-gradient-to-r from-[var(--sahtee-blue-primary)] to-[var(--sahtee-blue-secondary)] hover:from-[var(--sahtee-blue-primary)] hover:to-[var(--sahtee-blue-secondary)] text-white px-8 py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group hover:brightness-90"
          >
            Demander une démonstration
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
}