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

const DiscoverPage: React.FC = () => {
  const [talents, setTalents] = useState([]);
  const [sortOption, setSortOption] = useState('alphabetical');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [isFreeFilter, setIsFreeFilter] = useState(false);
  const [isNewFilter, setIsNewFilter] = useState(false);

  useEffect(() => {
    const fetchTalents = async () => {
      try {
        const response = await fetch('/api/talents');
        const data = await response.json();
        setTalents(data);
      } catch (error) {
        console.error('Error fetching talents:', error);
      }
    };

    fetchTalents();
  }, []);
  const filteredTalents = talents.filter(talent => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      talent.name.toLowerCase().includes(searchLower) ||
      talent.role.toLowerCase().includes(searchLower) ||
      (talent.price !== undefined && talent.price.toString().includes(searchLower)) ||
      (talent.age !== undefined && talent.age.toString().includes(searchLower)) ||
      (talent.bio && talent.bio.toLowerCase().includes(searchLower)) ||
      (talent.hairColor && talent.hairColor.toLowerCase().includes(searchLower)) ||
      (talent.positiveKeywords && talent.positiveKeywords.some(keyword => keyword.toLowerCase().includes(searchLower)));

    const hasNegativeKeyword = talent.negativeKeywords && talent.negativeKeywords.some(keyword => searchLower.includes(keyword.toLowerCase()));

    return (isFreeFilter ? talent.price === 0 : true) && matchesSearch && !hasNegativeKeyword;
  }).sort((a, b) => {
    switch (sortOption) {
      case 'age':
        return (a.age || 0) - (b.age || 0);
      case 'hairColor':
        return (a.hairColor || '').localeCompare(b.hairColor || '');
      case 'height':
        return (a.height || '').localeCompare(b.height || '');
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const handleTalentClick = (talent) => {
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
          placeholder="Search by name, skill, price, age, bio, hair color, or keywords"
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
            <DropdownMenuItem onClick={() => setSortOption('age')}>
              Age
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOption('hairColor')}>
              Hair Color
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOption('height')}>
              Height
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOption('newest')}>
              Newest
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredTalents.map((talent) => (
          <Card key={talent._id} className="cursor-pointer" onClick={() => handleTalentClick(talent)}>
            <CardContent className="p-4">
              <img
                src={talent.image}
                alt={talent.name}
                className="w-full h-36 object-cover mb-4 rounded-md"
              />
              <h3 className="font-semibold text-lg">{talent.name}</h3>
              <p className="text-sm text-muted-foreground">{talent.role}</p>
              <div className="flex justify-between text-sm mt-2">
                <span>{talent.age ? `${talent.age} years` : 'N/A'}</span>
                <span>{talent.price === 0 ? "Free" : `$${talent.price}`}</span>
              </div>
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