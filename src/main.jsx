import React from 'react';
import ReactDOM from 'react-dom/client';
import WorldCup2026 from './WorldCup2026.jsx';
import { polyfillCountryFlagEmojis } from "country-flag-emoji-polyfill";
import { BrowserRouter } from 'react-router-dom';

import { GameProvider } from './context/GameContext.jsx';

polyfillCountryFlagEmojis();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GameProvider>
      <BrowserRouter basename="/world-cup-2026">
        <WorldCup2026 />
      </BrowserRouter>
    </GameProvider>
  </React.StrictMode>,
);
