import { generateMetadata as genMeta } from '@/lib/seo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Shield, Target, Users, Lightbulb, Award, TrendingUp } from 'lucide-react';

export const metadata = genMeta({
  title: 'About Us',
  description:
    'Learn about HealthPeDhyan™ and our mission to make healthy food choices easier for everyone.',
});

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: 'Transparency',
      description:
        'We clearly disclose affiliate relationships and how we make money. No hidden agendas.',
      color: 'text-primary-600',
    },
    {
      icon: Award,
      title: 'Evidence-Based',
      description:
        'Every claim is backed by scientific research from WHO, FSSAI, and peer-reviewed studies.',
      color: 'text-blue-600',
    },
    {
      icon: TrendingUp,
      title: 'Independence',
      description:
        'Brands cannot pay for better ratings. Products earn badges through quality alone.',
      color: 'text-green-600',
    },
  ];

  const differentiators = [
    'Evidence-based standards backed by WHO, FSSAI, and peer-reviewed research',
    'No sponsored placements - products earn badges through quality alone',
    'Transparent methodology - see exactly how we evaluate each product',
    'Focus on accessibility - healthier choices for every budget',
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-20 lg:py-32">
        <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
          <Badge className="mb-6" variant="default">
            About HealthPeDhyan™
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
            Making Healthy Choices
            <span className="block text-primary-600 mt-2">Simple & Accessible</span>
          </h1>
          <p className="mt-6 text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            We believe choosing healthy food shouldn't require a nutrition degree. That's why we do
            the research, decode the labels, and help Indian families shop with confidence.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="rounded-full bg-primary-100 p-3">
                    <Target className="h-6 w-6 text-primary-700" />
                  </div>
                  <CardTitle className="text-2xl">Our Mission</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-700 leading-relaxed">
                  We help Indian families discover healthier packaged foods by doing the research
                  for you. Every product in our catalog is rigorously evaluated for palm oil,
                  artificial additives, sugar content, and overall ingredient quality.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="rounded-full bg-blue-100 p-3">
                    <Lightbulb className="h-6 w-6 text-blue-700" />
                  </div>
                  <CardTitle className="text-2xl">Why We Started</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-700 leading-relaxed">
                  Reading nutrition labels is time-consuming and confusing. Terms like "vegetable
                  oil" can hide palm oil. "Natural flavors" don't always mean healthy. We decode
                  the labels so you can shop with confidence and make informed decisions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="bg-neutral-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl">
              What Makes Us Different
            </h2>
            <p className="mt-4 text-lg text-neutral-600">
              We're not just another product review site. Here's what sets us apart.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {differentiators.map((item, index) => (
              <Card key={index} className="border-l-4 border-l-primary-500">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="rounded-full bg-primary-100 p-2">
                        <Users className="h-4 w-4 text-primary-700" />
                      </div>
                    </div>
                    <p className="text-neutral-700">{item}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl">Our Core Values</h2>
            <p className="mt-4 text-lg text-neutral-600">
              These principles guide everything we do at HealthPeDhyan™
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title} className="text-center border-2 hover:border-primary-300 transition-colors">
                  <CardHeader>
                    <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                      <Icon className={`h-8 w-8 ${value.color}`} />
                    </div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-600">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-16 lg:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
          <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl">
            Join Us on This Journey
          </h2>
          <p className="mt-4 text-lg text-neutral-600">
            Have questions, product suggestions, or feedback? We'd love to hear from you.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/contact">Get in Touch</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/standards">See Our Standards</Link>
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3 text-center">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="text-3xl font-bold text-primary-600">1000+</div>
              <div className="mt-2 text-sm text-neutral-600">Products Reviewed</div>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="text-3xl font-bold text-primary-600">100%</div>
              <div className="mt-2 text-sm text-neutral-600">Evidence-Based</div>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="text-3xl font-bold text-primary-600">0</div>
              <div className="mt-2 text-sm text-neutral-600">Sponsored Rankings</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
