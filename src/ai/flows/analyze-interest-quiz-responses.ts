'use server';

/**
 * @fileOverview Analyzes user quiz responses to identify top interests.
 *
 * - analyzeInterestQuizResponses - A function that analyzes quiz responses and returns top interests.
 * - AnalyzeInterestQuizResponsesInput - The input type for the analyzeInterestQuizResponses function.
 * - AnalyzeInterestQuizResponsesOutput - The return type for the analyzeInterestQuizResponses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeInterestQuizResponsesInputSchema = z.object({
  quizResponses: z
    .string()
    .describe(
      'A string containing the user quiz responses to analyze for identifying interests.'
    ),
});
export type AnalyzeInterestQuizResponsesInput = z.infer<
  typeof AnalyzeInterestQuizResponsesInputSchema
>;

const AnalyzeInterestQuizResponsesOutputSchema = z.object({
  topInterests: z
    .array(z.string())
    .describe(
      'An array containing the top 2-3 identified interests based on the quiz responses.'
    ),
});
export type AnalyzeInterestQuizResponsesOutput = z.infer<
  typeof AnalyzeInterestQuizResponsesOutputSchema
>;

export async function analyzeInterestQuizResponses(
  input: AnalyzeInterestQuizResponsesInput
): Promise<AnalyzeInterestQuizResponsesOutput> {
  return analyzeInterestQuizResponsesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeInterestQuizResponsesPrompt',
  input: {schema: AnalyzeInterestQuizResponsesInputSchema},
  output: {schema: AnalyzeInterestQuizResponsesOutputSchema},
  prompt: `You are an expert in analyzing user responses to identify their top interests among the following categories: sports, science, english, creativity, social studies, and math. Based on the user's quiz responses, accurately determine and return the top 2-3 interests.

Quiz Responses: {{{quizResponses}}}

Return the top interests in an array. If the responses are ambiguous, return an empty array.
Example: ["sports", "science"]`,
});

const analyzeInterestQuizResponsesFlow = ai.defineFlow(
  {
    name: 'analyzeInterestQuizResponsesFlow',
    inputSchema: AnalyzeInterestQuizResponsesInputSchema,
    outputSchema: AnalyzeInterestQuizResponsesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
