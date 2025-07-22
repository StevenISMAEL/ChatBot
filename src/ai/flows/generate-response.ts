'use server';
/**
 * @fileOverview A chatbot AI agent that generates coherent and contextually relevant responses based on user input.
 *
 * - generateChatbotResponse - A function that generates chatbot responses.
 * - GenerateChatbotResponseInput - The input type for the generateChatbotResponse function.
 * - GenerateChatbotResponseOutput - The return type for the generateChatbotResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateChatbotResponseInputSchema = z.object({
  message: z.string().describe('The user message to respond to.'),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('The chat history to maintain context.'),
});

export type GenerateChatbotResponseInput = z.infer<typeof GenerateChatbotResponseInputSchema>;

const GenerateChatbotResponseOutputSchema = z.object({
  response: z.string().describe('The chatbot response.'),
});

export type GenerateChatbotResponseOutput = z.infer<typeof GenerateChatbotResponseOutputSchema>;

export async function generateChatbotResponse(input: GenerateChatbotResponseInput): Promise<GenerateChatbotResponseOutput> {
  return generateChatbotResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateChatbotResponsePrompt',
  input: {schema: GenerateChatbotResponseInputSchema},
  output: {schema: GenerateChatbotResponseOutputSchema},
  prompt: `Eres un chatbot amigable y servicial. Responde al mensaje del usuario basándote en el historial de chat para mantener el contexto. Sé conciso. Responde en español.

Historial de chat:
{{#each chatHistory}}
{{this.role}}: {{this.content}}
{{/each}}

Mensaje del usuario: {{message}}`,
});

const generateChatbotResponseFlow = ai.defineFlow(
  {
    name: 'generateChatbotResponseFlow',
    inputSchema: GenerateChatbotResponseInputSchema,
    outputSchema: GenerateChatbotResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
