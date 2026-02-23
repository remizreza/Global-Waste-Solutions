import { useEffect, useState } from "react";

type Milestone = {
  title: string;
  subtitle: string;
};

const milestones: Milestone[] = [
  {
    title: "GAS Plant: Heat Exchanger Cleaning",
    subtitle: "Precision maintenance execution for critical assets.",
  },
  {
    title: "EDCO: Advanced Wastewater Treatment Solutions",
    subtitle: "High-efficiency treatment delivery for compliance readiness.",
  },
  {
    title: "UAE Trading Hub: Achieved 1,600 Tons in Sales Volume within 3 Months",
    subtitle: "Commercial velocity milestone across GCC corridors.",
  },
];

export default function MilestoneStoryReel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActive((prev) => (prev + 1) % milestones.length);
    }, 4200);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-card/60 backdrop-blur-sm">
      <div className="px-5 py-4 border-b border-white/10">
        <p className="text-xs uppercase tracking-[0.18em] text-primary font-tech">
          REDOXY Milestones
        </p>
      </div>
      <div className="p-6">
        <div className="flex gap-2 mb-4">
          {milestones.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === active ? "w-10 bg-primary" : "w-2.5 bg-white/20"
              }`}
            />
          ))}
        </div>
        <h3 className="text-xl text-white font-display mb-2">
          {milestones[active].title}
        </h3>
        <p className="text-sm text-gray-300">{milestones[active].subtitle}</p>
      </div>
    </div>
  );
}
