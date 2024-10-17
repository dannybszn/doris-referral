import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, X } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Talent {
  _id: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  image?: string;
  role: string;
}

interface CreateConversationButtonProps {
  onCreateConversation: (conversationId: string) => void;
  userRole: 'model' | 'agency' | 'admin';
}

const CreateConversationButton: React.FC<CreateConversationButtonProps> = ({ onCreateConversation, userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [search, setSearch] = useState("");
  const [talents, setTalents] = useState<Talent[]>([]);
  const [filteredTalents, setFilteredTalents] = useState<Talent[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canInitiateConversation = userRole === 'agency' || userRole === 'admin';

  useEffect(() => {
    const fetchTalents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/talents', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch talents');
        }
        const data: Talent[] = await response.json();
        setTalents(data);
        setFilteredTalents(data);
        setErrorMessage(null);
      } catch (error) {
        console.error('Error fetching talents:', error);
        setErrorMessage('Failed to load talents. Please try again later.');
      }
    };

    fetchTalents();
  }, []);

  useEffect(() => {
    const filtered = talents.filter(talent => {
      const fullName = `${talent.firstName || ''} ${talent.lastName || ''}`.toLowerCase();
      const companyName = (talent.companyName || '').toLowerCase();
      const searchLower = search.toLowerCase();
      
      return fullName.includes(searchLower) || companyName.includes(searchLower);
    });
    setFilteredTalents(filtered);
  }, [search, talents]);

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

        if (!response.ok) {
          throw new Error('Failed to create conversation');
        }

        const newConversation = await response.json();
        onCreateConversation(newConversation._id);
        setIsOpen(false);
        setSelectedTalent(null);
        setSearch("");
      } catch (error) {
        console.error('Error creating conversation:', error);
        setErrorMessage('Failed to create conversation. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!canInitiateConversation) {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }
    setIsOpen(open);
    if (!open) {
      setSelectedTalent(null);
      setSearch("");
    }
  };

  const handleSelectTalent = (talent: Talent) => {
    setSelectedTalent(talent);
    setSearch("");
  };

  const handleClearSelection = () => {
    setSelectedTalent(null);
    setSearch("");
  };

  const getDisplayName = (talent: Talent) => {
    if (talent.firstName && talent.lastName) {
      return `${talent.firstName} ${talent.lastName}`;
    }
    return talent.companyName || 'Unknown';
  };

  const getAvatarFallback = (talent: Talent) => {
    if (talent.firstName) {
      return talent.firstName.charAt(0);
    }
    if (talent.companyName) {
      return talent.companyName.charAt(0);
    }
    return 'U';
  };

  return (
    <>
      {showAlert && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            Only agencies and admins can initiate conversations.
          </AlertDescription>
        </Alert>
      )}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button className="w-full">Create New Conversation</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-background border-none shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Create New Conversation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="recipientName" className="text-sm font-medium">Recipient Name</Label>
              {selectedTalent ? (
                <div className="flex items-center justify-between p-2 bg-accent rounded-lg">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={selectedTalent.image} alt={getDisplayName(selectedTalent)} />
                      <AvatarFallback>{getAvatarFallback(selectedTalent)}</AvatarFallback>
                    </Avatar>
                    <span>{getDisplayName(selectedTalent)}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSelection}
                    className="ml-2 p-0 h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Command className="rounded-lg border border-input bg-background">
                  <div className="flex items-center border-b px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <CommandInput 
                      placeholder="Search models..." 
                      value={search}
                      onValueChange={setSearch}
                      className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  <CommandEmpty>No models found.</CommandEmpty>
                  <CommandGroup>
                    {filteredTalents.map((talent) => (
                      <CommandItem
                        key={talent._id}
                        onSelect={() => handleSelectTalent(talent)}
                        className="py-2"
                      >
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={talent.image} alt={getDisplayName(talent)} />
                          <AvatarFallback>{getAvatarFallback(talent)}</AvatarFallback>
                        </Avatar>
                        {getDisplayName(talent)}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              )}
            </div>
            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={!selectedTalent || isLoading}>
              {isLoading ? 'Creating...' : 'Start Conversation'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateConversationButton;