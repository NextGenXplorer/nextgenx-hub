import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTheme, themeNames } from '../theme/colors';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(false);
    const [themeName, setThemeName] = useState('classic'); // default theme
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedMode = await AsyncStorage.getItem('themeMode');
            const savedTheme = await AsyncStorage.getItem('themeName');

            if (savedMode !== null) {
                setIsDark(savedMode === 'dark');
            }
            if (savedTheme !== null && themeNames.includes(savedTheme)) {
                setThemeName(savedTheme);
            }
        } catch (error) {
            console.error('Error loading theme:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleTheme = async () => {
        try {
            const newMode = !isDark;
            setIsDark(newMode);
            await AsyncStorage.setItem('themeMode', newMode ? 'dark' : 'light');
        } catch (error) {
            console.error('Error saving theme mode:', error);
        }
    };

    const changeTheme = async (newThemeName) => {
        try {
            if (themeNames.includes(newThemeName)) {
                setThemeName(newThemeName);
                await AsyncStorage.setItem('themeName', newThemeName);
            }
        } catch (error) {
            console.error('Error saving theme name:', error);
        }
    };

    const theme = getTheme(themeName, isDark);

    if (loading) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{
            theme,
            isDark,
            themeName,
            toggleTheme,
            changeTheme,
            availableThemes: themeNames
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
