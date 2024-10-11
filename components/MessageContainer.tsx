import React, { useRef, useEffect } from 'react';
import MessageView from '@/components/MessageView';
import MessageInput from '@/components/MessageInput';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MessageContainerProps {
  messages: any[];
  currentUserId: string;
  onSendMessage: (message: string) => void;
  conversationPartner: {
    name: string;
    role: string;
    avatar?: string;
  };
}

const MessageContainer: React.FC<MessageContainerProps> = ({ messages, currentUserId, onSendMessage, conversationPartner }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="bg-card border-b border-border p-4 flex items-center">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={conversationPartner.avatar} />
          <AvatarFallback>{conversationPartner.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-semibold">{conversationPartner.name}</h2>
          <p className="text-sm text-muted-foreground">{conversationPartner.role}</p>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto p-4">
        <MessageView messages={messages} currentUserId={currentUserId} />
        <div ref={messagesEndRef} />
      </div>
      <div className="bg-card border-t border-border mt-auto">
        <MessageInput onSendMessage={onSendMessage} />
      </div>
    </div>
  );
};

export default MessageContainer;