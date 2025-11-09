import React, { useState, useEffect } from 'react';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import './ThemeSwitch.scss';

interface ThemeSwitchProps {
  onThemeChange?: (isDark: boolean) => void;
}

const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ onThemeChange }) => {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    // Check localStorage for saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      // Check system preference if no saved theme
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(systemPrefersDark);
      document.documentElement.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
    }
  }, []);

  const handleToggle = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    const theme = newTheme ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    onThemeChange?.(newTheme);
  };

  return (
    <div className="theme-switch">
      <label className={`switch`}>
        <span className="visually-hidden">{isDark ? 'light mode' : 'dark mode'}</span>
        <input type="checkbox" checked={isDark} onChange={handleToggle} className="switch-input" />
        <span className="slider">
          <span className="icon">{isDark ? <MoonOutlined /> : <SunOutlined />}</span>
        </span>
      </label>
    </div>
  );
};

export default ThemeSwitch;
