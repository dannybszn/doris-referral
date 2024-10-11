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
  firstName: string;
  lastName: string;
  avatar?: string;
}

interface CreateConversationButtonProps {
  onCreateConversation: (recipientId: string) => void;
  userRole: 'model' | 'agency' | 'admin';
}

const CreateConversationButton: React.FC<CreateConversationButtonProps> = ({ onCreateConversation, userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [search, setSearch] = useState("");
  const [filteredTalents, setFilteredTalents] = useState<Talent[]>([]);
  const [showAlert, setShowAlert] = useState(false);

  const canInitiateConversation = userRole === 'agency' || userRole === 'admin';

  useEffect(() => {
    const fetchTalents = async () => {
      try {
        const response = await fetch('/api/talents');
        const data: Talent[] = await response.json();
        setFilteredTalents(data);
      } catch (error) {
        console.error('Error fetching talents:', error);
      }
    };

    fetchTalents();
  }, []);

  useEffect(() => {
    setFilteredTalents(prevTalents =>
      prevTalents.filter(talent => 
        talent.firstName.toLowerCase().includes(search.toLowerCase()) ||
        talent.lastName.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTalent) {
      onCreateConversation(selectedTalent._id);
      setIsOpen(false);
      setSelectedTalent(null);
      setSearch("");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!canInitiateConversation) {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000); // Hide alert after 3 seconds
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
                      <AvatarImage src={selectedTalent.avatar} alt={`${selectedTalent.firstName} ${selectedTalent.lastName}`} />
                      <AvatarFallback>{selectedTalent.firstName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{`${selectedTalent.firstName} ${selectedTalent.lastName}`}</span>
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
                  {search && (
                    <>
                      <CommandEmpty>No model found.</CommandEmpty>
                      <CommandGroup className="max-h-[200px] overflow-auto">
                        {filteredTalents.map((talent) => (
                          <CommandItem
                            key={talent._id}
                            onSelect={() => handleSelectTalent(talent)}
                            className="flex items-center px-3 py-2 cursor-pointer hover:bg-accent"
                          >
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage src={talent.avatar} alt={`${talent.firstName} ${talent.lastName}`} />
                              <AvatarFallback>{talent.firstName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {`${talent.firstName} ${talent.lastName}`}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </>
                  )}
                </Command>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={!selectedTalent}>
              Start Conversation
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateConversationButton;