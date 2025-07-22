'use server';

/**
 * @fileOverview Provides an initial prompt for new users to start a conversation with the chatbot.
 *
 * - getInitialPrompt - A function that returns the initial prompt.
 * - InitialPromptOutput - The return type for the getInitialPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InitialPromptOutputSchema = z.object({
  prompt: z.string().describe('An initial prompt or suggestion for the user.'),
});
export type InitialPromptOutput = z.infer<typeof InitialPromptOutputSchema>;

export async function getInitialPrompt(): Promise<InitialPromptOutput> {
  return initialPromptFlow();
}

const prompt = ai.definePrompt({
  name: 'initialPromptPrompt',
  output: {schema: InitialPromptOutputSchema},
  prompt: `Sugiere un mensaje para que un usuario comience una conversación con este chatbot. Hazlo atractivo e informativo sobre las capacidades del chatbot. El chatbot es una IA conversacional de propósito general. Sugiere algo creativo y limítalo a 20 palabras. Toda la salida debe estar en el campo 'prompt'. La respuesta debe estar en español.`, config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const initialPromptFlow = ai.defineFlow(
  {
    name: 'initialPromptFlow',
    outputSchema: InitialPromptOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output!;
  }
);
