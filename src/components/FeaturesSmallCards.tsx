import { HeartPulse, RefreshCcw, ShieldCheck, MessageSquareCode } from "lucide-react";
import React from "react";

type IconType = React.ElementType;

type Feature = { id: string; title: string; icon: IconType; description: string; color: string };

const MAIN_FEATURES: Feature[] = [
  {
    id: "cr",
    title: "Conformity Room",
    icon: ShieldCheck,
    description: "Contrôle total sur vos normes et audits.",
    color: "#00bfa5", // Teal
  },
  {
    id: "capa",
    title: "CAPA Room",
    icon: RefreshCcw,
    description: "Suivi efficace des actions correctives.",
    color: "#66cc8a", // Medium Green
  },
  {
    id: "health",
    title: "Health Meter",
    icon: HeartPulse,
    description: "Bien-être et santé au travail mesurés.",
    color: "#a5d6a7", // Light Green
  },
];

const SAFETY_BOT = {
  title: "SafetyBot",
  icon: MessageSquareCode,
  description: "Votre assistant intelligent",
};

export function FeaturesSmallCards() {
  return (
    <section id="features" className="relative overflow-hidden bg-white" style={{ paddingTop: "5rem" }}>
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900 tracking-tight">
            Nos fonctionnalités clés
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Aperçu rapide de 3 modules interconnectés
          </p>
        </div>

        <div className="relative w-full max-w-[900px] mx-auto overflow-visible px-4">
          {/* Main Gauge Container */}
          <div className="relative aspect-[2/1] w-full max-h-[500px] mx-auto">
            {/* SVG for Gauge Background and Segments */}
            <svg viewBox="0 0 600 320" className="w-full h-full drop-shadow-2xl overflow-visible">
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Segment 1: Left (Conformity) - 180 to 120 degrees */}
              <path
                d="M 190 300 A 110 110 0 0 1 245 204.74 L 170 74.83 A 260 260 0 0 0 40 300 Z"
                fill={MAIN_FEATURES[0].color}
                className="transition-opacity duration-300 hover:opacity-90 cursor-pointer"
              />

              {/* Segment 2: Center (CAPA) - 120 to 60 degrees */}
              <path
                d="M 245 204.74 A 110 110 0 0 1 355 204.74 L 430 74.83 A 260 260 0 0 0 170 74.83 Z"
                fill={MAIN_FEATURES[1].color}
                className="transition-opacity duration-300 hover:opacity-90 cursor-pointer"
              />

              {/* Segment 3: Right (Health) - 60 to 0 degrees */}
              <path
                d="M 355 204.74 A 110 110 0 0 1 410 300 L 560 300 A 260 260 0 0 0 430 74.83 Z"
                fill={MAIN_FEATURES[2].color}
                className="transition-opacity duration-300 hover:opacity-90 cursor-pointer"
              />

              {/* White lines / gaps between segments */}
              <line x1="245" y1="204.74" x2="170" y2="74.83" stroke="white" strokeWidth="4" />
              <line x1="355" y1="204.74" x2="430" y2="74.83" stroke="white" strokeWidth="4" />

              {/* Inner Hub (Safety Bot) */}
              <circle cx="300" cy="300" r="100" fill="#1f4993" filter="url(#glow)" />

              {/* Foreign Objects for Text Overlays - Embedded in SVG for perfect positioning */}

              {/* Conformity - Left Segment */}
              <foreignObject x="60" y="140" width="160" height="160">
                <div className="h-full flex flex-col items-center justify-center text-white text-center pointer-events-none p-1 overflow-visible">
                  <h3 className="font-bold text-xs md:text-base tracking-tight drop-shadow-sm">Conformity<br />Room</h3>
                  <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 mb-2 text-white" style={{ stroke: 'white' }} />
                  <p className="text-[10px] leading-tight opacity-95 font-medium drop-shadow-sm mt-1" style={{ transform: 'scale(0.6)', transformOrigin: 'top' }}>{MAIN_FEATURES[0].description}</p>
                </div>
              </foreignObject>

              {/* CAPA - Center Segment */}
              <foreignObject x="220" y="60" width="160" height="160">
                <div className="h-full flex flex-col items-center justify-center text-white text-center pointer-events-none p-1 overflow-visible">
                  <h3 className="font-bold text-xs md:text-base tracking-tight drop-shadow-sm">CAPA Room</h3>
                  <RefreshCcw className="w-8 h-8 md:w-10 md:h-10 mb-2 text-white" style={{ stroke: 'white' }} />
                  <p className="text-[10px] leading-tight opacity-95 font-medium drop-shadow-sm mt-1" style={{ transform: 'scale(0.6)', transformOrigin: 'top' }}>{MAIN_FEATURES[1].description}</p>
                </div>
              </foreignObject>

              {/* Health - Right Segment */}
              <foreignObject x="380" y="140" width="160" height="160">
                <div className="h-full flex flex-col items-center justify-center text-white text-center pointer-events-none p-1 overflow-visible">
                  <h3 className="font-bold text-xs md:text-base tracking-tight drop-shadow-sm">Health<br />Meter</h3>
                  <HeartPulse className="w-8 h-8 md:w-10 md:h-10 mb-2 text-white" style={{ stroke: 'white' }} />
                  <p className="text-[10px] leading-tight opacity-95 font-medium drop-shadow-sm mt-1" style={{ transform: 'scale(0.6)', transformOrigin: 'top' }}>{MAIN_FEATURES[2].description}</p>
                </div>
              </foreignObject>

              {/* Safety Bot Hub */}
              <foreignObject x="220" y="220" width="160" height="100">
                <div className="h-full flex flex-col items-center justify-center text-white text-center pointer-events-none p-1">
                  <MessageSquareCode className="w-8 h-8 md:w-12 md:h-12 mb-2 drop-shadow-sm" />
                  <h3 className="font-bold text-xs md:text-base tracking-tight drop-shadow-sm">{SAFETY_BOT.title}</h3>
                  <p className="text-[6px] md:text-[7px] text-blue-100 opacity-90 drop-shadow-sm" style={{ transform: 'scale(0.6)', transformOrigin: 'top' }}>{SAFETY_BOT.description}</p>
                </div>
              </foreignObject>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
