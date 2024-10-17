'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MessageList from '@/components/MessageList';
import MessageContainer from '@/components/MessageContainer';
import CreateConversationButton from '@/components/CreateConversationButton';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import { Inbox, MessageSquarePlus } from 'lucide-react';

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();
  const { isAuthenticated, userRole } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/account/login');
      return;
    }

    fetchUser();
    fetchConversations();
    setupSSE();
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);


  const setupSSE = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const eventSource = new EventSource(`/api/messages/sse?token=${token}`);

    eventSource.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      updateConversationWithNewMessage(newMessage);
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  };

  const updateConversationWithNewMessage = (newMessage: any) => {
    setConversations((prevConversations) => {
      return prevConversations.map((conv) => {
        if (conv._id === newMessage.conversation) {
          return {
            ...conv,
            lastMessage: {
              content: newMessage.content,
              timestamp: newMessage.timestamp,
            },
          };
        }
        return conv;
      });
    });
  };

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
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

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
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
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/messages/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        setHasMore(data.length === 20); // Assuming we fetch 20 messages at a time
      } else {
        console.error('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
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
        updateConversationWithNewMessage(newMessage);
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
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
        setConversations(prev => [newConversation, ...prev]);
        setSelectedConversation(newConversation._id);
      } else {
        console.error('Failed to fetch new conversation');
      }
    } catch (error) {
      console.error('Error fetching new conversation:', error);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setConversations(prevConversations => 
          prevConversations.filter(conv => conv._id !== conversationId)
        );
        setSelectedConversation(null);
      } else {
        console.error('Failed to delete conversation');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const loadMoreMessages = useCallback(() => {
    if (selectedConversation && hasMore) {
      // Implement pagination logic here
      // For example, fetch the next 20 messages
      // Update the messages state and hasMore state
    }
  }, [selectedConversation, hasMore]);

  if (!user) {
    return null;
  }

  const renderNoConversationsMessage = () => {
    if (userRole === 'model') {
      return (
        <Card className="m-4">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Inbox className="h-12 w-12 text-primary" />
              <h3 className="text-lg font-semibold">No conversations yet</h3>
              <p className="text-muted-foreground">
                As a model, you can't initiate conversations. When agencies contact you, their messages will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    } else {
      return (
        <Card className="m-4">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <MessageSquarePlus className="h-12 w-12 text-primary" />
              <h3 className="text-lg font-semibold">Start a new conversation</h3>
              <p className="text-muted-foreground">
                You don't have any conversations yet. Click the 'Create New Conversation' button above to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-4rem)]">
      <h1 className="text-3xl font-bold mb-4">Messages</h1>
      <div className="flex h-[calc(100%-3rem)] bg-background border border-border rounded-lg overflow-hidden">
        <div className="w-1/3 border-r border-border flex flex-col">
          {userRole !== 'model' && (
            <div className="p-4">
              <CreateConversationButton 
                onCreateConversation={createNewConversation} 
                userRole={userRole as 'model' | 'agency' | 'admin'}
                existingConversations={conversations}
              />
            </div>
          )}
          <div className="flex-grow overflow-y-auto">
            {conversations.length === 0 ? (
              renderNoConversationsMessage()
            ) : (
              <MessageList
                conversations={conversations}
                selectedConversation={selectedConversation}
                onSelectConversation={setSelectedConversation}
                loading={loading}
                currentUserId={user?._id}
              />
            )}
          </div>
        </div>
        <div className="w-2/3">
          {selectedConversation ? (
            <MessageContainer
              conversation={conversations.find(conv => conv._id === selectedConversation)}
              currentUserId={user?._id}
              onSendMessage={handleSendMessage}
              userRole={userRole as string}
              onDeleteConversation={handleDeleteConversation}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground text-center max-w-md">
                {userRole === 'model' 
                  ? "When you receive messages from agencies, you can view and respond to them here."
                  : "Select a conversation to start messaging or create a new one."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}