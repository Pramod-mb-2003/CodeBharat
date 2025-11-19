'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitQuiz } from '@/app/actions';
import { quizQuestions, QuizQuestion } from '@/lib/quiz-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Rocket } from 'lucide-react';

export default function QuizPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleAnswerSelect = (questionId: string, category: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: category }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    await submitQuiz(formData);
    // The server action will handle the redirect, so we don't need to do anything here.
    // A timeout is added just in case redirect takes time, to keep the loading state.
    setTimeout(() => setIsSubmitting(false), 5000); 
  };
  
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
              <div key={currentQuestion.id} className="space-y-4">
                <p className="text-lg font-semibold text-center">{currentQuestionIndex + 1}. {currentQuestion.question}</p>
                <RadioGroup
                  name={currentQuestion.id}
                  value={answers[currentQuestion.id] || ''}
                  onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  required
                >
                  {currentQuestion.options.map(option => (
                    <Label
                      key={option.category}
                      htmlFor={`${currentQuestion.id}-${option.category}`}
                      className={`flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                        answers[currentQuestion.id] === option.category
                          ? 'border-primary bg-primary/10 shadow-md'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value={option.category} id={`${currentQuestion.id}-${option.category}`} />
                      <span>{option.text}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={handleBack} disabled={currentQuestionIndex === 0}>
              Back
            </Button>
            {currentQuestionIndex < quizQuestions.length - 1 ? (
              <Button type="button" onClick={handleNext} disabled={!answers[currentQuestion.id]}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting || !answers[currentQuestion.id]}>
                {isSubmitting ? 'Analyzing...' : 'Finish & See Results'}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
