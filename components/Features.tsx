import { Users, Building2, MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const features = [
  {
    icon: Users,
    title: 'Model Showcase',
    description: 'Create a stunning portfolio to showcase your talent and catch the eye of top agencies.',
  },
  {
    icon: Building2,
    title: 'Agency Access',
    description: 'Get direct access to leading modeling agencies and increase your chances of signing with them.',
  },
  {
    icon: MessageSquare,
    title: 'Direct Communication',
    description: 'Connect and communicate directly with agency representatives through our secure platform.',
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