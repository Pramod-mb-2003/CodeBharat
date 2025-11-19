'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useGame } from '@/context/GameContext';
import { INTERESTS, ALL_INTEREST_KEYS } from '@/lib/constants';
import { Header } from '@/components/common/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BookCheck, LoaderCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { learningContent } from '@/lib/learning-data';
import { Button } from '@/components/ui/button';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { initializeProgress, progress, isInitialized, resetGame } = useGame();
  
  const interestsParam = searchParams.get('interests');
  const userInterests = interestsParam ? interestsParam.split(',').filter(i => ALL_INTEREST_KEYS.includes(i)) : [];

  useEffect(() => {
    if (isInitialized) {
      if (userInterests.length > 0) {
        initializeProgress(userInterests);
      } else if (Object.keys(progress).length === 0) {
        // If no interests in URL and no progress, go back to start
        router.push('/');
      }
    }
  }, [isInitialized, interestsParam, router, initializeProgress, userInterests, progress]);

  const displayInterests = userInterests.length > 0 ? userInterests : Object.keys(progress);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <LoaderCircle className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (displayInterests.length === 0) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h2 className="text-2xl font-bold mb-4">No interests selected!</h2>
        <p className="text-muted-foreground mb-6">Please start the quiz to discover your interests.</p>
        <Button asChild>
          <Link href="/quiz">Take the Quiz</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
                <h1 className="text-3xl sm:text-4xl font-bold font-headline text-foreground">Your Learning Dashboard</h1>
                <p className="text-muted-foreground mt-2">Select an interest to start learning and earning credits!</p>
            </div>
            <Button variant="outline" onClick={resetGame} className="mt-4 sm:mt-0">
                Start Over
            </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayInterests.map(key => {
            const interest = INTERESTS[key];
            if (!interest) return null;
            const interestProgress = progress[key];
            const totalStages = learningContent[key]?.length || 5;
            const completedStages = (interestProgress?.unlockedStage || 1) - 1;
            const progressPercentage = (completedStages / totalStages) * 100;
            const isCompleted = completedStages >= totalStages;

            return (
              <Link href={`/learn/${key}`} key={key}>
                <Card className="h-full flex flex-col justify-between bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-lg hover:shadow-primary/20 hover:-translate-y-2 transition-all duration-300 group">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <interest.Icon className="w-12 h-12 text-primary" />
                      <div>
                        <CardTitle className="text-2xl font-bold font-headline group-hover:text-primary transition-colors">
                          {interest.name}
                        </CardTitle>
                        {isCompleted && 
                            <p className="text-sm font-semibold text-green-500 flex items-center gap-1"><BookCheck className="w-4 h-4"/>Completed!</p>
                        }
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                     <p className="text-muted-foreground mb-4">
                        {isCompleted ? "You've mastered this topic!" : `You are on stage ${completedStages + 1} of ${totalStages}.`}
                    </p>
                    <div className="space-y-2">
                        <Progress value={progressPercentage} />
                        <p className="text-sm text-muted-foreground">{completedStages} / {totalStages} stages completed</p>
                    </div>
                  </CardContent>
                  <CardContent>
                    <div className="text-primary font-semibold flex items-center">
                      {isCompleted ? "Review" : "Continue Learning"}
                      <ArrowRight className="ml-2 h-4 w-4 transform transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen w-full items-center justify-center">
                <LoaderCircle className="h-16 w-16 animate-spin text-primary" />
            </div>
        }>
            <DashboardContent />
        </Suspense>
    )
}
