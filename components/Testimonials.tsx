import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const testimonials = [
  {
    name: 'Emily Chen',
    role: 'Model',
    content: 'DTA helped me connect with top agencies I never thought I could reach. Within weeks, I had multiple offers!',
    avatar: 'EC',
  },
  {
    name: 'Elite Model Management',
    role: 'Agency',
    content: 'DTA has revolutionized our talent scouting process. We\'ve discovered amazing new faces and streamlined our communication with potential models.',
    avatar: 'EM',
  },
  {
    name: 'Sophia Patel',
    role: 'Model',
    content: 'As a newcomer, DTA gave me the platform to learn and connect. The direct communication with agencies is invaluable.',
    avatar: 'SP',
  },
];

export default function Testimonials() {
  return (
    <section className="bg-background py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-foreground mb-12">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${testimonial.name}`} />
                    <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{testimonial.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}