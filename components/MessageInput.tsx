import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [warning, setWarning] = useState('');

  const containsPhoneNumber = (text: string): boolean => {
    // This regex looks for 7 to 10 digits with optional characters between them
    const phoneRegex = /(?:\D*\d){7,10}/;
    return phoneRegex.test(text);
  };

  const containsEmailAddress = (text: string): boolean => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    return emailRegex.test(text);
  };

  const containsSocialMediaHandle = (text: string): boolean => {
    // Check for Instagram, Facebook, and Twitter/X handles or URLs
    const socialMediaRegex = /(?:(?:http|https):\/\/)?(?:www\.)?(?:instagram\.com|facebook\.com|twitter\.com|x\.com)\/[a-zA-Z0-9_.]+/i;
    const handleRegex = /[@#][a-zA-Z0-9_.]+/;
    return socialMediaRegex.test(text) || handleRegex.test(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      if (containsPhoneNumber(message) || containsEmailAddress(message) || containsSocialMediaHandle(message)) {
        setWarning('Your message contains restricted content (phone number, email, or social media account). All communications must be done on the platform.');
      } else {
        onSendMessage(message);
        setMessage('');
        setWarning('');
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
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setWarning('');
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