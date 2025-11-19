'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGame } from '@/context/GameContext';
import { INTERESTS } from '@/lib/constants';
import { Header } from '@/components/common/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BookCheck, LoaderCircle, PartyPopper } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { learningContent } from '@/lib/learning-data';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function DashboardContent() {
  const router = useRouter();
  const { interests, progress, isInitialized, resetGame, user, allInterestsComplete } = useGame();

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/');
    }
  }, [user, isInitialized, router]);

  useEffect(() => {
    if (isInitialized && user && interests.length === 0) {
      router.push('/quiz');
    }
  }, [isInitialized, user, interests, router]);

  if (!isInitialized || (isInitialized && !user) || (user && interests.length === 0)) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <LoaderCircle className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  const handleSelectNewInterests = () => {
    // Reset interests, which will allow selecting a new one.
    // This flow will now be handled by confirm-interests page
    router.push('/confirm-interests?update=true');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
                <h1 className="text-3xl sm:text-4xl font-bold font-headline text-foreground">Your Learning Dashboard</h1>
                <p className="text-muted-foreground mt-2">Select an interest to start learning and earning credits!</p>
            </div>
            <div className="flex gap-2 mt-4 sm:mt-0">
                <Button variant="outline" onClick={resetGame}>
                    Start Over
                </Button>
                 <Button onClick={handleSelectNewInterests} disabled={!allInterestsComplete}>
                    Select New Interests
                </Button>
            </div>
        </div>
        
        {allInterestsComplete && (
            <Alert className="mb-8 border-green-500 bg-green-500/10 text-green-500">
                <PartyPopper className="h-4 w-4" />
                <AlertTitle className="font-bold">Congratulations!</AlertTitle>
                <AlertDescription>
                    You've mastered all your selected interests. You can now select a new one to continue your journey!
                </AlertDescription>
            </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {interests.map(key => {
            const interest = INTERESTS[key];
            if (!interest) return null;
            const interestProgress = progress[key];
            const totalStages = learningContent[key]?.length || 0;
            const completedStages = interestProgress ? (interestProgress.unlockedStage || 1) - 1 : 0;
            const progressPercentage = totalStages > 0 ? (completedStages / totalStages) * 100 : 0;
            const isCompleted = totalStages > 0 && completedStages >= totalStages;

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
