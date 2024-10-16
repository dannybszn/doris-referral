"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TalentDetailsPopup from '@/components/TalentDetailsPopup';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';

interface Talent {
  _id: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  avatar?: string;
  role: string;
  // Add other properties as needed
}

const DiscoverPage: React.FC = () => {
  const [talents, setTalents] = useState<Talent[]>([]);
  const [sortOption, setSortOption] = useState('alphabetical');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [isFreeFilter, setIsFreeFilter] = useState(false);
  const [isNewFilter, setIsNewFilter] = useState(false);

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
      } catch (error) {
        console.error('Error fetching talents:', error);
      }
    };

    fetchTalents();
  }, []);

  const filteredTalents = talents.filter(talent => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${talent.firstName} ${talent.lastName}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchLower) ||
      talent.role.toLowerCase().includes(searchLower);

    return matchesSearch;
  }).sort((a, b) => {
    switch (sortOption) {
      case 'alphabetical':
      default:
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    }
  });

  const handleTalentClick = (talent: Talent) => {
    setSelectedTalent(talent);
  };

  const toggleFreeFilter = () => {
    setIsFreeFilter(!isFreeFilter);
  };

  const toggleNewFilter = () => {
    setIsNewFilter(!isNewFilter);
    if (!isNewFilter) {
      setSortOption('newest');
    } else {
      setSortOption('alphabetical');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <FeaturedCarousel talents={talents.slice(0, 5)} onTalentClick={handleTalentClick} />
      
      <h2 className="text-2xl font-bold mt-12 mb-4">Discover Talent</h2>
      <div className="flex gap-4 mb-6">
        <Button 
          variant={isNewFilter ? "default" : "outline"}
          onClick={toggleNewFilter}
        >
          New
        </Button>
        <Button 
          variant={isFreeFilter ? "default" : "outline"}
          onClick={toggleFreeFilter}
        >
          Free
        </Button>
        <Input
          type="text"
          placeholder="Search by name or role"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Sort <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSortOption('alphabetical')}>
              Alphabetical
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap justify-center gap-12">
        {filteredTalents.map((talent) => (
          <Card 
            key={talent._id} 
            className="cursor-pointer overflow-hidden w-full max-w-[280px] flex-grow-0 flex-shrink-0 basis-[calc(25%-2.25rem)]" 
            onClick={() => handleTalentClick(talent)}
          >
            <div className="relative pt-[100%]">
              <Image
                src={talent.avatar || `https://ui-avatars.com/api/?name=${talent.firstName}+${talent.lastName}`}
                alt={`${talent.firstName} ${talent.lastName}`}
                layout="fill"
                objectFit="cover"
                className="absolute inset-0 w-full h-full"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-base truncate">{`${talent.firstName} ${talent.lastName}`}</h3>
              <p className="text-sm text-muted-foreground truncate">{talent.role}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <TalentDetailsPopup
        talent={selectedTalent}
        isOpen={!!selectedTalent}
        onClose={() => setSelectedTalent(null)}
      />
    </div>
  );
};

export default DiscoverPage;