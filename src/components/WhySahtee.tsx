import {
  AlertTriangle,
  Database,
  Shield,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

interface WhySahteeProps {
  dashboardImage: string;
}

export function WhySahtee({ dashboardImage }: WhySahteeProps) {
  const cycleSteps = [
    {
      icon: Database,
      verb: "COLLECTER",
      description: "les données du terrain",
      color: "from-primary to-primary",
      angle: 0, // Top (12 o'clock)
    },
    {
      icon: TrendingUp,
      verb: "ANALYSER",
      description: "les indicateurs clés",
      color: "from-cyan-500 to-cyan-600",
      angle: 60, // 2 o'clock
    },
    {
      icon: AlertTriangle,
      verb: "DÉTECTER",
      description: "les failles et signaux faibles",
      color: "from-orange-500 to-orange-600",
      angle: 120, // 4 o'clock
    },
    {
      icon: Target,
      verb: "RÉAGIR",
      description: "par des actions ciblées et mesurables",
      color: "from-red-500 to-red-600",
      angle: 180, // Bottom (6 o'clock)
    },
    {
      icon: Shield,
      verb: "SE CONFORMER",
      description: "aux normes et exigences internationales",
      color: "from-purple-500 to-purple-600",
      angle: 240, // 8 o'clock
    },
    {
      icon: Zap,
      verb: "SE PERFORMER",
      description: "durablement",
      color: "from-green-500 to-green-600",
      angle: 300, // 10 o'clock
    },
  ];

  // Calculate position based on angle - much smaller radius for compact layout
  const getPosition = (angle: number, radius: number = 220) => {
    const radian = ((angle - 90) * Math.PI) / 180; // -90 to start from top
    const x = Math.cos(radian) * radius;
    const y = Math.sin(radian) * radius;
    return { x, y };
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Two-column layout: Text left, Circular diagram right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Pourquoi SAHTEE ?
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              parce que la santé des travailleurs fait la santé des entreprises.
            </p>
          </div>

          {/* Right side - Circular Cycle Design */}
          <div className="relative">
            {/* Container with much smaller height */}
            <div className="relative w-full" style={{ minHeight: "550px" }}>
              {/* Central Circle - Ultra-minimalist */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                style={{ width: "180px", height: "180px" }}
              >
                {/* Clean white circle with subtle shadow */}
                <div className="absolute inset-0 rounded-full bg-white shadow-lg flex items-center justify-center">
                  <div className="text-center p-4">
                    {/* Icon - No background, just SAHTEE blue */}
                    <div className="mx-auto mb-2 flex items-center justify-center">
                      <Zap
                        className="w-8 h-8"
                        style={{ color: "var(--sahtee-blue-primary)" }}
                        strokeWidth={2.5}
                      />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">
                      Cycle de Performance
                    </h3>
                    <p className="text-xs text-gray-600 leading-tight">
                      De la prévention à la performance
                    </p>
                  </div>
                </div>
              </div>

              {/* Cycle Steps - Minimalist without cards */}
              <div>
                {cycleSteps.map((step, index) => {
                  const Icon = step.icon;
                  const position = getPosition(step.angle);

                  return (
                    <div
                      key={index}
                      className="absolute z-10"
                      style={{
                        left: "50%",
                        top: "50%",
                        transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                      }}
                    >
                      <div className="relative group">
                        {/* Ultra-minimalist Step - Just icon and text */}
                        <div className="relative w-44 text-center">
                          {/* Icon - No background, just the icon in SAHTEE blue */}
                          <div className="mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Icon
                              className="w-10 h-10 flex-shrink-0"
                              style={{ color: "var(--sahtee-blue-primary)" }}
                              strokeWidth={2}
                            />
                          </div>

                          {/* Content - Clean typography */}
                          <h4 className="text-sm font-bold mb-1 text-gray-900">
                            {step.verb}
                          </h4>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {step.description}
                          </p>
                        </div>

                        {/* Very subtle connecting line to center */}
                        <div
                          className="absolute top-5 left-1/2 pointer-events-none opacity-10"
                          style={{
                            width: "1px",
                            height: "70px",
                            background: "rgba(156, 163, 175, 0.6)",
                            transform: `translate(-50%, -50%) rotate(${step.angle + 90
                              }deg)`,
                            transformOrigin: "center",
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Subtle circular flow indicator - minimalist */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none opacity-10"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="30"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="0.3"
                  strokeDasharray="1,3"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
