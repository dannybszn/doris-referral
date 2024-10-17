'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MessageList from '@/components/MessageList';
import MessageContainer from '@/components/MessageContainer';
import CreateConversationButton from '@/components/CreateConversationButton';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
}).then(res => res.json());

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const { data: conversations, error: conversationsError, mutate: mutateConversations } = useSWR('/api/conversations', fetcher);
  const { data: messages, error: messagesError, mutate: mutateMessages } = useSWR(
    selectedConversation ? `/api/messages/${selectedConversation}` : null,
    fetcher
  );

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/account/login');
      return;
    }

    fetchUser(token);
  }, [router]);

  const fetchUser = async (token: string) => {
    try {
      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      router.push('/account/login');
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedConversation) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conversationId: selectedConversation,
          content: message
        })
      });

      if (response.ok) {
        const newMessage = await response.json();
        mutateMessages(currentMessages => [...(currentMessages || []), newMessage], false);
        mutateConversations();
      } else {
        console.error('Failed to send message');
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const createNewConversation = async (conversationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const newConversation = await response.json();
        mutateConversations(currentConversations => [newConversation, ...(currentConversations || [])], false);
        setSelectedConversation(newConversation._id);
      } else {
        console.error('Failed to fetch new conversation');
      }
    } catch (error) {
      console.error('Error fetching new conversation:', error);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        mutateConversations(currentConversations => 
          (currentConversations || []).filter(conv => conv._id !== conversationId), 
        false);
        if (selectedConversation === conversationId) {
          setSelectedConversation(null);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete conversation');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      // You might want to show an error message to the user here
    }
  };

  const getConversationPartner = useCallback(() => {
    if (!selectedConversation || !conversations) return null;
    const conversation = conversations.find(conv => conv._id === selectedConversation);
    if (!conversation || !conversation.participants) return null;
    const partner = conversation.participants.find((p: any) => p._id !== user._id);
    if (!partner) return null;
    return {
      name: partner.firstName && partner.lastName
        ? `${partner.firstName} ${partner.lastName}`
        : partner.companyName || 'Unknown User',
      role: partner.role || 'User',
      avatar: partner.avatar || partner.image || ''
    };
  }, [selectedConversation, conversations, user]);

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
              onCreateConversation={createNewConversation} 
              userRole={user.role as 'model' | 'agency' | 'admin'}
            />
          </div>
          <div className="flex-grow overflow-y-auto">
            <MessageList
              conversations={conversations || []}
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
              onDeleteConversation={deleteConversation}
              loading={!conversations && !conversationsError}
              currentUserId={user._id}
            />
          </div>
        </div>
        <div className="w-2/3">
          {selectedConversation ? (
            <MessageContainer
              messages={messages || []}
              currentUserId={user._id}
              onSendMessage={handleSendMessage}
              conversationPartner={getConversationPartner()!}
              onLoadMore={() => {}} // Implement pagination if needed
              hasMore={false} // Implement pagination if needed
              loading={!messages && !messagesError}
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