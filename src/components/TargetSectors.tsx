import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

interface TargetSectorsProps {
  sectorImages: {
    textile: string;
    food: string;
    agriculture: string;
    construction: string;
    pharmaceutical: string;
  };
}

export function TargetSectors({ sectorImages }: TargetSectorsProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const sectors = [
    {
      title: "Textile",
      description:
        "Prévention des troubles musculo-squelettiques et amélioration de l'ergonomie des postes dans les ateliers de production textile.",
      image: sectorImages.textile,
    },
    {
      title: "Agroalimentaire",
      description:
        "Sécurité sanitaire, prévention des risques biologiques et maîtrise des procédés de production et de manutention.",
      image: sectorImages.food,
    },
    {
      title: "Agricole",
      description:
        "Protection contre les pesticides, prévention des accidents liés aux machines et aux conditions climatiques.",
      image: sectorImages.agriculture,
    },
    {
      title: "BTP (Bâtiment & Travaux Publics)",
      description:
        "Réduction des risques de chute, sécurité des manutentions et conformité réglementaire sur site.",
      image: sectorImages.construction,
    },
    {
      title: "Pharmaceutique",
      description:
        "Sécurité biologique et chimique, traçabilité des procédés et conformité aux standards internationaux.",
      image: sectorImages.pharmaceutical,
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sectors.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sectors.length) % sectors.length);
  };

  return (
    <section className="py-20" style={{ backgroundColor: "#f0f4ff" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-6 text-gray-900">Secteurs visés</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Des solutions adaptées à chaque secteur d'activité
          </p>
        </div>

        {/* Carousel with external navigation */}
        <div className="relative flex items-center gap-4">
          {/* Left Navigation Button */}
          <button
            onClick={prevSlide}
            className="flex-shrink-0 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-10"
            type="button"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>

          {/* Slider Container */}
          <div className="flex-1">
            <div className="overflow-hidden rounded-2xl">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {sectors.map((sector, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[500px]">
                      <div className="order-2 lg:order-1 px-8">
                        <div className="flex items-center gap-4 mb-6">
                          <h3 className="text-3xl text-gray-900">
                            {sector.title}
                          </h3>
                        </div>
                        <p className="text-xl text-gray-600 leading-relaxed mb-8">
                          {sector.description}
                        </p>
                        <Button
                          variant="outline"
                          className="border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-primary)] hover:text-white"
                        >
                          En savoir plus
                        </Button>
                      </div>
                      <div className="order-1 lg:order-2">
                        <img
                          src={sector.image}
                          alt={sector.title}
                          className="w-full h-80 object-cover rounded-xl shadow-lg"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-8 space-x-2">
              {sectors.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                      ? "bg-[var(--sahtee-blue-primary)] scale-125"
                      : "bg-gray-300 hover:bg-gray-400"
                    }`}
                />
              ))}
            </div>
          </div>

          {/* Right Navigation Button */}
          <button
            onClick={nextSlide}
            className="flex-shrink-0 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-10"
            type="button"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>
    </section>
  );
}
