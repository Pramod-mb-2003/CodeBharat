'use server';
import { analyzeInterestQuizResponses } from '@/ai/flows/analyze-interest-quiz-responses';
import { redirect } from 'next/navigation';

export async function submitQuiz(formData: FormData) {
  let quizResponsesText = 'User responses:\n';

  // Iterate over form entries
  for (const [questionId, answerCategory] of formData.entries()) {
    // Assuming questionId is like "q0", "q1", etc. and answerCategory is the interest key
    if (typeof answerCategory === 'string' && answerCategory) {
       quizResponsesText += `- For question ${parseInt(questionId.substring(1)) + 1}, user chose an option related to ${answerCategory}.\n`;
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
