
'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { Header } from '@/components/common/Header';
import { LoaderCircle, Trophy, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ALL_GOODIES, Goodie } from '@/lib/goodies-data';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

function GoodiesContent() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isInitialized, credits } = useGame();
  const [claimedGoodies, setClaimedGoodies] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/');
    }
  }, [user, isInitialized, router]);

  useEffect(() => {
    const loadedClaimed: Record<number, boolean> = {};
    ALL_GOODIES.forEach(goodie => {
      if (goodie.type === 'real') {
        const isClaimed = localStorage.getItem(`goodie_claimed_${goodie.id}`);
        if (isClaimed) {
          loadedClaimed[goodie.id] = true;
        }
      }
    });
    setClaimedGoodies(loadedClaimed);
  }, []);

  const claimRealGoodie = (goodie: Goodie) => {
    if (credits < goodie.id) {
      toast({
        title: "Not so fast!",
        description: "You haven't unlocked this reward yet.",
        variant: "destructive",
      });
      return;
    }
    if (claimedGoodies[goodie.id]) {
      toast({
        title: "Already Claimed",
        description: "You have already claimed this goodie. See your teacher for pickup.",
      });
      return;
    }
    
    // In a real app, this would open a request form or trigger a backend process.
    localStorage.setItem(`goodie_claimed_${goodie.id}`, 'true');
    setClaimedGoodies(prev => ({ ...prev, [goodie.id]: true }));
    toast({
      title: "Claim Recorded!",
      description: "Please contact your teacher to collect your reward.",
    });
  };
  
  if (!isInitialized || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <LoaderCircle className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const unlockedGoodiesCount = ALL_GOODIES.filter(g => credits >= g.id).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
            <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Button>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <div className="flex items-center gap-4">
                        <Trophy className="w-12 h-12 text-primary" />
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold font-headline text-foreground">Goodies & Rewards</h1>
                            <p className="text-muted-foreground mt-2">Your earned rewards appear here. Reach higher to unlock better goodies!</p>
                        </div>
                    </div>
                </div>
                <Card className="p-4 mt-4 sm:mt-0 text-center bg-card/80">
                    <CardDescription>Your Credits</CardDescription>
                    <CardTitle className="text-3xl">{credits}</CardTitle>
                </Card>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="goodies-grid">
              {ALL_GOODIES.map((goodie) => {
                const isUnlocked = credits >= goodie.id;
                const isClaimed = claimedGoodies[goodie.id];

                return (
                  <div key={goodie.id} className={cn('goodie-card', isUnlocked ? 'unlocked' : 'locked')}>
                    <div className="goodie-icon">{goodie.icon}</div>
                    <div className="flex-1">
                      <div className="goodie-name">{goodie.name}</div>
                      <div className="goodie-desc">{goodie.description}</div>
                      <div className="mt-2 text-xs text-muted-foreground">Required: <strong>{goodie.id} pts</strong></div>
                    </div>
                    <div className="flex flex-col items-center gap-2 ml-3">
                      {isUnlocked ? (
                        goodie.type === 'real' ? (
                          <Button size="sm" onClick={() => claimRealGoodie(goodie)} disabled={isClaimed}>
                            {isClaimed ? "Claimed ✓" : "Claim"}
                          </Button>
                        ) : (
                          <div className="goodie-badge">{goodie.type.toUpperCase()}</div>
                        )
                      ) : (
                        <Button size="sm" variant="secondary" disabled>Locked</Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                 <p className="font-semibold">Your Credits: <span className="font-bold text-primary">{credits}</span></p>
                 <p className="font-semibold">Goodies Unlocked: <span className="font-bold text-primary">{unlockedGoodiesCount}</span></p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>How Rewards Work</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Earn credits by completing learning stages.</li>
                    <li>At credit milestones, a new goodie unlocks automatically.</li>
                    <li>Real-world goodies require claiming. We'll notify your teacher!</li>
                </ol>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default function GoodiesPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen w-full items-center justify-center">
                <LoaderCircle className="h-16 w-16 animate-spin text-primary" />
            </div>
        }>
            <GoodiesContent />
        </Suspense>
    )
}
