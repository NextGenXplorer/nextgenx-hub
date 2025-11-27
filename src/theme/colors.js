// NextGenX Vibrant Theme - Orange, Yellow, White
// Modern, playful, premium design

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
};

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    round: 50,
};

export const fontSize = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    xxxl: 40,
};

export const fontWeight = {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
};

// Vibrant Orange/Yellow Theme
export const lightTheme = {
    // Primary Colors - Vibrant Orange
    primary: '#FF8C42',
    primaryLight: '#FFB380',
    primaryDark: '#FF6B00',

    // Secondary Colors - Bright Yellow
    secondary: '#FFC107',
    secondaryLight: '#FFD54F',
    secondaryDark: '#FFA000',

    // Backgrounds
    background: '#FFFFFF',
    backgroundSecondary: '#FFF9E6', // Light yellow tint
    backgroundCard: '#FFFFFF',
    backgroundGradient: 'linear-gradient(135deg, #FF8C42 0%, #FFC107 100%)',

    // Text
    text: '#2C2C2C',
    textSecondary: '#757575',
    textInverse: '#FFFFFF',
    textOnOrange: '#FFFFFF',

    // UI Elements
    border: '#F0F0F0',
    borderLight: '#F8F8F8',
    shadow: 'rgba(255, 140, 66, 0.15)',
    shadowDark: 'rgba(0, 0, 0, 0.08)',

    // Status Colors
    success: '#4CAF50',
    error: '#FF5252',
    warning: '#FFC107',
    info: '#42A5F5',

    // Accent Colors
    accent1: '#FFE082', // Light yellow
    accent2: '#FFAB91', // Light orange
    accent3: '#FFF3E0', // Very light orange
};

export const darkTheme = {
    // Primary Colors
    primary: '#FF8C42',
    primaryLight: '#FFB380',
    primaryDark: '#FF6B00',

    // Secondary Colors
    secondary: '#FFC107',
    secondaryLight: '#FFD54F',
    secondaryDark: '#FFA000',

    // Backgrounds
    background: '#1A1A1A',
    backgroundSecondary: '#2C2C2C',
    backgroundCard: '#242424',
    backgroundGradient: 'linear-gradient(135deg, #FF8C42 0%, #FFC107 100%)',

    // Text
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textInverse: '#2C2C2C',
    textOnOrange: '#FFFFFF',

    // UI Elements
    border: '#3A3A3A',
    borderLight: '#2C2C2C',
    shadow: 'rgba(255, 140, 66, 0.2)',
    shadowDark: 'rgba(0, 0, 0, 0.3)',

    // Status Colors
    success: '#66BB6A',
    error: '#EF5350',
    warning: '#FFC107',
    info: '#42A5F5',

    // Accent Colors
    accent1: '#FFE082',
    accent2: '#FFAB91',
    accent3: '#FFF3E0',
};

// Shadow Styles
export const shadows = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: '#FF8C42',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },
    large: {
        shadowColor: '#FF8C42',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
};
