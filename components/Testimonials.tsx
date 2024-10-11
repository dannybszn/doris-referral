import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const testimonials = [
  {
    name: 'John Doe',
    role: 'CTO, Tech Corp',
    content: 'TechInnovate has transformed our business with their AI solutions. Highly recommended!',
    avatar: 'JD',
  },
  {
    name: 'Jane Smith',
    role: 'CEO, Innovate Inc',
    content: 'The cloud services provided by TechInnovate have greatly improved our scalability and performance.',
    avatar: 'JS',
  },
  {
    name: 'Mike Johnson',
    role: 'IoT Manager, Smart Systems',
    content: 'TechInnovate\'s IoT platform has simplified our device management and data analysis processes.',
    avatar: 'MJ',
  },
];

export default function Testimonials() {
  return (
    <section className="bg-background py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-foreground mb-12">What Our Clients Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar>
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