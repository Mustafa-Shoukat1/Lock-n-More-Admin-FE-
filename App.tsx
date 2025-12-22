import React, { useState, createContext, useContext } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import AIManager from './pages/AIManager';
import Products from './pages/Products';
import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement';
import { Language } from './types';
import { translations } from './i18n';

interface LangContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
}

export const LangContext = createContext<LangContextType | undefined>(undefined);

export const useTranslation = () => {
  const context = useContext(LangContext);
  if (!context) throw new Error("useTranslation must be used within LangProvider");
  return context;
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');

  const t = (key: keyof typeof translations['en']) => {
    return translations[lang][key] || key;
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      <Router>
        <div className="flex h-screen overflow-hidden bg-primary transition-colors duration-300">
          <Sidebar />
          <div className="flex flex-col flex-1 w-0 overflow-hidden">
            <Header />
            <main className="flex-1 relative overflow-y-auto focus:outline-none">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/inbox" element={<Inbox />} />
                <Route path="/ai-manager" element={<AIManager />} />
                <Route path="/products" element={<Products />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </LangContext.Provider>
  );
};

export default App;