import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TalentDetails {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  companyName?: string;
  bio?: string;
  age?: number;
  height?: string;
  hairColor?: string;
  birthday?: string;
  positiveKeywords?: string[];
  negativeKeywords?: string[];
  profileLink?: string;
}

interface TalentDetailsPopupProps {
  talent: TalentDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

const TalentDetailsPopup: React.FC<TalentDetailsPopupProps> = ({ talent, isOpen, onClose }) => {
  if (!talent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-background text-foreground p-0 overflow-hidden border border-gray-700 [&>button]:hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-3xl font-bold">{`${talent.firstName} ${talent.lastName}`}</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 rounded-full hover:bg-accent hover:text-accent-foreground"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 p-4">
            <div className="aspect-square bg-gray-200 overflow-hidden rounded-lg border-2 border-gray-700 shadow-md">
              {talent.avatar ? (
                <img
                  src={talent.avatar}
                  alt={`${talent.firstName} ${talent.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-gray-400">
                  {talent.firstName[0]}{talent.lastName[0]}
                </div>
              )}
            </div>
          </div>
          <div className="w-full md:w-1/2 p-6 space-y-4">
            <div>
              <h3 className="text-xl font-semibold">{talent.role}</h3>
              {talent.companyName && <p className="text-muted-foreground">{talent.companyName}</p>}
            </div>
            <InfoRow label="Age" value={talent.age} />
            <InfoRow label="Height" value={talent.height} />
            <InfoRow label="Hair Color" value={talent.hairColor} />
            <InfoRow label="Birthday" value={talent.birthday} />
            {talent.bio && (
              <div>
                <h4 className="font-semibold">Bio:</h4>
                <p className="text-sm">{talent.bio}</p>
              </div>
            )}
            {talent.positiveKeywords && talent.positiveKeywords.length > 0 && (
              <div>
                <h4 className="font-semibold">Positive Keywords:</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {talent.positiveKeywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary">{keyword}</Badge>
                  ))}
                </div>
              </div>
            )}
            {talent.negativeKeywords && talent.negativeKeywords.length > 0 && (
              <div>
                <h4 className="font-semibold">Negative Keywords:</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {talent.negativeKeywords.map((keyword, index) => (
                    <Badge key={index} variant="destructive">{keyword}</Badge>
                  ))}
                </div>
              </div>
            )}
            {talent.profileLink && (
              <div>
                <h4 className="font-semibold">Profile Link:</h4>
                <a href={talent.profileLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  View Full Profile
                </a>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const InfoRow: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center">
      <span className="font-semibold">{label}:</span>
      <span className="text-muted-foreground">{value}</span>
    </div>
  );
};

export default TalentDetailsPopup;