'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { INTERESTS, ALL_INTEREST_KEYS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { CheckCircle, Info, LoaderCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser } from '@/firebase/auth/use-user';
import { useGame } from '@/context/GameContext';


function ConfirmInterestsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);
  const { user, isInitializing } = useUser();
  const { initializeInterests, interests: existingInterests } = useGame();

  useEffect(() => {
    if (!isInitializing && !user) {
      router.push('/');
    }
  }, [user, isInitializing, router]);

  useEffect(() => {
    if (existingInterests.length > 0) {
      router.push('/dashboard');
      return;
    }
    const interestsParam = searchParams.get('interests');
    if (interestsParam) {
      const initialInterests = interestsParam.split(',').filter(i => ALL_INTEREST_KEYS.includes(i));
      setSelectedInterests(initialInterests.slice(0, 3));
    }
    setIsReady(true);
  }, [searchParams, existingInterests, router]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interest)) {
        return prev.filter(i => i !== interest);
      }
      if (prev.length < 3) {
        return [...prev, interest];
      }
      toast({
        title: "Selection Limit Reached",
        description: "You can select a maximum of 3 interests.",
        variant: "destructive",
      });
      return prev;
    });
  };

  const handleConfirm = async () => {
    if (selectedInterests.length < 2 || selectedInterests.length > 3) {
      toast({
        title: "Invalid Selection",
        description: "Please select 2 or 3 interests to continue.",
        variant: "destructive",
      });
      return;
    }
    await initializeInterests(selectedInterests);
    router.push(`/dashboard`);
  };

  if (!isReady || isInitializing) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center">
            <LoaderCircle className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-4xl shadow-2xl border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold font-headline">Confirm Your Interests</CardTitle>
          <CardDescription>
            Based on your quiz, we think you'll love these topics! Adjust your selection (2 or 3) and let's get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {ALL_INTEREST_KEYS.map(key => {
              const interest = INTERESTS[key];
              const isSelected = selectedInterests.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleInterest(key)}
                  className={cn(
                    'relative flex flex-col items-center justify-center p-6 rounded-lg border-2 text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-lg'
                      : 'border-border hover:border-primary/50 hover:bg-primary/5'
                  )}
                >
                  {isSelected && (
                    <CheckCircle className="absolute top-2 right-2 h-6 w-6 text-primary" />
                  )}
                  <interest.Icon className="w-12 h-12 mb-2 text-primary" />
                  <span className="font-semibold text-lg text-foreground">{interest.name}</span>
                </button>
              );
            })}
          </div>
          <Alert className="bg-accent/20 border-accent/50 text-accent-foreground">
            <Info className="h-4 w-4" />
            <AlertTitle>Almost there!</AlertTitle>
            <AlertDescription>
              Select 2 or 3 interests to build your personalized learning journey.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardContent className="text-center">
          <Button
            size="lg"
            onClick={handleConfirm}
            disabled={selectedInterests.length < 2 || selectedInterests.length > 3}
          >
            Confirm & Start Learning
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


export default function ConfirmInterestsPage() {
    return (
      <Suspense fallback={<div className="flex min-h-screen w-full items-center justify-center">
      <LoaderCircle className="h-16 w-16 animate-spin text-primary" />
  </div>}>
        <ConfirmInterestsContent />
      </Suspense>
    );
}
