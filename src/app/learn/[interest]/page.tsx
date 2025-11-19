'use client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGame } from '@/context/GameContext';
import { Header } from '@/components/common/Header';
import { INTERESTS } from '@/lib/constants';
import { learningContent } from '@/lib/learning-data';
import { Lock, PlayCircle, CheckCircle, Star, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function InterestPage() {
  const router = useRouter();
  const params = useParams();
  const interestKey = Array.isArray(params.interest) ? params.interest[0] : params.interest;
  
  const { progress, isInitialized, resetHearts } = useGame();
  
  if (!isInitialized) {
    return <div className="flex min-h-screen w-full items-center justify-center">Loading...</div>;
  }
  
  const interestDetails = INTERESTS[interestKey];
  const stages = learningContent[interestKey];
  const interestProgress = progress[interestKey];

  if (!interestDetails || !stages) {
    router.push('/dashboard');
    return null;
  }
  
  const unlockedStage = interestProgress?.unlockedStage || 1;
  const currentHearts = interestProgress?.hearts ?? 3;
  const isGameOver = currentHearts <= 0;

  const handleRestart = () => {
    resetHearts(interestKey);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header interest={interestKey} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-4">
            <interestDetails.Icon className="w-16 h-16 text-primary" />
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold font-headline">{interestDetails.name}</h1>
              <p className="text-muted-foreground mt-1">Complete all stages to master this interest!</p>
            </div>
          </div>
        </div>

        {isGameOver ? (
          <Card className="text-center p-8 bg-destructive/10 border-destructive">
            <AlertTitle className="text-2xl font-bold mb-2">Game Over</AlertTitle>
            <AlertDescription className="text-lg mb-4">You've run out of hearts!</AlertDescription>
            <AlertDescription className="text-base mb-6">A new heart will regenerate in 20 seconds. Or you can restart now with full hearts.</AlertDescription>
            <Button onClick={handleRestart}>Try Again with Full Hearts</Button>
          </Card>
        ) : (
          <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {/* Dashed line connector - for larger screens */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2">
                <svg width="100%" height="100%"><line x1="0" y1="50%" x2="100%" y2="50%" strokeWidth="2" stroke="hsl(var(--border))" strokeDasharray="8 8" /></svg>
            </div>

            {stages.map(stage => {
              const isUnlocked = stage.id <= unlockedStage && !isGameOver;
              const isCompleted = stage.id < unlockedStage;
              const isCurrent = stage.id === unlockedStage;

              return (
                <div key={stage.id} className="relative z-10">
                  <Link href={isUnlocked ? `/learn/${interestKey}/${stage.id}` : '#'}
                    aria-disabled={!isUnlocked}
                    className={!isUnlocked ? 'pointer-events-none' : ''}
                  >
                    <Card className={`h-48 flex flex-col items-center justify-center text-center p-4 transition-all duration-300 transform 
                      ${isCompleted ? 'bg-green-500/10 border-green-500' : 'bg-card'}
                      ${isCurrent && !isGameOver ? 'border-primary border-2 shadow-primary/30 shadow-lg' : 'border-border'}
                      ${isUnlocked ? 'hover:-translate-y-2 hover:shadow-xl' : 'opacity-60 bg-muted'}
                      ${isGameOver ? 'opacity-50 cursor-not-allowed' : ''}
                    `}>
                      <div className="mb-2">
                        {isCompleted ? (
                          <CheckCircle className="w-10 h-10 text-green-500" />
                        ) : isUnlocked ? (
                          isCurrent ? <PlayCircle className="w-10 h-10 text-primary" /> : <Star className="w-10 h-10 text-yellow-400" />
                        ) : (
                          <Lock className="w-10 h-10 text-muted-foreground" />
                        )}
                      </div>
                      <h3 className="font-bold text-lg">Stage {stage.id}</h3>
                      <p className="text-sm text-muted-foreground">{stage.title}</p>
                    </Card>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
