import {
  Bot,
  HeartPulse,
  LineChart,
  Microscope,
  PieChart,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";

type IconType = (props: React.SVGProps<SVGSVGElement>) => JSX.Element;

type Feature = { title: string; icon: IconType; description: string };

const FEATURES: Feature[] = [
  {
    title: "360° Board",
    icon: PieChart,
    description:
      "Pilotez votre santé et sécurité au travail en un seul regard.",
  },
  {
    title: "Conformity Room",
    icon: ShieldCheck,
    description: "Gardez le contrôle sur vos normes, audits et certifications.",
  },
  {
    title: "CAPA Room",
    icon: RefreshCcw,
    description: "Agissez vite, suivez vos actions préventives et correctives.",
  },
  {
    title: "Health Barometer",
    icon: HeartPulse,
    description: "Prenez le pouls du bien-être et de la santé au travail.",
  },
  {
    title: "SafetyBot",
    icon: Bot,
    description:
      "Votre assistant intelligent pour les risques chimiques et la sécurité.",
  },
  {
    title: "ErgoLab",
    icon: Microscope,
    description:
      "Analysez et optimisez les postures et environnements de travail.",
  },
  {
    title: "Impact Calculator",
    icon: LineChart,
    description: "Mesurez vos gains, votre ROI et votre impact durable.",
  },
];

export function FeaturesSmallCards() {
  return (
    <section className="py-20" style={{ backgroundColor: "#f0f4ff" }}>
      <div className="max-w-screen-2xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-4xl mb-4 text-gray-900">
            Nos fonctionnalités clés
          </h2>
          <p className="text-lg text-gray-600">Aperçu rapide des 7 modules</p>
        </div>

        {/* Cards displayed in a single row with equal width and height */}
        <div className="flex flex-row gap-8 overflow-x-auto">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex-1 min-w-[220px] bg-white border border-blue-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1"
            >
              <div className="p-6 flex flex-col items-center text-center gap-4 h-full min-h-[260px]">
                <h3 className="text-base font-semibold text-gray-900">
                  {f.title}
                </h3>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow">
                  <f.icon className="h-6 w-6" />
                </span>
                <p className="text-sm text-gray-600 leading-relaxed flex-grow">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
