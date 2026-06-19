"use client";

import { motion, useInView } from "motion/react";
import { useRef, useEffect, useState } from "react";

function Counter({ end, duration = 2, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      let startTimestamp: number;
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
        // easeOutQuart
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(easeProgress * end));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

const stats = [
  { value: 10000, label: "Tickets Sold", suffix: "+" },
  { value: 500, label: "Events Hosted", suffix: "+" },
  { value: 99, label: "Uptime", suffix: ".9%" },
];

export function StatsSection() {
  return (
    <section className="py-20 border-y border-border/50 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_100%)] opacity-5" />
      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-border/50">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col py-6 md:py-0">
              <div className="text-4xl md:text-5xl font-bold tracking-tight mb-2 text-foreground">
                <Counter end={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-muted-foreground font-medium uppercase tracking-wider text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
