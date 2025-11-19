'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Rocket } from 'lucide-react';
import Link from 'next/link';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useGame } from '@/context/GameContext';

export default function LoginPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, manualLogin, manualLogout, isInitialized } = useGame();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!firestore || !isInitialized) return;
    setIsLoading(true);

    try {
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('userId', '==', userId.trim()), where('password', '==', password));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('invalid-credential');
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      // Manually set user data in context instead of Firebase Auth
      manualLogin({
        uid: userDoc.id,
        email: userData.email,
        ...userData,
      });

      router.push('/dashboard');

    } catch (error: any) {
      let description = 'An unexpected error occurred. Please try again.';
      if (error.message === 'invalid-credential') {
        description = 'Invalid User ID or password.';
      }

      toast({
        title: 'Login Failed',
        description: description,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignOut = () => {
    manualLogout();
  };

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
          {user && (
            <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Sign Out</span>
            </Button>
          )}
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-sm shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold font-headline">
              Student Login
            </CardTitle>
            <CardDescription>
              Enter your credentials to start learning!
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  type="text"
                  placeholder="Enter your User ID"
                  required
                  value={userId}
                  onChange={e => setUserId(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading || !isInitialized}>
                {isLoading ? 'Logging In...' : 'Login'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
       <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Interest Ignition. All rights reserved.</p>
      </footer>
    </div>
  );
}
