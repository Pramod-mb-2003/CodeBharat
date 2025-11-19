'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useFirestore } from '@/firebase/provider';
import { doc, setDoc, getDoc, DocumentData, collection } from 'firebase/firestore';
import { learningContent } from '@/lib/learning-data';

// A mock user type since we are not using Firebase Auth
type MockUser = {
  uid: string;
  email: string | null;
  [key: string]: any;
};

type Progress = {
  [interest: string]: {
    unlockedStage: number;
    hearts: number;
    lastHeartLost: number | null;
  };
};

type GameData = {
    progress: Progress;
    interests: string[];
};

type CreditsData = {
    credits: number;
}

type GameContextType = {
  user: MockUser | null;
  credits: number;
  progress: Progress;
  interests: string[];
  allInterestsComplete: boolean;
  initializeInterests: (interests: string[]) => Promise<void>;
  updateInterests: (newInterest: string) => Promise<void>;
  addCredits: (amount: number) => void;
  loseHeart: (interest: string) => void;
  resetHearts: (interest: string) => void;
  completeStage: (interest: string, stageId: number) => void;
  resetGame: () => void;
  isInitialized: boolean;
  manualLogin: (user: MockUser) => void;
  manualLogout: () => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

const MAX_HEARTS = 3;
const HEART_REGEN_TIME = 20 * 1000; // 20 seconds

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const firestore = useFirestore();
  const [user, setUser] = useState<MockUser | null>(null);

  const [credits, setCredits] = useState<number>(0);
  const [progress, setProgress] = useState<Progress>({});
  const [interests, setInterests] = useState<string[]>([]);
  const [allInterestsComplete, setAllInterestsComplete] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const saveData = useCallback(async (gameData: Partial<GameData>, creditsData?: Partial<CreditsData>) => {
      if (!firestore || !user) return;
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        await setDoc(userDocRef, gameData, { merge: true });

        if (creditsData) {
            const creditsDocRef = doc(firestore, 'user_credits', user.uid);
            await setDoc(creditsDocRef, creditsData, { merge: true });
        }
      } catch (error) {
          console.error("Failed to save game data:", error);
      }
  }, [firestore, user]);

  const manualLogin = (userData: MockUser) => {
    setUser(userData);
    sessionStorage.setItem('user', JSON.stringify(userData));
  };
  
  const manualLogout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    setCredits(0);
    setProgress({});
    setInterests([]);
    window.location.href = '/';
  };

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Could not parse user from session storage", e);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    const loadData = async () => {
        if (user && firestore) {
            const userDocRef = doc(firestore, 'users', user.uid);
            const creditsDocRef = doc(firestore, 'user_credits', user.uid);
            
            const userDocSnap = await getDoc(userDocRef);
            const creditsDocSnap = await getDoc(creditsDocRef);

            if (userDocSnap.exists()) {
                const data = userDocSnap.data() as GameData;
                setProgress(data.progress || {});
                setInterests(data.interests || []);
            } else {
              await saveData({ progress: {}, interests: [] });
            }

            if(creditsDocSnap.exists()) {
                const data = creditsDocSnap.data() as CreditsData;
                setCredits(data.credits || 0);
            } else {
                await saveData({}, { credits: 0 });
            }
        } else {
            setCredits(0);
            setProgress({});
            setInterests([]);
        }
    };
    if (isInitialized) {
      loadData();
    }
  }, [user, firestore, isInitialized, saveData]);

  useEffect(() => {
    if (interests.length > 0 && Object.keys(progress).length > 0) {
      const allComplete = interests.every(key => {
        const interestProgress = progress[key];
        const totalStages = learningContent[key]?.length || 0;
        if (!interestProgress || totalStages === 0) return false;
        return (interestProgress.unlockedStage || 1) > totalStages;
      });
      setAllInterestsComplete(allComplete);
    } else {
      setAllInterestsComplete(false);
    }
  }, [interests, progress]);


  useEffect(() => {
    const interval = setInterval(() => {
      if (!isInitialized || !user) return;
      
      const now = Date.now();
      let needsUpdate = false;
      const newProgress: Progress = JSON.parse(JSON.stringify(progress));

      for (const interest in newProgress) {
        const p = newProgress[interest];
        if (p.hearts < MAX_HEARTS && p.lastHeartLost) {
          const heartsToRegen = Math.floor((now - p.lastHeartLost) / HEART_REGEN_TIME);

          if (heartsToRegen > 0) {
            const newHearts = Math.min(MAX_HEARTS, p.hearts + heartsToRegen);
            const timeConsumed = heartsToRegen * HEART_REGEN_TIME;

            p.hearts = newHearts;
            if (newHearts < MAX_HEARTS) {
              p.lastHeartLost! += timeConsumed;
            } else {
              p.lastHeartLost = null;
            }
            needsUpdate = true;
          }
        }
      }
      if (needsUpdate) {
        setProgress(newProgress);
        saveData({ progress: newProgress });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [progress, isInitialized, user, saveData]);


  const initializeInterests = useCallback(async (newInterests: string[]) => {
    if (!user) return;
    const newProgress = { ...progress };
    newInterests.forEach(interest => {
        if (!newProgress[interest]) {
            newProgress[interest] = { unlockedStage: 1, hearts: MAX_HEARTS, lastHeartLost: null };
        }
    });

    setInterests(newInterests);
    setProgress(newProgress);
    await saveData({ progress: newProgress, interests: newInterests });
  }, [progress, saveData, user]);

  const updateInterests = useCallback(async (newInterest: string) => {
    if (!user || interests.includes(newInterest)) return;
    
    const newInterests = [...interests, newInterest];
    const newProgress = { ...progress };
    if (!newProgress[newInterest]) {
        newProgress[newInterest] = { unlockedStage: 1, hearts: MAX_HEARTS, lastHeartLost: null };
    }
    
    setInterests(newInterests);
    setProgress(newProgress);
    await saveData({ interests: newInterests, progress: newProgress });

}, [user, interests, progress, saveData]);

  const addCredits = (amount: number) => {
    if (!user) return;
    const newCredits = credits + amount;
    setCredits(newCredits);
    saveData({}, { credits: newCredits });
  };

  const loseHeart = (interest: string) => {
    if (!user) return;
    const newProgress = { ...progress };
    const currentInterestProgress = newProgress[interest] || { hearts: MAX_HEARTS, unlockedStage: 1, lastHeartLost: null };
    const newHearts = Math.max(0, currentInterestProgress.hearts - 1);
    
    newProgress[interest] = {
        ...currentInterestProgress,
        hearts: newHearts,
        lastHeartLost: newHearts < MAX_HEARTS ? (currentInterestProgress.lastHeartLost || Date.now()) : null,
    };
    setProgress(newProgress);
    saveData({ progress: newProgress });
  };

  const resetHearts = (interest: string) => {
    if (!user) return;
    const newProgress = { ...progress };
    newProgress[interest] = {
        ...newProgress[interest],
        hearts: MAX_HEARTS,
        lastHeartLost: null,
    };
    setProgress(newProgress);
    saveData({ progress: newProgress });
  };

  const completeStage = (interest: string, stageId: number) => {
    if (!user) return;
    const newProgress = { ...progress };
    const interestProgress = newProgress[interest] || { unlockedStage: 1, hearts: MAX_HEARTS, lastHeartLost: null };
    
    newProgress[interest] = {
      ...interestProgress,
      unlockedStage: Math.max(interestProgress.unlockedStage, stageId + 1),
    };
    setProgress(newProgress);
    saveData({ progress: newProgress });
  };

  const resetGame = async () => {
    if (!user) return;
    const emptyProgress: Progress = {};
    interests.forEach(interest => {
      emptyProgress[interest] = { unlockedStage: 1, hearts: MAX_HEARTS, lastHeartLost: null };
    });

    setCredits(0);
    setProgress(emptyProgress);
    await saveData({ progress: emptyProgress }, { credits: 0 });
    window.location.href = '/dashboard';
  };

  return (
    <GameContext.Provider
      value={{
        user,
        credits,
        progress,
        interests,
        allInterestsComplete,
        initializeInterests,
        updateInterests,
        addCredits,
        loseHeart,
        resetHearts,
        completeStage,
        resetGame,
        isInitialized,
        manualLogin,
        manualLogout
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
