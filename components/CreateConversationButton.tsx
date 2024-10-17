import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CreateConversationButtonProps {
  onCreateConversation: (conversationId: string) => void;
  userRole: 'model' | 'agency' | 'admin';
  existingConversations: any[];
}

const CreateConversationButton: React.FC<CreateConversationButtonProps> = ({
  onCreateConversation,
  userRole,
  existingConversations
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [talents, setTalents] = useState<any[]>([]);
  const [selectedTalent, setSelectedTalent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (search.trim().length > 0) {
      handleSearch();
    } else {
      setTalents([]);
    }
  }, [search]);

  const handleSearch = async () => {
    if (!search.trim()) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/talents?search=${search}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTalents(data);
        setErrorMessage(null);
      } else {
        setErrorMessage("Failed to fetch talents");
      }
    } catch (error) {
      console.error('Error searching talents:', error);
      setErrorMessage("An error occurred while searching for talents");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTalent) {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ recipientId: selectedTalent._id })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to create conversation');
        }

        onCreateConversation(data._id);
        setIsOpen(false);
        setSelectedTalent(null);
        setSearch("");
      } catch (error) {
        console.error('Error creating conversation:', error);
        setErrorMessage(`Failed to create conversation: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="w-full">
        Create New Conversation
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Conversation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                  Recipient Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <Input
                    type="text"
                    name="search"
                    id="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={userRole === 'agency' ? "Search models..." : "Search agencies..."}
                  />
                </div>
              </div>
              {talents.length > 0 && (
                <div className="max-h-60 overflow-y-auto">
                  {talents.map((talent) => (
                    <div
                      key={talent._id}
                      className={`flex items-center space-x-3 p-2 cursor-pointer ${
                        selectedTalent?._id === talent._id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                      }`}
                      onClick={() => setSelectedTalent(talent)}
                    >
                      <Avatar>
                        <AvatarImage src={talent.avatar} />
                        <AvatarFallback>{talent.firstName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{`${talent.firstName} ${talent.lastName}`}</p>
                        <p className="text-sm text-muted-foreground">{talent.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" disabled={!selectedTalent || isLoading} className="w-full">
                {isLoading ? 'Creating...' : 'Start Conversation'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateConversationButton;