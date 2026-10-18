import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { DocumentProvider } from './context/DocumentContext';
import { LandingPage } from './pages/LandingPage';
import { OverviewPage } from './pages/OverviewPage';
import { ChatPage } from './pages/ChatPage';

export function App() {
  return (
    <ThemeProvider>
      <DocumentProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DocumentProvider>
    </ThemeProvider>
  );
}

export default App;
