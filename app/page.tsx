import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { PlansSection } from "@/components/landing/plans-section";
import { VideoReview } from "@/components/landing/video-review";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Footer } from "@/components/landing/footer";
import type { Plan } from "@/components/landing/plan-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let plans: Plan[] = [];

  if (supabaseAdmin) {
    const { data: allPlans } = await supabaseAdmin
      .from("plans")
      .select("*")
      .eq("active", true)
      .order("price_ars", { ascending: true });

    plans = (allPlans as Plan[]) || [];
  }

  const weeklyPlans = plans.filter((p) => p.cadence === "weekly");
  const monthlyPlans = plans.filter((p) => p.cadence === "monthly");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Grid texture background */}
      <div className="fixed inset-0 -z-10 tech-grid opacity-[0.15]" />

      <Navbar />

      <Hero />

      <PlansSection
        id="planes-semanales"
        title="PLANES SEMANALES"
        description="Programacion con ajustes cada 7 dias. Ideal para comenzar o mantener progresion constante."
        plans={weeklyPlans}
      />

      <PlansSection
        id="planes-mensuales"
        title="PLANES MENSUALES"
        description="Periodizacion de 30 dias con seguimiento intensivo. Para atletas que compiten o buscan maximo rendimiento."
        plans={monthlyPlans}
      />

      <VideoReview />

      <HowItWorks />

      <Footer />
    </div>
  );
}
