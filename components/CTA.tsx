import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CTA() {
  return (
    <section className="bg-primary py-20">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-primary-foreground mb-4">Ready to Launch Your Modeling Career?</h2>
        <p className="text-xl text-primary-foreground/80 mb-8">
          Join DTA and connect with top agencies to take your career to the next level.
        </p>
        <Button size="lg" variant="secondary" asChild>
          <Link href="/account/register">Create Your Portfolio</Link>
        </Button>
      </div>
    </section>
  );
}