'use client';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';
import { useGame } from '@/context/GameContext';

export function useUser() {
  const { user, isInitialized } = useGame();
  
  return { user, isInitializing: !isInitialized };
}
