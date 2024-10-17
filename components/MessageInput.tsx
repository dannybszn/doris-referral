import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [warning, setWarning] = useState('');
  const [error, setError] = useState('');

  const containsPhoneNumber = (text: string): boolean => {
    const phoneRegex = /(?:\D*\d){7,10}/;
    return phoneRegex.test(text);
  };

  const containsEmailAddress = (text: string): boolean => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    return emailRegex.test(text);
  };

  const containsSocialMediaHandle = (text: string): boolean => {
    const socialMediaRegex = /(?:(?:http|https):\/\/)?(?:www\.)?(?:instagram\.com|facebook\.com|twitter\.com|x\.com)\/[a-zA-Z0-9_.]+/i;
    const handleRegex = /[@#][a-zA-Z0-9_.]+/;
    return socialMediaRegex.test(text) || handleRegex.test(text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      if (containsPhoneNumber(message) || containsEmailAddress(message) || containsSocialMediaHandle(message)) {
        setWarning('Your message contains restricted content (phone number, email, or social media account). All communications must be done on the platform.');
      } else {
        setWarning('');
        setError('');
        try {
          await onSendMessage(message);
          setMessage('');
        } catch (error) {
          console.error('Error sending message:', error);
          setError(`Failed to send message: ${error.message}`);
        }
      }
    }
  };

  return (
    <div className="space-y-2 p-6 bg-card">
      {warning && (
        <Alert variant="destructive">
          <AlertDescription>{warning}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setWarning('');
            setError('');
          }}
          className="flex-grow"
        />
        <Button type="submit" size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default MessageInput;