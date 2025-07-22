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
  return { prompt: "Pregunta lo que tú quieras sobre deportes, no te olvides de seleccionar el tópico correspondiente" };
}
