/**
 * Landing Page - Public homepage
 */

import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { AboutUs } from "@/components/AboutUs";
import { WhySahtee } from "@/components/WhySahtee";
import { FeaturesSmallCards } from "@/components/FeaturesSmallCards";
import { OurPrinciples } from "@/components/OurPrinciples";
import { TargetSectors } from "@/components/TargetSectors";
import { CTAIntermediate } from "@/components/CTAIntermediate";
import { CTAFinal } from "@/components/CTAFinal";
import { Footer } from "@/components/Footer";

export default function LandingPage() {
  const navigate = useNavigate();

  // Navigation handler that bridges old component pattern to react-router
  const handleNavigate = (view: string) => {
    switch (view) {
      case "login":
        navigate("/login");
        break;
      case "signup":
        navigate("/signup");
        break;
      case "dashboard":
        navigate("/app/dashboard");
        break;
      case "homepage":
        navigate("/");
        break;
      default:
        navigate("/");
    }
  };

  // Images from Unsplash
  const heroImage =
    "https://images.unsplash.com/photo-1735494032948-14ef288fc9d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3JrcGxhY2UlMjBzYWZldHklMjBjb25zdHJ1Y3Rpb24lMjB3b3JrZXJzfGVufDF8fHx8MTc1ODcyNjExMXww&ixlib=rb-4.1.0&q=80&w=1080";
  const dashboardImage =
    "https://images.unsplash.com/photo-1748609160056-7b95f30041f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwZGFzaGJvYXJkJTIwYW5hbHl0aWNzfGVufDF8fHx8MTc1ODcyMDk2M3ww&ixlib=rb-4.1.0&q=80&w=1080";

  const sectorImages = {
    textile:
      "https://images.unsplash.com/photo-1675176785803-bffbbb0cd2f4?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    food: "https://images.unsplash.com/photo-1668838352480-c9fb3048053a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwcHJvY2Vzc2luZyUyMGluZHVzdHJ5fGVufDF8fHx8MTc1ODcyNjIwNnww&ixlib=rb-4.1.0&q=80&w=1080",
    agriculture:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyZSUyMGZhcm1lciUyMHRyYWN0b3J8ZW58MXx8fHwxNzU4NzI2MjExfDA&ixlib=rb-4.1.0&q=80&w=1080",
    construction:
      "https://images.unsplash.com/photo-1680538993407-aeacacd7354a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBidWlsZGluZyUyMHNpdGV8ZW58MXx8fHwxNzU4NjcyNjg5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    pharmaceutical:
      "https://images.unsplash.com/photo-1582719471384-894fbb16e074?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaGFybWFjZXV0aWNhbCUyMGxhYm9yYXRvcnl8ZW58MXx8fHwxNzU4NzI0MDMzfDA&ixlib=rb-4.1.0&q=80&w=1080",
  };

  return (
    <div className="min-h-screen">
      <Navigation onNavigate={handleNavigate} />

      <main>
        {/* Section 1 - Hero */}
        <section id="home">
          <Hero heroImage={heroImage} onNavigate={handleNavigate} />
        </section>

        {/* Section 2 - Qui sommes-nous */}
        <section id="about">
          <AboutUs />
        </section>

        {/* Section 3 - Présentation générale */}
        <WhySahtee dashboardImage={dashboardImage} />

        {/* Section 4 - Fonctionnalités clés (Small Cards) */}
        <section id="features">
          <FeaturesSmallCards />
        </section>

        {/* Section 5 - Nos principes */}
        <section id="principles">
          <OurPrinciples />
        </section>

        {/* Section 6 - Secteurs visés */}
        <section id="sectors">
          <TargetSectors sectorImages={sectorImages} />
        </section>

        {/* Section 7 - CTA intermédiaire */}
        <CTAIntermediate />
      </main>

      {/* Section 10 - Footer */}
      <section id="contact">
        <Footer onNavigate={handleNavigate} />
      </section>
    </div>
  );
}

