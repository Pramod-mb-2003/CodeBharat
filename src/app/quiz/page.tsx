'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { LoaderCircle, Rocket } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { useToast } from '@/hooks/use-toast';

// Define the shape of a question based on the new API response
type QuizQuestion = {
  q: string;
  options: string[];
};


export default function QuizPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user, isInitialized } = useGame();
  const { toast } = useToast();

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/');
    }
  }, [user, isInitialized, router]);
  
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/get-questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ standard: '8' }),
        });
        if (!response.ok) {
            throw new Error('Failed to fetch questions');
        }
        const data = await response.json();
        if (data.questions && data.questions.length > 0) {
            setQuestions(data.questions);
        } else {
          throw new Error('No questions received from API');
        }
      } catch (error) {
        console.error("Error fetching quiz questions:", error);
        toast({
          title: "Error",
          description: "Could not load quiz questions. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if(isInitialized) {
      fetchQuestions();
    }
  }, [toast, isInitialized]);


  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers: Object.values(answers) }),
        });
        
        if (!response.ok) {
            throw new Error('Analysis request failed');
        }

        const result = await response.json();
        
        const interestKeys = result.predictedInterests
            .map((interestName: string) => {
              const lowerCaseName = interestName.toLowerCase();
              if (lowerCaseName.includes('art')) return 'creativity';
              if (lowerCaseName.includes('social')) return 'social';
              if (lowerCaseName.includes('math')) return 'math';
              if (lowerCaseName.includes('sports')) return 'sports';
              if (lowerCaseName.includes('science')) return 'science';
              if (lowerCaseName.includes('english')) return 'english';
              return null;
            })
            .filter(Boolean)
            .join(',');

        router.push(`/confirm-interests?interests=${interestKeys}`);

    } catch(error) {
        console.error("Error submitting quiz:", error);
        toast({
          title: "Analysis Failed",
          description: "We couldn't analyze your results. Please try again.",
          variant: "destructive"
        });
        setIsSubmitting(false);
    }
  };

  if (!isInitialized || isLoading) {
    return (
        <div className="flex flex-col gap-4 min-h-screen w-full items-center justify-center">
            <LoaderCircle className="h-16 w-16 animate-spin text-primary" />
            <p className="text-muted-foreground">Generating your quiz...</p>
        </div>
    );
  }

  if (questions.length === 0) {
     return (
        <div className="flex flex-col gap-4 min-h-screen w-full items-center justify-center">
            <p className="text-destructive">Could not load quiz questions. Please try again later.</p>
        </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-2xl shadow-2xl border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Rocket className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold font-headline">Interest Quiz</h1>
          </div>
          <CardDescription>Answer these questions to discover your top interests!</CardDescription>
          <Progress value={progressPercentage} className="w-full mt-4" />
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8">
              <div key={currentQuestionIndex} className="space-y-4">
                <p className="text-lg font-semibold text-center">{currentQuestionIndex + 1}. {currentQuestion.q}</p>
                <RadioGroup
                  value={answers[currentQuestionIndex]?.toString() || ''}
                  onValueChange={(value) => handleAnswerSelect(currentQuestionIndex, parseInt(value))}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  required
                >
                  {currentQuestion.options.map((optionText, index) => {
                    const optionId = `${currentQuestionIndex}-${index}`;
                    return (
                        <Label
                        key={optionId}
                        htmlFor={optionId}
                        className={`flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                            answers[currentQuestionIndex] === index
                            ? 'border-primary bg-primary/10 shadow-md'
                            : 'border-border hover:border-primary/50'
                        }`}
                        >
                        <RadioGroupItem value={index.toString()} id={optionId} />
                        <span>{optionText}</span>
                        </Label>
                    );
                  })}
                </RadioGroup>
              </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={handleBack} disabled={currentQuestionIndex === 0}>
              Back
            </Button>
            {currentQuestionIndex < questions.length - 1 ? (
              <Button type="button" onClick={handleNext} disabled={answers[currentQuestionIndex] === undefined}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting || Object.keys(answers).length < questions.length}>
                {isSubmitting ? 'Analyzing...' : 'Finish & See Results'}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
