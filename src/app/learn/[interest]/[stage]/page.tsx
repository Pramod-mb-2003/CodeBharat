'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { Header } from '@/components/common/Header';
import { learningContent } from '@/lib/learning-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Check, LoaderCircle, X } from 'lucide-react';
import Confetti from 'react-dom-confetti';
import { ALL_GOODIES } from '@/lib/goodies-data';

export default function StagePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { credits, addCredits, loseHeart, completeStage, progress, isInitialized, user } = useGame();

  const interestKey = Array.isArray(params.interest) ? params.interest[0] : params.interest;
  const stageId = parseInt(Array.isArray(params.stage) ? params.stage[0] : params.stage, 10);

  const stage = learningContent[interestKey]?.find(s => s.id === stageId);

  const [view, setView] = useState<'video' | 'quiz'>('video');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submittedAnswer, setSubmittedAnswer] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const previousCreditsRef = useRef(credits);

  useEffect(() => {
    previousCreditsRef.current = credits;
  }, [credits]);


  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/');
    }
  }, [user, isInitialized, router]);

  useEffect(() => {
    if (!isInitialized) return;

    const interestProgress = progress[interestKey];
    if (!interestProgress) {
        if(isInitialized) router.push('/dashboard');
        return;
    };

    const unlockedStage = interestProgress.unlockedStage || 1;
    const currentHearts = interestProgress.hearts ?? 3;

    if (currentHearts <= 0) {
      toast({ title: "No Hearts Left!", description: "Wait for a heart to regenerate before continuing.", variant: 'destructive' });
      router.push(`/learn/${interestKey}`);
      return;
    }
    
    if (stageId > unlockedStage) {
      toast({ title: "Stage Locked!", description: "Complete previous stages to unlock this one.", variant: 'destructive' });
      router.push(`/learn/${interestKey}`);
    }
  }, [interestKey, stageId, progress, router, toast, isInitialized]);

  if (!isInitialized || !user) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center">
            <LoaderCircle className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  if (!stage) {
    return <div>Stage not found.</div>;
  }

  const isCorrect = submittedAnswer === stage.correctAnswerIndex;

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    setSubmittedAnswer(selectedAnswer);

    if (selectedAnswer === stage.correctAnswerIndex) {
      const previousCredits = previousCreditsRef.current;
      const newCredits = previousCredits + 10;
      
      const unlockedGoodie = ALL_GOODIES.find(goodie => 
          previousCredits < goodie.id && newCredits >= goodie.id && (goodie.type === 'badge' || goodie.type === 'trophy')
      );

      let toastDescription = "+10 Credits! Well done.";
      if (unlockedGoodie) {
        toastDescription = `+10 Credits and you unlocked the ${unlockedGoodie.name}!`;
        setShowConfetti(true);
      }


      toast({
        title: "Correct!",
        description: toastDescription,
        className: 'bg-green-500 text-white'
      });
      
      addCredits(10);
      completeStage(interestKey, stageId);
      setTimeout(() => router.push(`/learn/${interestKey}`), 2000);
    } else {
      toast({
        title: "Not quite...",
        description: "You lost a heart. Watch the video again and give it another try!",
        variant: 'destructive',
      });
      loseHeart(interestKey);
       setTimeout(() => {
        // Reset state for re-attempt
        setView('video');
        setSelectedAnswer(null);
        setSubmittedAnswer(null);
      }, 2000);
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header interest={interestKey} />
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Confetti active={showConfetti} config={{
          spread: 90,
          startVelocity: 40,
          elementCount: 100,
          decay: 0.9,
        }}/>
      </div>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center" style={{minHeight: 'calc(100vh - 64px)'}}>
        <Card className="w-full max-w-3xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-bold font-headline">
              {interestKey.charAt(0).toUpperCase() + interestKey.slice(1)} - Stage {stage.id}: {stage.title}
            </CardTitle>
            <CardDescription>
                {view === 'video' ? "Watch the video carefully to answer the question." : "Select the correct answer based on the video."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {view === 'video' ? (
              <div className="space-y-4">
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                   <video key={stage.videoUrl} controls autoPlay className="w-full h-full">
                    <source src={stage.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                <Button onClick={() => setView('quiz')} className="w-full" size="lg">I'm ready for the question!</Button>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-xl font-semibold">{stage.question}</p>
                <RadioGroup
                  value={selectedAnswer?.toString()}
                  onValueChange={(val) => setSelectedAnswer(parseInt(val))}
                  disabled={submittedAnswer !== null}
                  className="space-y-3"
                >
                  {stage.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isSubmitted = submittedAnswer !== null;
                    const isTheCorrectAnswer = index === stage.correctAnswerIndex;

                    return (
                        <Label key={index} htmlFor={`option-${index}`}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all",
                                isSubmitted && isTheCorrectAnswer && "border-green-500 bg-green-500/10",
                                isSubmitted && isSelected && !isTheCorrectAnswer && "border-red-500 bg-red-500/10",
                                !isSubmitted && isSelected && "border-primary bg-primary/10",
                                !isSubmitted && "hover:border-primary/50"
                            )}>
                            <div className="flex items-center gap-3">
                                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                                <span>{option}</span>
                            </div>
                             {isSubmitted && isSelected && isCorrect && <Check className="h-6 w-6 text-green-500" />}
                             {isSubmitted && isSelected && !isCorrect && <X className="h-6 w-6 text-red-500" />}
                             {isSubmitted && !isSelected && isTheCorrectAnswer && <Check className="h-6 w-6 text-green-500" />}
                        </Label>
                    )
                  })}
                </RadioGroup>
                <Button onClick={handleSubmit} disabled={selectedAnswer === null || submittedAnswer !== null} className="w-full" size="lg">
                  Submit Answer
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
