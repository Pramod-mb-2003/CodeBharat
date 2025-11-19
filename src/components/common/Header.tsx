'use client';
import Link from 'next/link';
import { Rocket, Award, Heart, LogOut } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { useEffect, useState } from 'react';
import { useAuth } from '@/firebase/provider';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';

type HeaderProps = {
  interest?: string;
};

const MAX_HEARTS = 3;
const HEART_REGEN_TIME = 20 * 1000; // 20 seconds

const HeartIcon = ({ filled, fillPercentage }: { filled: boolean, fillPercentage: number }) => {
    if (filled) {
      return <Heart className="w-6 h-6 text-red-500 fill-current" />;
    }
  
    return (
      <div className="relative w-6 h-6">
        <Heart className="w-6 h-6 text-muted-foreground/50" />
        <div
          className="absolute bottom-0 left-0 w-full overflow-hidden"
          style={{ height: `${fillPercentage}%` }}
        >
          <Heart
            className="absolute bottom-0 left-0 w-6 h-6 text-red-500 fill-current"
            style={{ clipPath: 'inset(0 0 0 0)' }}
          />
        </div>
      </div>
    );
  };


export function Header({ interest }: HeaderProps) {
  const { credits, progress } = useGame();
  const auth = useAuth();
  const router = useRouter();
  const interestProgress = interest && progress[interest];
  const hearts = interestProgress ? interestProgress.hearts : null;
  const lastHeartLost = interestProgress ? interestProgress.lastHeartLost : null;

  const [, setTimer] = useState(0);

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const heartsToRender = [];
  if (hearts !== null) {
      let fillPercentage = 0;
      if (hearts < MAX_HEARTS && lastHeartLost) {
          const elapsed = Date.now() - lastHeartLost;
          const heartsToRegen = Math.floor(elapsed / HEART_REGEN_TIME);
          if (hearts + heartsToRegen < MAX_HEARTS) {
            const timeIntoCurrentRegen = elapsed % HEART_REGEN_TIME;
            fillPercentage = (timeIntoCurrentRegen / HEART_REGEN_TIME) * 100;
          } else {
            fillPercentage = 100; // a heart has been regenerated
          }
      }

      for (let i = 0; i < MAX_HEARTS; i++) {
          if (i < hearts) {
              heartsToRender.push(<HeartIcon key={i} filled={true} fillPercentage={100} />);
          } else if (i === hearts) {
              heartsToRender.push(<HeartIcon key={i} filled={false} fillPercentage={fillPercentage} />);
          } else {
              heartsToRender.push(<HeartIcon key={i} filled={false} fillPercentage={0} />);
          }
      }
  }

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
              {heartsToRender}
              <span className="sr-only">{hearts} hearts remaining</span>
            </div>
          )}
           <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
