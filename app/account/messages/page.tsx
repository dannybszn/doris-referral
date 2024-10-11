'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MessageList from '@/components/MessageList';
import MessageContainer from '@/components/MessageContainer';
import CreateConversationButton from '@/components/CreateConversationButton';
import { useMockAuth } from '@/lib/mockAuthContext';
import { mockConversations, mockMessages } from '@/lib/mockData';

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const router = useRouter();
  const { user, getToken } = useMockAuth();

  useEffect(() => {
    if (!user) {
      router.push('/account/login');
      return;
    }

    setConversations(mockConversations);
  }, [user, router]);

  useEffect(() => {
    if (selectedConversation) {
      setMessages(mockMessages.filter(msg => 
        msg.sender === selectedConversation || msg.recipient === selectedConversation
      ));
    }
  }, [selectedConversation]);

  const handleSendMessage = async (message: string) => {
    if (!selectedConversation) return;

    const newMessage = {
      _id: (messages.length + 1).toString(),
      sender: 'currentUser',
      recipient: selectedConversation,
      content: message,
      timestamp: new Date().toISOString(),
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
  };

  const handleCreateConversation = (recipientId: string) => {
    setSelectedConversation(recipientId);
  };

  const getConversationPartner = () => {
    if (!selectedConversation) return null;
    const partner = conversations.find(conv => conv._id === selectedConversation);
    return partner ? {
      name: partner.firstName ? `${partner.firstName} ${partner.lastName}` : partner.companyName,
      role: partner.role,
      avatar: partner.avatar
    } : null;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-4rem)]">
      <h1 className="text-3xl font-bold mb-4">Messages</h1>
      <div className="flex h-[calc(100%-3rem)] bg-background border border-border rounded-lg overflow-hidden">
        <div className="w-1/3 border-r border-border flex flex-col">
          <div className="p-4">
            <CreateConversationButton 
              onCreateConversation={handleCreateConversation} 
              userRole={user.role as 'model' | 'agency' | 'admin'}
            />
          </div>
          <div className="flex-grow overflow-y-auto">
            <MessageList
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
            />
          </div>
        </div>
        <div className="w-2/3">
          {selectedConversation ? (
            <MessageContainer
              messages={messages}
              currentUserId="currentUser"
              onSendMessage={handleSendMessage}
              conversationPartner={getConversationPartner()!}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}