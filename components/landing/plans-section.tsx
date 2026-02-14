import { PlanCard, type Plan } from "./plan-card";

interface PlansSectionProps {
  id: string;
  title: string;
  description: string;
  plans: Plan[];
}

export function PlansSection({ id, title, description, plans }: PlansSectionProps) {
  if (plans.length === 0) return null;

  return (
    <section id={id} className="py-20 md:py-28 px-6">
      <div className="container-pad">
        <div className="text-center mb-14 animate-slide-up">
          <h2 className="section-title mb-3 font-display">{title}</h2>
          <p className="section-subtitle mx-auto">{description}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}
