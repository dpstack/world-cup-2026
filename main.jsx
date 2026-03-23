import React from 'react'
import ReactDOM from 'react-dom/client'
import WorldCup2026 from './WorldCup2026.jsx'
import { polyfillCountryFlagEmojis } from "country-flag-emoji-polyfill";

polyfillCountryFlagEmojis();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WorldCup2026 />
  </React.StrictMode>,
)
