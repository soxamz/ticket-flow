"use client";

import { AnimatedGroup } from "@repo/ui/components/animated-group";
import { RainbowButton } from "@repo/ui/components/rainbow-button";
import { Button } from "@repo/ui/components/button";
import { HexagonPattern } from "@repo/ui/components/hexagon-pattern";
import { cn } from "@repo/ui/lib/utils";
import Link from "next/link";
import { motion } from "motion/react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-50" />
      </div>
      
      <HexagonPattern
        hexagons={[
          [1, 1], [4, 4], [2, 2], [3, 4], [5, 4], [8, 2], [6, 3], [8, 5], [10, 10], [12, 6], [15, 3]
        ]}
        className={cn(
          "mask-[radial-gradient(800px_circle_at_center,white,transparent)]",
          "absolute inset-0 z-0 fill-primary/10 stroke-primary/10"
        )}
      />

      <div className="container relative z-10 px-4 flex flex-col items-center text-center">
        <AnimatedGroup preset="slide" className="flex flex-col items-center max-w-4xl">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
            The new standard for event ticketing
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-balance">
            Book Your Seat. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
              Own the Moment.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl text-balance">
            Experience seamless ticketing with real-time 3D seat selection, instant bookings, and a premium checkout flow. 
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <RainbowButton asChild size="lg" className="w-full sm:w-auto text-base h-12 px-8">
              <Link href="/register">Get Started Now</Link>
            </RainbowButton>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 rounded-xl bg-background/50 backdrop-blur-sm border-border/50 hover:bg-muted">
              <Link href="/dashboard">Browse Events</Link>
            </Button>
          </div>
        </AnimatedGroup>
      </div>

      {/* Decorative gradient floor */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
