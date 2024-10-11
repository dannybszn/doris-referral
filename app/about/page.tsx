import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const teamMembers = [
  { name: 'John Doe', role: 'CEO & Co-founder', initials: 'JD' },
  { name: 'Jane Appleseed', role: 'CTO & Co-founder', initials: 'JA' },
  { name: 'Sarah Musk', role: 'Head of Product', initials: 'SM' },
  { name: 'David Wang', role: 'Lead Engineer', initials: 'DW' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-center mb-12">About DTA Ltd</h1>
        
        <section className="mb-16">
          <h2 className="text-3xl font-semibold mb-6">Our Mission</h2>
          <p className="text-lg text-muted-foreground">
            At DTA Ltd, our mission is to provide innovative solutions that empower our customers to achieve their goals. We are committed to delivering exceptional products and services that exceed expectations and drive success.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-semibold mb-6">Our History</h2>
          <p className="text-lg text-muted-foreground">
            DTA Ltd was founded in 2010 with the vision of becoming a leading provider of cutting-edge technology solutions. Over the years, we have grown to become a trusted partner for businesses of all sizes, helping them navigate the ever-evolving digital landscape.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-6">Our Team</h2>
          <p className="text-lg text-muted-foreground mb-8">
            At the heart of DTA Ltd are our talented and dedicated employees. Our team is composed of industry experts, innovators, and problem-solvers who are passionate about delivering exceptional results for our clients.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <Card key={index}>
                <CardHeader className="text-center">
                  <div className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                    {member.initials}
                  </div>
                  <CardTitle>{member.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  {member.role}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}