import React, { useRef, useEffect, useState } from 'react';
import useSWR from 'swr';
import MessageView from '@/components/MessageView';
import MessageInput from '@/components/MessageInput';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from "@/components/ui/alert";
import CustomAlertModal from '@/components/CustomAlertModal';

interface MessageContainerProps {
  conversation: any;
  currentUserId: string;
  onSendMessage: (message: string) => Promise<void>;
  userRole: string;
  onDeleteConversation: (conversationId: string) => Promise<void>;
}

const fetcher = (url: string) => fetch(url, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
}).then(res => {
  if (!res.ok) throw new Error('An error occurred while fetching the data.');
  return res.json();
});

const MessageContainer: React.FC<MessageContainerProps> = ({
  conversation,
  currentUserId,
  onSendMessage,
  userRole,
  onDeleteConversation,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: messages, error: messagesError, mutate: mutateMessages } = useSWR(
    conversation ? `/api/messages/${conversation._id}` : null,
    fetcher
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (messagesError) setError('Failed to load messages.');
  }, [messagesError]);

  const handleSendMessage = async (message: string) => {
    try {
      await onSendMessage(message);
      mutateMessages();
      setError(null);
    } catch (error) {
      setError('Failed to send message. Please try again.');
    }
  };

  const handleDeleteConversation = async () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteConversation = async () => {
    try {
      await onDeleteConversation(conversation._id);
      setIsDeleteModalOpen(false);
      router.push('/account/messages');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      setError('Failed to delete conversation. Please try again.');
    }
  };

  if (!conversation) return <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const partner = conversation.participants ? conversation.participants.find((p: any) => p._id !== currentUserId) : null;

  const partnerName = partner
    ? (partner.firstName && partner.lastName 
        ? `${partner.firstName} ${partner.lastName}`
        : partner.companyName || 'Unknown User')
    : 'Unknown User';

  return (
    <div className="flex flex-col h-full">
      <div className="bg-card border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={partner?.avatar || ''} />
            <AvatarFallback>{partner?.firstName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">{partnerName}</h2>
            <p className="text-sm text-muted-foreground">{partner?.role || 'User'}</p>
          </div>
        </div>
        {(userRole === 'agency' || userRole === 'admin') && (
          <Button variant="ghost" size="icon" onClick={handleDeleteConversation}>
            <Trash2 className="h-5 w-5 text-destructive" />
          </Button>
        )}
      </div>
      {error && (
        <Alert variant="destructive" className="m-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div 
        className="flex-grow overflow-y-auto p-4"
        ref={messagesContainerRef}
      >
        <MessageView messages={messages} currentUserId={currentUserId} />
        <div ref={messagesEndRef} />
      </div>
      <div className="bg-card border-t border-border mt-auto">
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
      <CustomAlertModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteConversation}
        title="Delete Conversation"
        description="Are you sure you want to delete this conversation? This action cannot be undone."
      />
    </div>
  );
};

export default MessageContainer;