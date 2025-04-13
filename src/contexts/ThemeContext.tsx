import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Her zaman 'dark' temayı kullanacağız
  const [theme] = useState<Theme>('dark');

  useEffect(() => {
    // Dark modunu zorla uygula
    document.documentElement.classList.add('dark');
  }, []);

  // Tema değiştirme fonksiyonu artık işlevsiz
  const toggleTheme = () => {
    // Hiçbir şey yapmıyor
    console.log('Tema değiştirme şimdilik devre dışı.');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
