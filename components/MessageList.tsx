import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Conversation {
  _id: string;
  participants: {
    _id: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    avatar?: string;
    role: string;
  }[];
  lastMessage?: {
    content: string;
    timestamp: string;
  };
}

interface MessageListProps {
  conversations: Conversation[] | undefined;
  selectedConversation: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  loading: boolean;
  currentUserId: string;
  currentUserRole: string;
}

const MessageList: React.FC<MessageListProps> = ({ 
  conversations, 
  selectedConversation, 
  onSelectConversation, 
  onDeleteConversation,
  loading, 
  currentUserId,
  currentUserRole
}) => {
  const getName = (conversation: Conversation) => {
    const partner = conversation.participants.find(p => p._id !== currentUserId);
    if (partner) {
      if (partner.firstName && partner.lastName) {
        return `${partner.firstName} ${partner.lastName}`;
      }
      return partner.companyName || 'Unknown User';
    }
    return 'Unknown User';
  };

  const getAvatar = (conversation: Conversation) => {
    const partner = conversation.participants.find(p => p._id !== currentUserId);
    return partner?.avatar;
  };

  const canDeleteConversation = currentUserRole === 'agency' || currentUserRole === 'admin';

  if (loading) {
    return <div className="p-4 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;
  }

  if (!conversations || conversations.length === 0) {
    return <div className="p-4 text-muted-foreground text-center">No conversations yet</div>;
  }

  return (
    <div>
      {conversations.map((conversation, index) => (
        <React.Fragment key={conversation._id}>
          <div
            className={`flex items-center p-4 cursor-pointer hover:bg-accent transition-colors duration-200 ${
              selectedConversation === conversation._id ? 'bg-accent' : ''
            }`}
          >
            <div className="flex-grow" onClick={() => onSelectConversation(conversation._id)}>
              <Avatar className="h-10 w-10 mr-3 flex-shrink-0">
                <AvatarImage src={getAvatar(conversation)} />
                <AvatarFallback>{getName(conversation).charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold truncate">{getName(conversation)}</h3>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {conversation.lastMessage ? conversation.lastMessage.content : 'No messages yet'}
                </p>
                {conversation.lastMessage && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(conversation.lastMessage.timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            {canDeleteConversation && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteConversation(conversation._id)}
                className="ml-2"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          {index < conversations.length - 1 && (
            <hr className="border-t border-gray-200 dark:border-gray-700" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default MessageList;