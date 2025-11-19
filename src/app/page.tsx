import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, Rocket } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { InterestIcons } from '@/components/icons';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Rocket className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-foreground font-headline">
              Interest Ignition
            </span>
          </Link>
        </div>
      </header>
      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 md:py-32">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter mb-4 text-foreground font-headline">
              Ignite Your Curiosity. <span className="text-primary">Learn Your Way.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Discover your passions with our fun, gamified quiz and unlock a personalized learning journey designed just for you.
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/quiz">
                Start Your Adventure <Sparkles className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-8">
                {Object.entries(InterestIcons).map(([key, Icon]) => (
                    <Card key={key} className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-lg hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300">
                        <CardContent className="flex flex-col items-center justify-center p-6">
                            <Icon className="w-12 h-12 text-primary mb-2" />
                            <p className="font-semibold text-foreground capitalize">{key}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
      </main>
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Interest Ignition. All rights reserved.</p>
      </footer>
    </div>
  );
}
