'use server';

import { analyzeInterestQuizResponses } from '@/ai/flows/analyze-interest-quiz-responses';
import { redirect } from 'next/navigation';

export async function submitQuiz(
  answers: {
    question: string;
    option: string;
  }[]
) {
  const result = await analyzeInterestQuizResponses({
    quizResponses: answers.map((a) => `${a.question} -> ${a.option}`),
  });

  const interestKeys = result
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

  redirect(`/confirm-interests?interests=${interestKeys}`);
}
