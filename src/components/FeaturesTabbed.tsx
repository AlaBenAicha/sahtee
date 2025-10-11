import { useEffect, useMemo, useRef, useState } from "react";
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

type Feature = {
  id: string;
  title: string;
  description: string;
  icon: IconType;
  media?: string; // optional image URL
};

const FEATURES: Feature[] = [
  {
    id: "board",
    title: "360° Board",
    description:
      "Pilotez votre santé et sécurité au travail en un seul regard.",
    icon: PieChart,
  },
  {
    id: "conformity",
    title: "Conformity Room",
    description:
      "Gardez le contrôle sur vos normes, audits et certifications.",
    icon: ShieldCheck,
  },
  {
    id: "capa",
    title: "CAPA Room",
    description:
      "Agissez vite, suivez vos actions préventives et correctives.",
    icon: RefreshCcw,
  },
  {
    id: "barometer",
    title: "Health Barometer",
    description:
      "Prenez le pouls du bien-être et de la santé au travail.",
    icon: HeartPulse,
  },
  {
    id: "bot",
    title: "SafetyBot",
    description:
      "Votre assistant intelligent pour les risques chimiques et la sécurité.",
    icon: Bot,
  },
  {
    id: "ergo",
    title: "ErgoLab",
    description:
      "Analysez et optimisez les postures et environnements de travail.",
    icon: Microscope,
  },
  {
    id: "impact",
    title: "Impact Calculator",
    description:
      "Mesurez vos gains, votre ROI et votre impact durable.",
    icon: LineChart,
  },
];

export function FeaturesTabbed() {
  const [selected, setSelected] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const activeIndex = hovered ?? selected;
  const active = useMemo(() => FEATURES[activeIndex], [activeIndex]);

  // Keyboard navigation on the tablist container
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const handler = (e: KeyboardEvent) => {
      const max = FEATURES.length - 1;
      if (["ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight", "Home", "End"].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") setSelected((i) => (i - 1 + FEATURES.length) % FEATURES.length);
      if (e.key === "ArrowDown" || e.key === "ArrowRight") setSelected((i) => (i + 1) % FEATURES.length);
      if (e.key === "Home") setSelected(0);
      if (e.key === "End") setSelected(max);
    };
    el.addEventListener("keydown", handler as any);
    return () => el.removeEventListener("keydown", handler as any);
  }, []);

  return (
    <section className="py-20" style={{ backgroundColor: "#f0f4ff" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl mb-6 text-gray-900 dark:text-white">
            Nos fonctionnalités clés
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Une suite complète d&apos;outils pour transformer votre approche de la sécurité au travail
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8">
          {/* Tabs: Vertical on desktop */}
          <div
            ref={listRef}
            className="hidden lg:flex flex-col border border-gray-200 dark:border-white/10 rounded-2xl divide-y divide-gray-200 dark:divide-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-sm"
            role="tablist"
            aria-orientation="vertical"
          >
            {FEATURES.map((f, i) => {
              const isActive = i === activeIndex;
              return (
                <button
                  key={f.id}
                  role="tab"
                  aria-selected={i === selected}
                  aria-controls={`preview-${f.id}`}
                  id={`tab-${f.id}`}
                  className={`flex items-center gap-3 px-4 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    isActive ? "text-gray-900 dark:text-white font-semibold" : "text-gray-600 dark:text-gray-300"
                  }`}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(i)}
                  onBlur={() => setHovered(null)}
                  onClick={() => setSelected(i)}
                >
                  <f.icon className="h-5 w-5 text-gray-900/70 dark:text-white/80" />
                  <span className="truncate">{f.title}</span>
                </button>
              );
            })}
          </div>

          {/* Tabs: Horizontal scroll on mobile */}
          <div className="lg:hidden">
            <div
              ref={listRef}
              className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 -mx-2 px-2"
              role="tablist"
              aria-orientation="horizontal"
            >
              {FEATURES.map((f, i) => {
                const isActive = i === activeIndex;
                return (
                  <button
                    key={f.id}
                    role="tab"
                    aria-selected={i === selected}
                    aria-controls={`preview-${f.id}`}
                    id={`tab-${f.id}`}
                    className={`snap-start whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition-colors border-gray-200 dark:border-white/10 ${
                      isActive
                        ? "bg-white text-gray-900 dark:bg-white/10 dark:text-white font-semibold"
                        : "bg-white/50 dark:bg-white/5 text-gray-600 dark:text-gray-300"
                    }`}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(i)}
                    onBlur={() => setHovered(null)}
                    onClick={() => setSelected(i)}
                  >
                    {f.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview panel */}
          <div
            id="feature-preview"
            role="tabpanel"
            aria-labelledby={`tab-${active.id}`}
            className="border border-gray-200 dark:border-white/10 rounded-2xl bg-white/70 dark:bg-white/5 p-6 md:p-8 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <active.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {active.title}
                </h3>
                <p className="mt-1 text-gray-600 dark:text-gray-300 max-w-2xl">
                  {active.description}
                </p>
              </div>
            </div>

            {/* Media slot: optional image, or demo placeholder */}
            <div className="mt-6">
              {active.media ? (
                <img
                  src={active.media}
                  alt="Aperçu"
                  className="w-full h-56 object-cover rounded-xl border border-gray-200 dark:border-white/10"
                />
              ) : (
                <div className="w-full h-56 rounded-xl border border-dashed border-gray-200 dark:border-white/10 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-white/5 dark:to-white/0 flex items-center justify-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Aperçu en direct
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

