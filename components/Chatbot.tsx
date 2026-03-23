import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { getChatResponse } from '../services/geminiService';

const Chatbot: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: 'أهلاً بك! كيف يمكنني مساعدتك اليوم بخصوص مؤشرات التنمية في الأردن؟' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const { text, sources } = await getChatResponse(input);
            const modelMessage: ChatMessage = { role: 'model', text, sources };
            setMessages(prev => [...prev, modelMessage]);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-xl shadow-2xl">
            <header className="p-4 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-900">المساعد الذكي</h1>
                <p className="text-sm text-gray-700">مدعوم بواسطة Gemini والبحث من Google</p>
            </header>
            
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-slate-600 flex-shrink-0"></div>}
                        <div className={`max-w-lg p-4 rounded-xl ${msg.role === 'user' ? 'bg-amber-500 text-black rounded-bl-none' : 'bg-gray-200 text-black rounded-br-none'}`}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                            {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-gray-300">
                                    <h4 className="text-xs font-semibold mb-2">المصادر:</h4>
                                    <ul className="space-y-1">
                                        {msg.sources.map((source, i) => (
                                            <li key={i}>
                                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline break-all">
                                                    {source.title || source.uri}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-600 flex-shrink-0"></div>
                        <div className="max-w-lg p-4 rounded-xl bg-gray-200 rounded-br-none">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse delay-75"></div>
                                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse delay-150"></div>
                            </div>
                        </div>
                    </div>
                )}
                 {error && (
                    <div className="flex justify-center">
                        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                            <strong>خطأ:</strong> {error}
                        </div>
                    </div>
                 )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="اسأل عن مؤشرات التنمية..."
                        className="w-full pr-4 pl-12 py-3 bg-gray-100 text-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="absolute inset-y-0 left-0 flex items-center justify-center w-12 h-full text-black bg-amber-500 rounded-full disabled:bg-gray-400 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Chatbot;