import { create } from "zustand";

// 1. Define a base type for settings data only
export interface SettingsData {
  walletAddress: string;
  notificationEmails: boolean;
  notificationPushes: boolean;
  notificationUpdates: boolean;
  profileVisibility: string; // "public" | "friends" | "private"
  language: string; // "en" | "es" | "fr" | "de" | "ja" | "zh"
  highContrast: boolean;
  fontSize: string; // "small" | "medium" | "large"
  soundEffects: boolean;
  musicVolume: string; // "off" | "low" | "medium" | "high"
  autoSaveEnabled: boolean;
}

// 2. Extend the store type from the base type
export interface SettingsState extends SettingsData {
  setSetting: <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => void;
  setAll: (values: Partial<SettingsData>) => void;
  reset: () => void;
}

const defaultSettings: SettingsData = {
  walletAddress: "",
  notificationEmails: true,
  notificationPushes: true,
  notificationUpdates: false,
  profileVisibility: "public",
  language: "en",
  highContrast: false,
  fontSize: "medium",
  soundEffects: true,
  musicVolume: "medium",
  autoSaveEnabled: true,
};

export const useSettingsStore = create<SettingsState>((set) => ({
  ...defaultSettings,
  setSetting: (key, value) =>
    set((state) => ({
      ...state,
      [key]: value,
    })),
  setAll: (values) =>
    set((state) => ({
      ...state,
      ...values,
    })),
  reset: () => set(defaultSettings),
}));