import { Cpu, Cloud, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const features = [
  {
    icon: Cpu,
    title: 'AI Solutions',
    description: 'Cutting-edge artificial intelligence to power your business.',
  },
  {
    icon: Cloud,
    title: 'Cloud Services',
    description: 'Scalable and secure cloud infrastructure for your applications.',
  },
  {
    icon: Zap,
    title: 'IoT Integration',
    description: 'Connect and manage your devices with our IoT platform.',
  },
];

export default function Features() {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-foreground mb-12">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-background border-none">
              <CardHeader>
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription className="text-muted-foreground">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}