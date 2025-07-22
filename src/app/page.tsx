"use client";

import { useState, useEffect, useRef } from 'react';
import { Bot, Send, User, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateChatbotResponse } from '@/ai/flows/generate-response';
import { getInitialPrompt } from '@/ai/flows/initial-prompt';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState('atletismo');
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    const fetchInitialPrompt = async () => {
      try {
        const initial = await getInitialPrompt();
        setMessages([{ role: 'assistant', content: initial.prompt }]);
      } catch (error) {
        console.error("No se pudo obtener el mensaje inicial:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar el mensaje inicial. Por favor, actualiza.",
        });
        setMessages([{ role: 'assistant', content: "¡Hola! Soy tu experto en entrenamiento deportivo. ¿En qué puedo ayudarte hoy?" }]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialPrompt();
  }, [toast]);

  const handleClearChat = () => {
    setIsLoading(true);
    const fetchInitialPrompt = async () => {
      try {
        const initial = await getInitialPrompt();
        setMessages([{ role: 'assistant', content: initial.prompt }]);
        toast({
          title: "Chat borrado",
          description: "La conversación ha sido reiniciada.",
        })
      } catch (error) {
        setMessages([{ role: 'assistant', content: "Chat borrado. ¿Cómo puedo ayudar?" }]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialPrompt();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const chatHistoryForAI: Array<{role: 'user' | 'assistant', content: string}> = currentMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await generateChatbotResponse({
        message: currentInput,
        chatHistory: chatHistoryForAI,
        sport: selectedSport,
      });

      const assistantMessage: Message = { role: 'assistant', content: response.response };
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
      console.error("No se pudo obtener respuesta:", error);
      const errorMessage: Message = { role: 'assistant', content: "Lo siento, tengo problemas para pensar en este momento. ¿Podrías intentar preguntar de nuevo?" };
      setMessages((prev) => [...prev, errorMessage]);
      toast({
        variant: "destructive",
        title: "Error de API",
        description: "No se pudo obtener una respuesta de la IA.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 font-body">
      <Card className="w-full max-w-2xl h-[90vh] flex flex-col shadow-xl rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b p-4">
          <div>
            <CardTitle className="text-2xl font-headline">IniMeg</CardTitle>
            <CardDescription>Tu chatbot para deportistas</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedSport} onValueChange={setSelectedSport} disabled={isLoading}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecciona un deporte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="atletismo">Atletismo</SelectItem>
                <SelectItem value="culturismo">Culturismo</SelectItem>
                <SelectItem value="natacion">Natación</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={handleClearChat} aria-label="Limpiar chat" disabled={isLoading && messages.length > 1}>
              <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-0">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-end gap-3 animate-in fade-in-0 zoom-in-95",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-9 w-9 border-2 border-primary/20 shrink-0">
                      <AvatarFallback className="bg-primary/10">
                        <Bot className="h-5 w-5 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-card border rounded-bl-none'
                    )}
                  >
                    <p className="leading-relaxed">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                     <Avatar className="h-9 w-9 border-2 border-accent/20 shrink-0">
                      <AvatarFallback className="bg-accent/10">
                        <User className="h-5 w-5 text-accent-foreground" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-end gap-3 justify-start animate-in fade-in-0 zoom-in-95">
                   <Avatar className="h-9 w-9 border-2 border-primary/20 shrink-0">
                      <AvatarFallback className="bg-primary/10">
                        <Bot className="h-5 w-5 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  <div className="max-w-[75%] rounded-2xl px-4 py-3 text-sm bg-card border rounded-bl-none flex items-center space-x-2">
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></span>
                  </div>
                </div>
              )}
               <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex w-full items-center gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe un mensaje..."
              disabled={isLoading}
              className="flex-1 rounded-full focus-visible:ring-primary"
              aria-label="Entrada de chat"
            />
            <Button type="submit" size="icon" className="rounded-full" disabled={isLoading || !input.trim()}>
              <Send className="h-5 w-5" />
              <span className="sr-only">Enviar mensaje</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
