import { Button } from '@/components/ui/button';

export default function CTA() {
  return (
    <section className="bg-primary py-20">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-primary-foreground mb-4">Ready to Innovate?</h2>
        <p className="text-xl text-primary-foreground/80 mb-8">
          Join DTA and start transforming your business today.
        </p>
        <Button size="lg" variant="secondary">Get Started Now</Button>
      </div>
    </section>
  );
}