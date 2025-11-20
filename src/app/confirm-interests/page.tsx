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
import { useGame } from '@/context/GameContext';


function ConfirmInterestsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const { user, isInitialized, initializeInterests, interests: existingInterests, allInterestsComplete, updateInterests } = useGame();

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/');
    }
  }, [user, isInitialized, router]);

  useEffect(() => {
    if (!isInitialized) return;
    
    const updateParam = searchParams.get('update');
    const isUpdating = updateParam === 'true';
    setIsUpdateMode(isUpdating);

    if (isUpdating) {
        if (!allInterestsComplete) {
             toast({
                title: "Not so fast!",
                description: "You must complete all your current interests before choosing new ones.",
                variant: "destructive",
            });
            router.push('/dashboard');
            return;
        }
        setSelectedInterests(existingInterests);
    } else {
        if (existingInterests.length > 0 && !searchParams.get('interests')) {
          router.push('/dashboard');
          return;
        }
        const interestsParam = searchParams.get('interests');
        if (interestsParam) {
          const initialInterests = interestsParam.split(',').filter(i => i && ALL_INTEREST_KEYS.includes(i));
          setSelectedInterests(initialInterests.slice(0, 3));
        }
    }
    setIsReady(true);
  }, [searchParams, existingInterests, router, isInitialized, allInterestsComplete, toast]);

  const toggleInterest = (interestKey: string) => {
    if(isUpdateMode && existingInterests.includes(interestKey)){
        toast({
            title: "Already Mastered!",
            description: "You cannot unselect an interest you have already completed.",
            variant: "destructive",
        });
        return;
    }

    setSelectedInterests(prev => {
      if (prev.includes(interestKey)) {
        return prev.filter(i => i !== interestKey);
      }
      
      const selectionLimit = isUpdateMode ? existingInterests.length + 1 : 3;

      if (prev.length < selectionLimit) {
        return [...prev, interestKey];
      }
      
      toast({
        title: "Selection Limit Reached",
        description: isUpdateMode ? `You can only add one new interest at a time.` : "You can select a maximum of 3 interests.",
        variant: "destructive",
      });
      return prev;
    });
  };

  const handleConfirm = async () => {
    if (isUpdateMode) {
      const newInterest = selectedInterests.find(i => !existingInterests.includes(i));
      if (!newInterest) {
        toast({
            title: "No New Interest Selected",
            description: "Please select one new interest to add.",
            variant: "destructive",
        });
        return;
      }
      await updateInterests(newInterest);
    } else {
      if (selectedInterests.length < 2 || selectedInterests.length > 3) {
        toast({
          title: "Invalid Selection",
          description: "Please select 2 or 3 interests to continue.",
          variant: "destructive",
        });
        return;
      }
      await initializeInterests(selectedInterests);
    }
    router.push(`/dashboard`);
  };

  if (!isReady || !isInitialized) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center">
            <LoaderCircle className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  const getButtonText = () => {
    if (isUpdateMode) return 'Add New Interest';
    return 'Confirm & Start Learning';
  }

  const getCardDescription = () => {
    if (isUpdateMode) return 'You have mastered your previous interests! Select one new interest to continue your learning journey.';
    return "Based on your quiz, we think you'll love these topics! Adjust your selection (2 or 3) and let's get started.";
  }

  const getAlertDescription = () => {
      if(isUpdateMode) return "Select one new interest to add to your dashboard.";
      return "Select 2 or 3 interests to build your personalized learning journey.";
  }
  
  const getDisabledState = () => {
    if(isUpdateMode) {
        return selectedInterests.length !== existingInterests.length + 1;
    }
    return selectedInterests.length < 2 || selectedInterests.length > 3;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-4xl shadow-2xl border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold font-headline">{isUpdateMode ? "Select Your Next Challenge" : "Confirm Your Interests"}</CardTitle>
          <CardDescription>
            {getCardDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {ALL_INTEREST_KEYS.map(key => {
              const interest = INTERESTS[key];
              const isSelected = selectedInterests.includes(key);
              const isCompleted = existingInterests.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleInterest(key)}
                  disabled={isCompleted && isUpdateMode}
                  className={cn(
                    'relative flex flex-col items-center justify-center p-6 rounded-lg border-2 text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                    isSelected && !isCompleted && 'border-primary bg-primary/10 shadow-lg',
                    isCompleted && 'border-green-500 bg-green-500/10 cursor-not-allowed opacity-70',
                    !isSelected && !isCompleted && 'border-border hover:border-primary/50 hover:bg-primary/5'
                  )}
                >
                  {(isSelected || isCompleted) && (
                    <CheckCircle className={cn("absolute top-2 right-2 h-6 w-6", isCompleted ? "text-green-500" : "text-primary")} />
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
                {getAlertDescription()}
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardContent className="text-center">
          <Button
            size="lg"
            onClick={handleConfirm}
            disabled={getDisabledState()}
          >
            {getButtonText()}
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
