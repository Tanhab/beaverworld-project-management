"use client";

import { Construction, Compass, Map, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function ScenariosPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-[hsl(var(--background))] via-[hsl(var(--muted))]/30 to-[hsl(var(--background))]">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
            <Construction className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-700">Work in Progress</span>
          </div>
          
          <h1 className="text-5xl font-bold text-[hsl(var(--foreground))] mb-4">
            Scenario Testing
          </h1>
          <p className="text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
            Our beavers are hard at work building the perfect scenario testing experience for you.
          </p>
        </div>

        {/* Main Card */}
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-[hsl(var(--card))] rounded-2xl border-2 border-[hsl(var(--border))] shadow-2xl overflow-hidden">
            {/* Decorative Background Pattern */}
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            
            <div className="relative grid md:grid-cols-2 gap-8 p-12">
              {/* Left Side - Image */}
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-[hsl(var(--primary))]/10 rounded-full blur-3xl"></div>
                  <div className="relative bg-white/80 rounded-2xl p-8 shadow-lg">
                    <Image
                      src="/beaver_traveler.png"
                      alt="Beaver Traveler"
                      width={400}
                      height={400}
                      className="w-full h-auto"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Right Side - Content */}
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-[hsl(var(--foreground))]">
                    Coming Soon
                  </h2>
                  <p className="text-lg text-[hsl(var(--muted-foreground))] leading-relaxed">
                    Game scenerio creation and test
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-[hsl(var(--primary))]/10 flex items-center justify-center mt-0.5">
                      <Compass className="h-4 w-4 text-[hsl(var(--primary))]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[hsl(var(--foreground))]">Interactive Test Scenarios</h3>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">Create and run complex test scenarios</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-[hsl(var(--primary))]/10 flex items-center justify-center mt-0.5">
                      <Map className="h-4 w-4 text-[hsl(var(--primary))]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[hsl(var(--foreground))]">Visual Test Mapping</h3>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">Who has tested which scenario</p>
                    </div>
                  </div>
                  
                  
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Link href="/issues" className="flex-1">
                    <Button className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-[hsl(var(--primary-foreground))] font-semibold">
                      Go to Issue Tracker
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/boards" className="flex-1">
                    <Button variant="outline" className="w-full font-semibold">
                      View Task Boards
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="relative border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 px-12 py-6">
              <div className="flex items-center justify-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                <Construction className="h-4 w-4" />
                <p>
                  This feature is currently under development. Check back soon for updates!
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
    </div>
  );
}