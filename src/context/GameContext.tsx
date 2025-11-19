'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, getDoc, DocumentData, serverTimestamp } from 'firebase/firestore';


type Progress = {
  [interest: string]: {
    unlockedStage: number;
    hearts: number;
    lastHeartLost: number | null;
  };
};

type GameData = {
    credits: number;
    progress: Progress;
    interests: string[];
};

type GameContextType = {
  credits: number;
  progress: Progress;
  interests: string[];
  initializeInterests: (interests: string[]) => void;
  addCredits: (amount: number) => void;
  loseHeart: (interest: string) => void;
  resetHearts: (interest: string) => void;
  completeStage: (interest: string, stageId: number) => void;
  resetGame: () => void;
  isInitialized: boolean;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

const MAX_HEARTS = 3;
const HEART_REGEN_TIME = 20 * 1000; // 20 seconds

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const { user, isInitializing: userIsInitializing } = useUser();
  const firestore = useFirestore();

  const [credits, setCredits] = useState<number>(0);
  const [progress, setProgress] = useState<Progress>({});
  const [interests, setInterests] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const saveData = useCallback(async (data: Partial<GameData>) => {
      if (!firestore || !user) return;
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        await setDoc(userDocRef, data, { merge: true });
      } catch (error) {
          console.error("Failed to save game data:", error);
      }
  }, [firestore, user]);

  useEffect(() => {
    const loadData = async () => {
        if (user && firestore) {
            const userDocRef = doc(firestore, 'users', user.uid);
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                const data = docSnap.data() as GameData;
                setCredits(data.credits || 0);
                setProgress(data.progress || {});
                setInterests(data.interests || []);
            } else {
              // Create initial document for new user
              await saveData({ credits: 0, progress: {}, interests: [] });
            }
            setIsInitialized(true);
        } else if (!user && !userIsInitializing) {
            // Handle case where user is logged out
            setIsInitialized(true);
            setCredits(0);
            setProgress({});
            setInterests([]);
        }
    };
    loadData();
  }, [user, firestore, userIsInitializing, saveData]);


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
    const newProgress = { ...progress };
    let updated = false;
    newInterests.forEach(interest => {
        if (!newProgress[interest]) {
            newProgress[interest] = { unlockedStage: 1, hearts: MAX_HEARTS, lastHeartLost: null };
            updated = true;
        }
    });

    if (updated) {
        setProgress(newProgress);
        setInterests(newInterests);
        await saveData({ progress: newProgress, interests: newInterests });
    } else if (JSON.stringify(interests) !== JSON.stringify(newInterests)) {
        setInterests(newInterests);
        await saveData({ interests: newInterests });
    }
  }, [progress, saveData, interests]);

  const addCredits = (amount: number) => {
    const newCredits = credits + amount;
    setCredits(newCredits);
    saveData({ credits: newCredits });
  };

  const loseHeart = (interest: string) => {
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
    const emptyProgress: Progress = {};
    interests.forEach(interest => {
      emptyProgress[interest] = { unlockedStage: 1, hearts: MAX_HEARTS, lastHeartLost: null };
    });

    setCredits(0);
    setProgress(emptyProgress);
    // Keep interests, just reset progress and credits
    await saveData({ credits: 0, progress: emptyProgress });
    // Navigate to dashboard after reset
    window.location.href = '/dashboard';
  };

  return (
    <GameContext.Provider
      value={{
        credits,
        progress,
        interests,
        initializeInterests,
        addCredits,
        loseHeart,
        resetHearts,
        completeStage,
        resetGame,
        isInitialized: isInitialized && !userIsInitializing
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
