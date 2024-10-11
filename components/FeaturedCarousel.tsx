"use client";

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useEmblaCarousel, { EmblaCarouselType } from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

interface Talent {
  _id: string;
  name: string;
  role: string;
  image: string;
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
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
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

  // Create an array that repeats the talents to ensure we always have enough for the carousel
  const repeatedTalents = [...talents, ...talents, ...talents];

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-foreground mb-12">Featured Talent</h2>
        <p className="text-center text-muted-foreground mb-8">Check out our top-represented talent.</p>
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {repeatedTalents.map((talent, index) => {
                const distance = Math.abs(index - selectedIndex) % talents.length;
                const scale = distance === 0 ? 1.2 : distance === 1 ? 0.9 : 0.7; // Reduced from 1.3 to 1.2
                const opacity = distance === 0 ? 1 : distance === 1 ? 0.7 : 0.5;
                const zIndex = distance === 0 ? 10 : distance === 1 ? 5 : 1;
                const translateY = distance === 0 ? '-5%' : '0%'; // Reduced from -10% to -5%
                return (
                  <div
                    key={`${talent._id}-${index}`}
                    className="flex-[0_0_33.33%] px-4 transition-all duration-300 ease-in-out cursor-pointer"
                    style={{
                      transform: `scale(${scale}) translateY(${translateY})`,
                      opacity: opacity,
                      zIndex: zIndex,
                    }}
                    onClick={() => onTalentClick(talent)}
                  >
                    <div className="bg-card rounded-lg overflow-hidden shadow-lg transform perspective-1000 hover:rotate-y-10">
                      <div className="relative w-full h-64">
                        <Image
                          src={talent.image}
                          alt={talent.name}
                          layout="fill"
                          objectFit="cover"
                          className="rounded-t-lg"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold truncate">{talent.name}</h3>
                        <p className="text-muted-foreground truncate">{talent.role}</p>
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
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20"
            onClick={scrollPrev}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20"
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