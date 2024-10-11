import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, parseISO } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';

interface Message {
  _id: string;
  sender: string;
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

  return (
    <div className="flex flex-col space-y-4">
      {messages.map((message) => {
        const isSentMessage = message.sender === currentUserId;
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
                  <AvatarImage src={`https://i.pravatar.cc/32?u=${message.sender}`} />
                  <AvatarFallback>{message.sender.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`rounded-lg p-3 ${
                  isSentMessage
                    ? 'bg-gray-200 text-gray-800'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                <p>{message.content}</p>
                <div className="flex items-center justify-end mt-1 space-x-1">
                  <p className="text-xs opacity-70">
                    {format(parseISO(message.timestamp), 'MM/dd/yyyy h:mm a')}
                  </p>
                  {isSentMessage && (
                    message.read ? <CheckCheck className="h-4 w-4" /> : <Check className="h-4 w-4" />
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