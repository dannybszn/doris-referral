'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MessageList from '@/components/MessageList';
import MessageContainer from '@/components/MessageContainer';
import CreateConversationButton from '@/components/CreateConversationButton';

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/account/login');
      return;
    }

    fetchUser(token);
    fetchConversations(token);
  }, [router]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

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

  const fetchConversations = async (token: string) => {
    try {
      const response = await fetch('/api/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      } else {
        console.error('Failed to fetch conversations');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/messages/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        console.error('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
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
        setMessages(prevMessages => [...prevMessages, newMessage]);
        // Refresh conversations to update last message
        fetchConversations(token!);
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleCreateConversation = async (recipientId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipientId })
      });

      if (response.ok) {
        const newConversation = await response.json();
        setConversations(prev => [newConversation, ...prev]);
        setSelectedConversation(newConversation._id);
        fetchMessages(newConversation._id);
      } else {
        console.error('Failed to create new conversation');
      }
    } catch (error) {
      console.error('Error creating new conversation:', error);
    }
  };

  const getConversationPartner = () => {
    if (!selectedConversation) return null;
    const conversation = conversations.find(conv => conv._id === selectedConversation);
    if (!conversation) return null;
    const partner = conversation.participants.find((p: any) => p._id !== user._id);
    return partner ? {
      name: partner.name,
      role: partner.role,
      avatar: partner.avatar,
      image: partner.image
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
              currentUserId={user._id}
              onSendMessage={handleSendMessage}
              conversationPartner={getConversationPartner()}
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