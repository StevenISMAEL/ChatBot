"use client";

import { useState, useEffect, useRef } from 'react';
import { Bot, Send, User, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
        console.error("Failed to get initial prompt:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load initial prompt. Please refresh.",
        });
        setMessages([{ role: 'assistant', content: "Hello! How can I help you today?" }]);
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
          title: "Chat cleared",
          description: "The conversation has been reset.",
        })
      } catch (error) {
        setMessages([{ role: 'assistant', content: "Chat cleared. How can I help?" }]);
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
      });

      const assistantMessage: Message = { role: 'assistant', content: response.response };
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
      console.error("Failed to get response:", error);
      const errorMessage: Message = { role: 'assistant', content: "Sorry, I'm having a little trouble thinking right now. Could you try asking again?" };
      setMessages((prev) => [...prev, errorMessage]);
      toast({
        variant: "destructive",
        title: "API Error",
        description: "Failed to get a response from the AI.",
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
            <CardTitle className="text-2xl font-headline">ChattyMate</CardTitle>
            <CardDescription>Your friendly AI companion</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClearChat} aria-label="Clear chat" disabled={isLoading && messages.length > 1}>
             <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive" />
          </Button>
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
              placeholder="Type a message..."
              disabled={isLoading}
              className="flex-1 rounded-full focus-visible:ring-primary"
              aria-label="Chat input"
            />
            <Button type="submit" size="icon" className="rounded-full" disabled={isLoading || !input.trim()}>
              <Send className="h-5 w-5" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
