'use server';
/**
 * @fileOverview A flow for analyzing a user's quiz responses to determine their top interests.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const InterestAnalysisInputSchema = z.object({
  quizResponses: z
    .array(z.string())
    .describe(
      'An array of strings, where each string represents a question and the user\'s chosen answer, e.g., "Question -> Answer"'
    ),
});

const InterestAnalysisOutputSchema = z
  .array(z.string())
  .describe(
    'An array of the top 2-3 predicted interest categories. The valid categories are: sports, science, math, english, social, creativity.'
  );

export async function analyzeInterestQuizResponses(
  input: z.infer<typeof InterestAnalysisInputSchema>
): Promise<z.infer<typeof InterestAnalysisOutputSchema>> {
  const prompt = `
    You are an expert at analyzing psychometric quiz results to determine a person's interests.
    Based on the following question and answer pairs, identify the top 2 or 3 interest categories for the user.

    The available interest categories are:
    - sports
    - science
    - math
    - english
    - social (for Social Studies, History, Geography)
    - creativity (for Art, Music, Craft)

    Analyze the user's choices and determine which categories they lean towards most.

    User's Answers:
    {{#each quizResponses}}
    - {{{this}}}
    {{/each}}

    Return ONLY a valid JSON array of the top 2 or 3 interest category keys (e.g., ["sports", "science"]).
    Do NOT return full names like "Social Studies". Use the keys provided above.
    Do not include any other text, markdown, or explanation.
  `;

  const llmResponse = await ai.generate({
    prompt: prompt,
    model: 'googleai/gemini-2.5-flash',
    input: input,
    output: {
      format: 'json',
      schema: InterestAnalysisOutputSchema,
    },
    config: {
      temperature: 0.1,
    },
  });

  return llmResponse.output() || [];
}
