'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

type Progress = {
  [interest: string]: {
    unlockedStage: number;
    hearts: number;
  };
};

type GameContextType = {
  credits: number;
  progress: Progress;
  initializeProgress: (interests: string[]) => void;
  addCredits: (amount: number) => void;
  loseHeart: (interest: string) => void;
  resetHearts: (interest: string) => void;
  completeStage: (interest: string, stageId: number) => void;
  resetGame: () => void;
  isInitialized: boolean;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

const MAX_HEARTS = 3;

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [credits, setCredits] = useState<number>(0);
  const [progress, setProgress] = useState<Progress>({});
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const savedCredits = localStorage.getItem('gameCredits');
      const savedProgress = localStorage.getItem('gameProgress');
      if (savedCredits) {
        setCredits(JSON.parse(savedCredits));
      }
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      }
    } catch (error) {
      console.error('Failed to load game state from localStorage', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('gameCredits', JSON.stringify(credits));
      } catch (error) {
        console.error('Failed to save credits to localStorage', error);
      }
    }
  }, [credits, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('gameProgress', JSON.stringify(progress));
      } catch (error) {
        console.error('Failed to save progress to localStorage', error);
      }
    }
  }, [progress, isInitialized]);

  const initializeProgress = useCallback((interests: string[]) => {
    setProgress(prev => {
        const newProgress = { ...prev };
        let updated = false;
        interests.forEach(interest => {
            if (!newProgress[interest]) {
                newProgress[interest] = { unlockedStage: 1, hearts: MAX_HEARTS };
                updated = true;
            }
        });
        return updated ? newProgress : prev;
    });
  }, []);

  const addCredits = (amount: number) => {
    setCredits(prev => prev + amount);
  };

  const loseHeart = (interest: string) => {
    setProgress(prev => ({
      ...prev,
      [interest]: {
        ...prev[interest],
        hearts: Math.max(0, (prev[interest]?.hearts || MAX_HEARTS) - 1),
      },
    }));
  };

  const resetHearts = (interest: string) => {
    setProgress(prev => ({
      ...prev,
      [interest]: {
        ...prev[interest],
        hearts: MAX_HEARTS,
      },
    }));
  };

  const completeStage = (interest: string, stageId: number) => {
    setProgress(prev => ({
      ...prev,
      [interest]: {
        ...prev[interest],
        unlockedStage: Math.max(prev[interest]?.unlockedStage || 1, stageId + 1),
      },
    }));
  };

  const resetGame = () => {
    setCredits(0);
    setProgress({});
    try {
      localStorage.removeItem('gameCredits');
      localStorage.removeItem('gameProgress');
    } catch (error) {
      console.error('Failed to reset game state in localStorage', error);
    }
  };

  return (
    <GameContext.Provider
      value={{
        credits,
        progress,
        initializeProgress,
        addCredits,
        loseHeart,
        resetHearts,
        completeStage,
        resetGame,
        isInitialized
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
