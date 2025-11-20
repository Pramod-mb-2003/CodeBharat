'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useGame } from '@/context/GameContext';
import { Rocket } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function LoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { manualLogin, user, isInitialized } = useGame();
  
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero');

  useEffect(() => {
    if (isInitialized && user) {
      router.push('/dashboard');
    }
  }, [user, isInitialized, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock user object. In a real app, this would involve a backend call.
    const mockUser = {
      uid: userId,
      email: `${userId}@example.com`, // mock email for consistency with user type
    };
    manualLogin(mockUser);
    router.push('/dashboard');
  };
  
  if (!isInitialized) {
      return (
          <div className="flex min-h-screen w-full items-center justify-center">
            <Rocket className="h-16 w-16 animate-pulse text-primary" />
          </div>
      )
  }

  return (
    <div className="w-full lg:grid lg:min-h-[100vh] lg:grid-cols-2 xl:min-h-[100vh]">
      <div className="flex items-center justify-center py-12">
        <Card className="mx-auto max-w-sm w-full shadow-2xl border-primary/20">
            <form onSubmit={handleLogin}>
                <CardHeader className="text-center">
                    <div className="flex justify-center items-center gap-2 mb-2">
                        <Rocket className="w-10 h-10 text-primary" />
                        <h1 className="text-3xl font-bold font-headline">Interest Ignition</h1>
                    </div>
                    <CardDescription>
                        Enter your User ID below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="userId">User ID</Label>
                        <Input
                        id="userId"
                        type="text"
                        placeholder="your-user-id"
                        required
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        </div>
                        <Input 
                            id="password" 
                            type="password" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full">
                        Login
                    </Button>
                </CardFooter>
            </form>
        </Card>
      </div>
       <div className="hidden bg-muted lg:block relative">
        {heroImage && (
            <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
            />
        )}
      </div>
    </div>
  );
}
