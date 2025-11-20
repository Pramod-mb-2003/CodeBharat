'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const QuizQuestionSchema = z.object({
  questionText: z.string().describe('The text of the multiple-choice question.'),
  options: z.array(z.string()).length(6).describe('An array of exactly 6 possible answers for the question.'),
});

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

const QuizOutputSchema = z.object({
  questions: z.array(QuizQuestionSchema).length(8).describe('An array of exactly 8 quiz questions.'),
});

const QuizInputSchema = z.object({
  studentStandard: z.string().describe('The academic grade or standard of the student, e.g., "8th".'),
});

export async function getQuizQuestions(input: z.infer<typeof QuizInputSchema>): Promise<z.infer<typeof QuizOutputSchema>> {
  
  const getQuestionsFlow = ai.defineFlow(
    {
      name: 'getQuestionsFlow',
      inputSchema: QuizInputSchema,
      outputSchema: QuizOutputSchema,
    },
    async (input) => {
      const prompt = `
        Generate exactly 8 psychometric multiple-choice questions suitable for a student in Standard ${input.studentStandard}.
        Each question must have exactly 6 answer options.
        The questions should be designed to subtly detect a student's interest across the following six categories: Sports, Science, Mathematics, English, Social Science, and Art & Craft.
        The options for each question should correspond to these six categories, but not in a predictable order.
      `;

      const llmResponse = await ai.generate({
        prompt: prompt,
        model: 'googleai/gemini-2.5-flash',
        output: {
          format: 'json',
          schema: QuizOutputSchema,
        },
        config: {
          temperature: 0.2,
        },
      });

      const output = llmResponse.output();
      if (!output) {
        throw new Error('Failed to generate questions from the model.');
      }
      return output;
    }
  );

  return await getQuestionsFlow(input);
}
