import { Target, Shield, TrendingUp, Users } from "lucide-react";

export function AboutUs() {
  const highlights = [
    {
      icon: Shield,
      title: "Automatisation SST",
      description: "Automatisez vos processus de santé et sécurité au travail"
    },
    {
      icon: TrendingUp,
      title: "Réduction des risques",
      description: "Réduisez significativement vos risques opérationnels"
    },
    {
      icon: Target,
      title: "Conformité réglementaire",
      description: "Respectez toutes les exigences réglementaires en vigueur"
    },
    {
      icon: Users,
      title: "Culture de prévention",
      description: "Ancrez durablement une culture de sécurité"
    }
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-white to-[var(--sahtee-neutral)] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--sahtee-blue-primary)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--sahtee-blue-secondary)]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl text-[var(--sahtee-blue-primary)] mb-6">
            Qui sommes-nous ?
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[var(--sahtee-blue-primary)] to-[var(--sahtee-blue-secondary)] mx-auto mb-8"></div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left side - Main description with visual interest */}
          <div className="space-y-6 h-full flex flex-col">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-[var(--sahtee-blue-primary)]/10 flex-1">
              <div className="flex items-start gap-4">
                <div className="w-2 h-full bg-gradient-to-b from-[var(--sahtee-blue-primary)] to-[var(--sahtee-blue-secondary)] rounded-full"></div>
                <div>
                  <p className="text-lg leading-relaxed text-gray-700">
                    <span className="text-[var(--sahtee-blue-primary)]">SAHTEE</span> est une plateforme dédiée à la gestion de la santé et de la sécurité au travail dans les environnements professionnels.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[var(--sahtee-blue-primary)] to-[var(--sahtee-blue-secondary)] rounded-2xl p-8 shadow-xl text-white flex-1">
              <h3 className="text-2xl mb-4 flex items-center gap-3">
                <Target className="w-6 h-6" />
                Notre Mission
              </h3>
              <p className="text-lg leading-relaxed text-secondary">
                Accompagner les entreprises dans l'automatisation de leurs processus SST, la réduction des risques opérationnels, le respect des exigences réglementaires et l'ancrage durable d'une culture de prévention et de sécurité au sein de leurs organisations.
              </p>
            </div>
          </div>

          {/* Right side - Key highlights */}
          <div className="grid sm:grid-cols-2 gap-4">
            {highlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-[var(--sahtee-blue-primary)]/10 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--sahtee-blue-primary)] to-[var(--sahtee-blue-secondary)] rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-[var(--sahtee-blue-primary)] mb-2">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
