import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocalStorageState } from '../hooks/useLocalStorageState';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [favoriteTeam, setFavoriteTeam] = useLocalStorageState('wc2026_favTeam', null);
  const [achievements, setAchievements] = useLocalStorageState('wc2026_achieves', []);

  // Use a small wrapper to add achievements
  const unlockAchievement = (id, params) => {
    setAchievements((prev) => {
      // Check if already unlocked
      if (prev.find(a => a.id === id)) return prev;
      return [...prev, { id, date: new Date().toLocaleDateString('es'), ...params }];
    });
  };

  return (
    <GameContext.Provider value={{ favoriteTeam, setFavoriteTeam, achievements, unlockAchievement }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameConfig() {
  return useContext(GameContext);
}
