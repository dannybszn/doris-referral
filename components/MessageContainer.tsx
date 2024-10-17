import React, { useRef, useEffect } from 'react';
import MessageView from '@/components/MessageView';
import MessageInput from '@/components/MessageInput';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface MessageContainerProps {
  messages: any[];
  currentUserId: string;
  onSendMessage: (message: string) => Promise<void>;
  conversationPartner: {
    name: string;
    role: string;
    avatar?: string;
  } | null;
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
}

const MessageContainer: React.FC<MessageContainerProps> = ({
  messages,
  currentUserId,
  onSendMessage,
  conversationPartner,
  onLoadMore,
  hasMore,
  loading
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (container && container.scrollTop === 0 && hasMore && !loading) {
      onLoadMore();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-card border-b border-border p-4 flex items-center">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={conversationPartner?.avatar || ''} />
          <AvatarFallback>{conversationPartner?.name.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-semibold">{conversationPartner?.name || 'Unknown User'}</h2>
          <p className="text-sm text-muted-foreground">{conversationPartner?.role || 'User'}</p>
        </div>
      </div>
      <div 
        className="flex-grow overflow-y-auto p-4"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {loading && (
          <div className="flex justify-center items-center h-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        {hasMore && !loading && (
          <Button onClick={onLoadMore} variant="ghost" className="w-full mb-4">
            Load More
          </Button>
        )}
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