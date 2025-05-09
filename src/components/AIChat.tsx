import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot } from 'lucide-react';
import { StudyData, ScheduleData } from '../types';
import { getAIResponse, generateStudySchedule } from '../services/ai';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AIChatProps {
  studyData: StudyData;
  scheduleData: ScheduleData;
}

export function AIChat({ studyData, scheduleData }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `こんにちは、${studyData.name}さん！私はあなたの学習アシスタントです。テスト結果を分析し、個別の学習プランを作成しました。スケジュールや学習戦略について、また計画の調整が必要な場合は、お気軽にご質問ください。`,
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      // Check if the message is requesting a schedule regeneration
      if (inputMessage.includes('スケジュール') && 
          (inputMessage.includes('再生成') || inputMessage.includes('作り直し'))) {
        const newSchedule = await generateStudySchedule(studyData);
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'はい、新しいスケジュールを生成しました。スケジュールタブで確認できます。',
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        return;
      }

      // Get AI response for other messages
      const response = await getAIResponse(inputMessage, studyData, scheduleData);
      
      // Add AI message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '申し訳ありません。エラーが発生しました。後でもう一度お試しください。',
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      hour: 'numeric',
      minute: 'numeric',
    }).format(timestamp);
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="text-xl font-bold text-gray-800">Study Next AI</h2>
          <p className="text-sm text-gray-600">学習スケジュールについて質問したり、アドバイスを求めたりできます</p>
        </div>
        
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                <div className="flex items-center mb-1">
                  {message.sender === 'ai' && (
                    <Bot size={16} className="mr-1.5 text-blue-600" />
                  )}
                  {message.sender === 'user' && (
                    <User size={16} className="mr-1.5 text-white" />
                  )}
                  <span className={`text-xs ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.sender === 'user' ? 'あなた' : 'AI'} • {formatTimestamp(message.timestamp)}
                  </span>
                </div>
                <div className="whitespace-pre-wrap">{message.text}</div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none max-w-[80%] p-3">
                <div className="flex items-center">
                  <Bot size={16} className="mr-1.5 text-blue-600" />
                  <span className="text-xs text-gray-500">
                    AIが返信を作成中...
                  </span>
                </div>
                <div className="flex space-x-1 mt-2">
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 border-t bg-gray-50">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder="学習プランについて質問してください..."
              className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className={`p-2 rounded-lg ${
                !inputMessage.trim() || isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}