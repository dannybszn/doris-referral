"use client";

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useEmblaCarousel, { EmblaCarouselType } from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

interface Talent {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar: string;
}

interface FeaturedCarouselProps {
  talents: Talent[];
  onTalentClick: (talent: Talent) => void;
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ talents, onTalentClick }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'center',
      slidesToScroll: 1,
      skipSnaps: false,
    },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const repeatedTalents = [...talents, ...talents, ...talents];

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center text-foreground mb-3">Featured Talent</h2>
        <p className="text-center text-muted-foreground mb-6">Check out our top-represented talent.</p>
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {repeatedTalents.map((talent, index) => {
                const distance = Math.abs(index - selectedIndex) % talents.length;
                const scale = distance === 0 ? 1 : 0.85;
                const opacity = distance === 0 ? 1 : 0.6;
                return (
                  <div
                    key={`${talent._id}-${index}`}
                    className="flex-[0_0_60%] sm:flex-[0_0_30%] md:flex-[0_0_25%] px-2 transition-all duration-300 ease-in-out cursor-pointer"
                    style={{
                      transform: `scale(${scale})`,
                      opacity: opacity,
                    }}
                    onClick={() => onTalentClick(talent)}
                  >
                    <div className="bg-card rounded-lg overflow-hidden shadow-md">
                      <div className="relative aspect-square">
                        <Image
                          src={talent.avatar || `https://ui-avatars.com/api/?name=${talent.firstName}+${talent.lastName}`}
                          alt={`${talent.firstName} ${talent.lastName}`}
                          layout="fill"
                          objectFit="cover"
                          className="rounded-t-lg"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="text-base font-semibold truncate">{`${talent.firstName} ${talent.lastName}`}</h3>
                        <p className="text-sm text-muted-foreground truncate">{talent.role}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20"
            onClick={scrollPrev}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20"
            onClick={scrollNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCarousel;