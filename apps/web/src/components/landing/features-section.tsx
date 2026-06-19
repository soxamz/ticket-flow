"use client";

import { AnimatedGroup } from "@repo/ui/components/animated-group";
import { Ticket, Armchair, Zap } from "lucide-react";
import { Tilt } from "@repo/ui/components/tilt";

const features = [
  {
    title: "Interactive 3D Seating",
    description: "Explore venues in 3D before you book. See exactly where you'll sit and the view you'll get.",
    icon: Armchair,
  },
  {
    title: "Instant Booking",
    description: "Lightning fast checkout with real-time seat locks so you never lose your spot to someone else.",
    icon: Zap,
  },
  {
    title: "Digital Tickets",
    description: "Beautifully crafted PDF tickets generated instantly. Download and save to your device.",
    icon: Ticket,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative z-10 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Built with modern technologies to provide the best ticketing experience possible.
          </p>
        </div>

        <AnimatedGroup preset="fade" className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <Tilt key={i} rotationFactor={8} className="h-full">
              <div className="group relative h-full rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 transition-colors hover:bg-card hover:border-primary/50">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-primary/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                    <feature.icon className="size-6" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Tilt>
          ))}
        </AnimatedGroup>
      </div>
    </section>
  );
}
