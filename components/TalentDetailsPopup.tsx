'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TalentDetails {
  _id: string;
  name: string;
  role: string;
  image: string;
  age?: number;
  price: number;
  bio?: string;
  hairColor?: string;
  birthday?: string;
  positiveKeywords?: string[];
  negativeKeywords?: string[];
  profileLink?: string;
  additionalPhotos?: string[];
}

interface TalentDetailsPopupProps {
  talent: TalentDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

const TalentDetailsPopup: React.FC<TalentDetailsPopupProps> = ({ talent, isOpen, onClose }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  if (!talent) return null;

  const allPhotos = [talent.image, ...(talent.additionalPhotos || [])].slice(0, 4);

  const nextPhoto = () => {
    setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % allPhotos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prevIndex) => (prevIndex - 1 + allPhotos.length) % allPhotos.length);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-background text-foreground p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-3xl font-bold">{talent.name}</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 p-6">
            <div className="relative aspect-square mb-4">
              <img
                src={allPhotos[currentPhotoIndex]}
                alt={`${talent.name} - Photo ${currentPhotoIndex + 1}`}
                className="w-full h-full object-cover rounded-md"
              />
              {allPhotos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full bg-black/50"
                    onClick={prevPhoto}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-black/50"
                    onClick={nextPhoto}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            <div className="text-center text-sm text-muted-foreground">
              {currentPhotoIndex + 1} / {allPhotos.length}
            </div>
          </div>
          <div className="w-full md:w-1/2 p-6 space-y-4">
            <div>
              <h3 className="text-xl font-semibold">{talent.role}</h3>
              <p className="text-muted-foreground">{talent.age ? `${talent.age} years old` : 'Age not specified'}</p>
            </div>
            <InfoRow label="Price" value={talent.price === 0 ? "Free" : `$${talent.price}`} />
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