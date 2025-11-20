'use server';
import { analyzeInterestQuizResponses } from '@/ai/flows/analyze-interest-quiz-responses';
import { redirect } from 'next/navigation';

export async function submitQuiz(formData: FormData) {
  // Create a simple, comma-separated string of the chosen interest categories
  const selectedCategories = Array.from(formData.values());
  const quizResponsesText = selectedCategories.join(',');

  try {
    const result = await analyzeInterestQuizResponses({ quizResponses: quizResponsesText });
    const interests = result.topInterests.join(',');
    redirect(`/confirm-interests?interests=${interests}`);
  } catch (error) {
    console.error('Error analyzing quiz responses:', error);
    // Redirect to a generic confirmation page if AI fails, allowing manual selection
    redirect('/confirm-interests');
  }
}
