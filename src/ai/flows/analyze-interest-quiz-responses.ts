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
      'A comma-separated string of interest categories selected by the user in a quiz.'
    ),
});
export type AnalyzeInterestQuizResponsesInput = z.infer<
  typeof AnalyzeInterestQuizResponsesInputSchema
>;

const AnalyzeInterestQuizResponsesOutputSchema = z.object({
  topInterests: z
    .array(z.string())
    .describe(
      'An array containing the top 2-3 most frequent interests from the input string. The interests must be one of the following exact keys: "sports", "science", "english", "creativity", "social", "math".'
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
  prompt: `You are an expert at analyzing quiz data. Your task is to identify the top 2 or 3 most frequently occurring interests from a comma-separated list of user choices.

The possible interest categories are: "sports", "science", "english", "creativity", "social", "math".

Analyze the following user choices and determine which categories appear most often. Return the top 2 or 3 as an array of strings. The strings in the output array must be the exact keys from the list above.

User Choices: {{{quizResponses}}}

Example Input: "sports,math,sports,science,sports,math"
Example Output: { "topInterests": ["sports", "math"] }
`,
});

const analyzeInterestQuizResponsesFlow = ai.defineFlow(
  {
    name: 'analyzeInterestQuizResponsesFlow',
    inputSchema: AnalyzeInterestQuizResponsesInputSchema,
    outputSchema: AnalyzeInterestQuizResponsesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Ensure the output is always an array, even on failure
    if (!output || !Array.isArray(output.topInterests)) {
      return { topInterests: [] };
    }
    return output!;
  }
);
