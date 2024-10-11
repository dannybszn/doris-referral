import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <section className="flex-grow flex flex-col items-center justify-center text-center px-4 py-20">
      <div className="mb-8">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24 text-primary">
          <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
        </svg>
      </div>
      <h1 className="text-4xl font-bold mb-2">DTA</h1>
      <p className="text-2xl text-muted-foreground mb-8">
        Innovative solutions for your business
      </p>
      <div className="space-x-4">
        <Button size="lg" className="discord-button" asChild>
          <Link href="/account/login">Get Started</Link>
        </Button>
        <Button size="lg" variant="outline" className="rounded-full" asChild>
          <Link href="/about">Learn More</Link>
        </Button>
      </div>
    </section>
  );
}