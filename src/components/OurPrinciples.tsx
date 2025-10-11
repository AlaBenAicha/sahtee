import { HandHeart, Lightbulb, Scale, Users } from "lucide-react";

export function OurPrinciples() {
  const principles = [
    {
      icon: Users,
      title: "Accessibilité",
      description:
        "Une plateforme simple, fluide et intuitive, conçue pour tous les profils d'utilisateurs.",
      color: "from-blue-400 to-blue-600",
    },
    {
      icon: Lightbulb,
      title: "Innovation digitale",
      description:
        "Technologies de pointe pour révolutionner la santé et sécurité au travail",
      color: "from-blue-400 to-blue-600",
    },
    {
      icon: HandHeart,
      title: "Participation",
      description:
        "Impliquer activement les entreprises, les travailleurs et les experts pour construire ensemble une culture de sécurité vivante.",
      color: "from-blue-500 to-blue-700",
    },
    {
      icon: Scale,
      title: "Éthique & inclusion",
      description:
        "Protéger les données, respecter la diversité culturelle et valoriser l'inclusion.",
      color: "from-blue-300 to-blue-500",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-6 text-gray-900">Nos principes</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Les valeurs qui guident notre approche de la santé et sécurité au
            travail
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {principles.map((principle, index) => (
            <div
              key={index}
              className="text-center group hover:-translate-y-2 transition-all duration-300"
            >
              <div
                className={`bg-gradient-to-br ${principle.color} rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
              >
                <principle.icon className="w-10 h-10 text-white" />
              </div>

              <h3 className="text-xl mb-4 text-gray-900 group-hover:text-green-600 transition-colors">
                {principle.title}
              </h3>

              <p className="text-gray-600 leading-relaxed">
                {principle.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
