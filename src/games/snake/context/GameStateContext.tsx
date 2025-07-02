import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Game State Types
export interface GameSettings {
    useWASD: boolean;
    soundEnabled: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
    theme: 'classic' | 'neon' | 'retro';
}

export interface GameUIState {
    shopOpen: boolean;
    settingsOpen: boolean;
    achievementsOpen: boolean;
    showLoginPrompt: boolean;
    isInitialized: boolean;
}

export interface CombinedGameState {
    settings: GameSettings;
    ui: GameUIState;
}

// Action Types
type GameStateAction =
    | { type: 'TOGGLE_SHOP'; payload?: boolean }
    | { type: 'TOGGLE_SETTINGS'; payload?: boolean }
    | { type: 'TOGGLE_ACHIEVEMENTS'; payload?: boolean }
    | { type: 'TOGGLE_LOGIN_PROMPT'; payload?: boolean }
    | { type: 'SET_INITIALIZED'; payload: boolean }
    | { type: 'UPDATE_SETTINGS'; payload: Partial<GameSettings> }
    | { type: 'CLOSE_ALL_MODALS' }
    | { type: 'RESET_STATE' };

// Initial State
const initialState: CombinedGameState = {
    settings: {
        useWASD: false,
        soundEnabled: true,
        difficulty: 'medium',
        theme: 'neon',
    },
    ui: {
        shopOpen: false,
        settingsOpen: false,
        achievementsOpen: false,
        showLoginPrompt: false,
        isInitialized: false,
    },
};

// Reducer
function gameStateReducer(state: CombinedGameState, action: GameStateAction): CombinedGameState {
    switch (action.type) {
        case 'TOGGLE_SHOP':
            return {
                ...state,
                ui: {
                    ...state.ui,
                    shopOpen: action.payload !== undefined ? action.payload : !state.ui.shopOpen,
                    settingsOpen: false,
                    achievementsOpen: false,
                },
            };

        case 'TOGGLE_SETTINGS':
            return {
                ...state,
                ui: {
                    ...state.ui,
                    settingsOpen: action.payload !== undefined ? action.payload : !state.ui.settingsOpen,
                    shopOpen: false,
                    achievementsOpen: false,
                },
            };

        case 'TOGGLE_ACHIEVEMENTS':
            return {
                ...state,
                ui: {
                    ...state.ui,
                    achievementsOpen: action.payload !== undefined ? action.payload : !state.ui.achievementsOpen,
                    shopOpen: false,
                    settingsOpen: false,
                },
            };

        case 'TOGGLE_LOGIN_PROMPT':
            return {
                ...state,
                ui: {
                    ...state.ui,
                    showLoginPrompt: action.payload !== undefined ? action.payload : !state.ui.showLoginPrompt,
                },
            };

        case 'SET_INITIALIZED':
            return {
                ...state,
                ui: {
                    ...state.ui,
                    isInitialized: action.payload,
                },
            };

        case 'UPDATE_SETTINGS':
            return {
                ...state,
                settings: {
                    ...state.settings,
                    ...action.payload,
                },
            };

        case 'CLOSE_ALL_MODALS':
            return {
                ...state,
                ui: {
                    ...state.ui,
                    shopOpen: false,
                    settingsOpen: false,
                    achievementsOpen: false,
                    showLoginPrompt: false,
                },
            };

        case 'RESET_STATE':
            return initialState;

        default:
            return state;
    }
}

// Context
interface GameStateContextType {
    state: CombinedGameState;
    dispatch: React.Dispatch<GameStateAction>;

    // Helper functions
    openShop: () => void;
    closeShop: () => void;
    openSettings: () => void;
    closeSettings: () => void;
    openAchievements: () => void;
    closeAchievements: () => void;
    showLogin: () => void;
    hideLogin: () => void;
    updateSettings: (settings: Partial<GameSettings>) => void;
    closeAllModals: () => void;
    playSound: (type: 'eat' | 'die' | 'buy' | 'click') => void;
}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

// Provider Component
interface GameStateProviderProps {
    children: ReactNode;
}

export const GameStateProvider: React.FC<GameStateProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(gameStateReducer, initialState);

    // Sound effects
    const playSound = React.useCallback((type: 'eat' | 'die' | 'buy' | 'click') => {
        if (!state.settings.soundEnabled) return;

        try {
            const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            const audioContext = new AudioContextClass();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            switch (type) {
                case 'eat':
                    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                    break;
                case 'die':
                    oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
                    break;
                case 'buy':
                    oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
                    break;
                case 'click':
                    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
                    break;
            }

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            console.warn('Audio playback failed:', error);
        }
    }, [state.settings.soundEnabled]);

    // Helper functions
    const openShop = () => dispatch({ type: 'TOGGLE_SHOP', payload: true });
    const closeShop = () => dispatch({ type: 'TOGGLE_SHOP', payload: false });
    const openSettings = () => dispatch({ type: 'TOGGLE_SETTINGS', payload: true });
    const closeSettings = () => dispatch({ type: 'TOGGLE_SETTINGS', payload: false });
    const openAchievements = () => dispatch({ type: 'TOGGLE_ACHIEVEMENTS', payload: true });
    const closeAchievements = () => dispatch({ type: 'TOGGLE_ACHIEVEMENTS', payload: false });
    const showLogin = () => dispatch({ type: 'TOGGLE_LOGIN_PROMPT', payload: true });
    const hideLogin = () => dispatch({ type: 'TOGGLE_LOGIN_PROMPT', payload: false });
    const updateSettings = (settings: Partial<GameSettings>) => dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
    const closeAllModals = () => dispatch({ type: 'CLOSE_ALL_MODALS' });

    const contextValue: GameStateContextType = {
        state,
        dispatch,
        openShop,
        closeShop,
        openSettings,
        closeSettings,
        openAchievements,
        closeAchievements,
        showLogin,
        hideLogin,
        updateSettings,
        closeAllModals,
        playSound,
    };

    return <GameStateContext.Provider value={contextValue}>{children}</GameStateContext.Provider>;
};

// Hook
export const useGameState = (): GameStateContextType => {
    const context = useContext(GameStateContext);
    if (context === undefined) {
        throw new Error('useGameState must be used within a GameStateProvider');
    }
    return context;
};
