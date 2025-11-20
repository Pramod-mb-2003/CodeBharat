'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { submitQuiz } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { LoaderCircle, Rocket } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { ALL_INTEREST_KEYS, INTERESTS } from '@/lib/constants';

export type DynamicQuizQuestion = {
  q: string;
  options: string[];
};

export default function QuizPage() {
  const [questions, setQuestions] = useState<DynamicQuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user, isInitialized } = useGame();

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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ standard: 8 }), // Using a default standard
        });
        if (!response.ok) {
            throw new Error('Failed to fetch questions');
        }
        const data = await response.json();
        if (data.questions && data.questions.length > 0) {
            setQuestions(data.questions);
        }
      } catch (error) {
        console.error("Error fetching quiz questions:", error);
        // Fallback or error handling
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);


  const handleAnswerSelect = (questionId: string, category: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: category }));
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
    const formData = new FormData(event.currentTarget);
    await submitQuiz(formData);
    // The server action will handle the redirect.
    setTimeout(() => setIsSubmitting(false), 5000); 
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
  const questionId = `q${currentQuestionIndex}`;
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
              <div key={questionId} className="space-y-4">
                <p className="text-lg font-semibold text-center">{currentQuestionIndex + 1}. {currentQuestion.q}</p>
                <RadioGroup
                  name={questionId}
                  value={answers[questionId] || ''}
                  onValueChange={(value) => handleAnswerSelect(questionId, value)}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  required
                >
                  {currentQuestion.options.map((optionText, index) => {
                    // Assign category based on index, cycling through ALL_INTEREST_KEYS
                    const category = ALL_INTEREST_KEYS[index % ALL_INTEREST_KEYS.length];
                    return (
                        <Label
                        key={category}
                        htmlFor={`${questionId}-${category}`}
                        className={`flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                            answers[questionId] === category
                            ? 'border-primary bg-primary/10 shadow-md'
                            : 'border-border hover:border-primary/50'
                        }`}
                        >
                        <RadioGroupItem value={category} id={`${questionId}-${category}`} />
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
              <Button type="button" onClick={handleNext} disabled={!answers[questionId]}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting || !answers[questionId]}>
                {isSubmitting ? 'Analyzing...' : 'Finish & See Results'}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
