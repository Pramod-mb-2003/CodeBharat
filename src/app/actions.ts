'use server';
import { analyzeInterestQuizResponses } from '@/ai/flows/analyze-interest-quiz-responses';
import { redirect } from 'next/navigation';
import { quizQuestions } from '@/lib/quiz-data';

export async function submitQuiz(formData: FormData) {
  const responses: { [key: string]: string } = {};
  let quizResponsesText = 'User responses:\n';

  for (const question of quizQuestions) {
    const answerCategory = formData.get(question.id) as string;
    if (answerCategory) {
      const selectedOption = question.options.find(opt => opt.category === answerCategory);
      quizResponsesText += `- For question "${question.question}", user chose an option related to ${answerCategory}.\n`;
    }
  }

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
