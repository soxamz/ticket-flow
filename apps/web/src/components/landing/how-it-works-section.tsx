"use client";

import { CalendarSearch, MousePointerClick, Download } from "lucide-react";
import { motion } from "motion/react";

const steps = [
  {
    title: "Find an Event",
    description: "Browse our curated list of upcoming events, concerts, and shows.",
    icon: CalendarSearch,
  },
  {
    title: "Select Your Seats",
    description: "Use our interactive map to pick the perfect spot for the show.",
    icon: MousePointerClick,
  },
  {
    title: "Get Your Tickets",
    description: "Checkout instantly and download your beautiful digital ticket.",
    icon: Download,
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 relative bg-muted/30">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
          <p className="text-muted-foreground">Three simple steps to secure your next experience.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-[2px] bg-border">
            <motion.div 
              className="absolute inset-y-0 left-0 bg-primary"
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </div>

          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.2, duration: 0.5 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 border-background bg-card text-foreground shadow-xl">
                <step.icon className="size-6 text-primary" />
              </div>
              <h3 className="mt-6 mb-2 text-xl font-bold">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
