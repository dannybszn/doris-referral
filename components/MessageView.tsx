import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, parseISO } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';

interface Message {
  _id: string;
  sender: {
    _id: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
  };
  content: string;
  timestamp: string;
  read: boolean;
}

interface MessageViewProps {
  messages: Message[] | undefined;
  currentUserId: string;
}

const MessageView: React.FC<MessageViewProps> = ({ messages, currentUserId }) => {
  if (!messages) {
    return <div className="text-muted-foreground">Loading messages...</div>;
  }

  const getAvatarFallback = (sender: Message['sender']) => {
    if (sender.firstName) {
      return sender.firstName.charAt(0);
    }
    if (sender.companyName) {
      return sender.companyName.charAt(0);
    }
    return 'U';
  };

  return (
    <div className="flex flex-col space-y-4">
      {messages.map((message) => {
        const isSentMessage = message.sender._id === currentUserId;
        return (
          <div
            key={message._id}
            className={`flex ${isSentMessage ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex max-w-[70%] ${
                isSentMessage ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {!isSentMessage && (
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={`https://i.pravatar.cc/32?u=${message.sender._id}`} />
                  <AvatarFallback>{getAvatarFallback(message.sender)}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`rounded-lg p-3 ${
                  isSentMessage
                    ? 'bg-white text-gray-800'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                <p>{message.content}</p>
                <div className={`flex items-center ${isSentMessage ? 'justify-end' : 'justify-start'} mt-1 space-x-1 text-xs ${isSentMessage ? 'text-gray-500' : 'text-primary-foreground/70'}`}>
                  <span>
                    {format(parseISO(message.timestamp), 'MM/dd/yyyy h:mm a')}
                  </span>
                  {isSentMessage && (
                    message.read ? <CheckCheck className="h-3 w-3 ml-1" /> : <Check className="h-3 w-3 ml-1" />
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageView;