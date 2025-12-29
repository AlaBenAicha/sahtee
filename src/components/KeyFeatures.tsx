import {
  Bot,
  HeartPulse,
  LineChart,
  Microscope,
  PieChart,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import { type ComponentType, type SVGProps } from "react";

interface FeatureCard {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  accent: string;
  layout?: string;
  highlight?: boolean;
}

const FEATURE_DATA: FeatureCard[] = [
  {
    icon: PieChart,
    title: "360° Board",
    description:
      "Pilotez votre santé et sécurité au travail en un seul regard.",
    accent: "from-primary to-primary",
    layout: "xl:col-span-2",
  },
  {
    icon: ShieldCheck,
    title: "Conformity Room",
    description: "Gardez le contrôle sur vos normes, audits et certifications.",
    accent: "from-indigo-500 to-primary",
    layout: "xl:col-span-2",
  },
  {
    icon: RefreshCcw,
    title: "CAPA Room",
    description: "Agissez vite, suivez vos actions préventives et correctives.",
    accent: "from-cyan-500 to-primary",
    layout: "xl:col-span-2",
  },
  {
    icon: HeartPulse,
    title: "Health Meter",
    description: "Prenez le pouls du bien-être et de la santé au travail.",
    accent: "from-primary via-indigo-500 to-primary",
    layout: "xl:col-span-4 xl:col-start-2",
    highlight: true,
  },
  {
    icon: Bot,
    title: "SafetyBot",
    description:
      "Votre assistant intelligent pour les risques chimiques et la sécurité.",
    accent: "from-primary to-primary",
    layout: "xl:col-span-2",
  },
  {
    icon: Microscope,
    title: "ErgoLab",
    description:
      "Analysez et optimisez les postures et environnements de travail.",
    accent: "from-sky-500 to-primary",
    layout: "xl:col-span-2",
  },
  {
    icon: LineChart,
    title: "Impact Calculator",
    description: "Mesurez vos gains, votre ROI et votre impact durable.",
    accent: "from-indigo-500 to-primary",
    layout: "xl:col-span-2",
  },
];

export function KeyFeatures() {
  return (
    <section className="py-20" style={{ backgroundColor: "#f0f4ff" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-6 text-gray-900">
            Nos fonctionnalités clés
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Une suite complète d&apos;outils pour transformer votre approche de
            la sécurité au travail
          </p>
        </div>

        {/* Striped non-card layout with balanced last tile */}
        <div className="relative overflow-hidden rounded-3xl bg-white/40 p-8 ring-1 ring-inset ring-secondary/60">
          <div className="pointer-events-none absolute -top-24 left-1/3 h-64 w-64 rounded-full bg-secondary/30 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl" />

          <div className="relative grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-12 gap-y-10">
            {FEATURE_DATA.map((feature, index) => {
              const isLast = index === FEATURE_DATA.length - 1;
              return (
                <div
                  key={feature.title}
                  className={`${
                    isLast
                      ? "xl:col-span-2 xl:justify-self-center xl:max-w-2xl"
                      : ""
                  } group`}
                >
                  <div className="flex items-start gap-5">
                    <span
                      className={`relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-br ${feature.accent} text-white shadow-lg ring-4 ring-secondary/60 transition-transform duration-300 group-hover:scale-110 h-14 w-14`}
                    >
                      <feature.icon className="h-7 w-7" />
                      <span className="absolute inset-0 rounded-2xl bg-white/20 mix-blend-overlay" />
                    </span>

                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600 max-w-md">
                        {feature.description}
                      </p>

                      <button
                        className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary transition-colors"
                        aria-label={`Découvrir ${feature.title}`}
                      >
                        Découvrir
                        <span aria-hidden>&rarr;</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 h-px w-full bg-gradient-to-r from-secondary/50 via-secondary/40 to-transparent" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
