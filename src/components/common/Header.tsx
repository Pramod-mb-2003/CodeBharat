'use client';
import Link from 'next/link';
import { Rocket, Award, Heart } from 'lucide-react';
import { useGame } from '@/context/GameContext';

type HeaderProps = {
  interest?: string;
};

export function Header({ interest }: HeaderProps) {
  const { credits, progress } = useGame();
  const hearts = interest && progress[interest] ? progress[interest].hearts : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Rocket className="w-8 h-8 text-primary" />
          <span className="hidden sm:inline text-2xl font-bold text-foreground font-headline">
            Interest Ignition
          </span>
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2 rounded-full bg-accent/50 px-4 py-2">
            <Award className="w-6 h-6 text-accent-foreground" />
            <span className="text-lg font-bold text-accent-foreground">{credits}</span>
            <span className="sr-only">Credits</span>
          </div>
          {hearts !== null && (
            <div className="flex items-center gap-1">
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  className={`w-6 h-6 transition-all ${
                    i < hearts ? 'text-red-500 fill-current' : 'text-muted-foreground/50'
                  }`}
                />
              ))}
              <span className="sr-only">{hearts} hearts remaining</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
