import { HandHeart, Lightbulb, Scale, Users } from "lucide-react";

export function OurPrinciples() {
  const principles = [
    {
      icon: Users,
      title: "Accessibilité",
      description:
        "Une plateforme simple, fluide et intuitive, conçue pour tous les profils d'utilisateurs.",
      bgColor: "#1f4993",
    },
    {
      icon: Lightbulb,
      title: "Innovation digitale",
      description:
        "Technologies de pointe pour révolutionner la santé et sécurité au travail",
      bgColor: "#3a70b7",
    },
    {
      icon: HandHeart,
      title: "Participation",
      description:
        "Impliquer activement les entreprises, les travailleurs et les experts pour construire ensemble une culture de sécurité vivante.",
      bgColor: "#5a8fd1",
    },
    {
      icon: Scale,
      title: "Éthique & inclusion",
      description:
        "Protéger les données, respecter la diversité culturelle et valoriser l'inclusion.",
      bgColor: "#1f4993",
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
                className="rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg"
                style={{ backgroundColor: principle.bgColor }}
              >
                <principle.icon className="w-10 h-10 text-white" />
              </div>

              <h3 className="text-xl mb-4 text-gray-900 group-hover:text-[#1f4993] transition-colors">
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
