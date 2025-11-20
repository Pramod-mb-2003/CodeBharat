
'use client';
import { useEffect, useState, Suspense } from 'react';
import { useFirestore } from '@/firebase/provider';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useGame } from '@/context/GameContext';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoaderCircle, Trophy, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

type LeaderboardEntry = {
  userId: string;
  credits: number;
};

function LeaderboardContent() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user, isInitialized } = useGame();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/');
    }
  }, [user, isInitialized, router]);

  useEffect(() => {
    if (!firestore || !isInitialized || !user) return;

    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const creditsColRef = collection(firestore, 'user_credits');
        const q = query(creditsColRef, where('credits', '>', 0), orderBy('credits', 'desc'), limit(100));
        
        const querySnapshot = await getDocs(q);
        const data: LeaderboardEntry[] = [];
        querySnapshot.forEach((doc) => {
          data.push({ userId: doc.id, credits: doc.data().credits });
        });
        
        setLeaderboard(data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [firestore, user, isInitialized]);

  if (!isInitialized || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <LoaderCircle className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
            <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Button>
            <div className="flex items-center gap-4">
                <Trophy className="w-12 h-12 text-primary" />
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold font-headline text-foreground">Leaderboard</h1>
                    <p className="text-muted-foreground mt-2">See how you rank against other learners!</p>
                </div>
            </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Top Learners</CardTitle>
            <CardDescription>Top 100 users by credits earned.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
               <div className="flex justify-center items-center h-64">
                    <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
               </div>
            ) : (
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[100px]">Rank</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead className="text-right">Credits</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {leaderboard.map((entry, index) => (
                        <TableRow key={entry.userId} className={entry.userId === user.uid ? 'bg-primary/10' : ''}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>{entry.userId}</TableCell>
                            <TableCell className="text-right font-bold">{entry.credits}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                </Table>
            )}
             {leaderboard.length === 0 && !isLoading && (
              <div className="text-center py-16 text-muted-foreground">
                <p>The leaderboard is currently empty.</p>
                <p>Start learning to get your name on the board!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


export default function LeaderboardPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen w-full items-center justify-center">
                <LoaderCircle className="h-16 w-16 animate-spin text-primary" />
            </div>
        }>
            <LeaderboardContent />
        </Suspense>
    )
}
