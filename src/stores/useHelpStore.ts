import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Extend Window interface for help development helpers
declare global {
  interface Window {
    helpStore?: {
      resetHelp: () => void;
      showHelp: (helpId: string) => void;
      toggleDevMode: () => void;
      listShownHelp: () => string[];
    };
  }
}

interface HelpState {
  // Track which help items have been shown
  shownHelp: Set<string>;
  // Control global help visibility
  helpEnabled: boolean;
  // Development mode - always show help
  devMode: boolean;
  
  // Actions
  markHelpShown: (helpId: string) => void;
  hasHelpBeenShown: (helpId: string) => boolean;
  resetAllHelp: () => void;
  toggleHelpEnabled: () => void;
  setDevMode: (enabled: boolean) => void;
  
  // Force show specific help
  forceShowHelp: (helpId: string) => void;
  activeForceHelp: string | null;
  clearForceHelp: () => void;
}

const useHelpStore = create<HelpState>()(
  persist(
    (set, get) => ({
      shownHelp: new Set<string>(),
      helpEnabled: true,
      devMode: process.env.NODE_ENV === 'development',
      activeForceHelp: null,

      markHelpShown: (helpId: string) => {
        const currentShown = get().shownHelp;
        const newShown = new Set(currentShown);
        newShown.add(helpId);
        set({ shownHelp: newShown });
      },

      hasHelpBeenShown: (helpId: string) => {
        return get().shownHelp.has(helpId);
      },

      resetAllHelp: () => {
        set({ shownHelp: new Set<string>() });
      },

      toggleHelpEnabled: () => {
        set({ helpEnabled: !get().helpEnabled });
      },

      setDevMode: (enabled: boolean) => {
        set({ devMode: enabled });
      },

      forceShowHelp: (helpId: string) => {
        set({ activeForceHelp: helpId });
      },

      clearForceHelp: () => {
        set({ activeForceHelp: null });
      },
    }),
    {
      name: 'arcade-help-store',
      // Only persist certain fields
      partialize: (state) => ({
        shownHelp: Array.from(state.shownHelp), // Convert Set to Array for persistence
        helpEnabled: state.helpEnabled,
      }),
      // Convert back from Array to Set when loading
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.shownHelp)) {
          state.shownHelp = new Set(state.shownHelp as string[]);
        }
      },
    }
  )
);

// Development helpers
if (typeof window !== 'undefined') {
  window.helpStore = {
    resetHelp: () => useHelpStore.getState().resetAllHelp(),
    showHelp: (helpId: string) => useHelpStore.getState().forceShowHelp(helpId),
    toggleDevMode: () => useHelpStore.getState().setDevMode(!useHelpStore.getState().devMode),
    listShownHelp: () => Array.from(useHelpStore.getState().shownHelp),
  };
}

export default useHelpStore;
