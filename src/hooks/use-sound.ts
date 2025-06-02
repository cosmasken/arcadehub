import { useCallback } from "react";

/**
 * Custom hook to play a sound.
 * @param {string} sound - The file path or URL of the sound to play.
 * @param {number} defaultVolume - Default volume (0 to 1).
 * @returns {function} play - Function to play the sound at a given volume.
 */
export const useSound = (sound: string, defaultVolume: number = 1) => {
  const play = useCallback(
    (volume: number = defaultVolume) => {
      if (volume !== 0) {
        const audio = new Audio(sound);
        audio.volume = volume;
        audio.play();
      }
    },
    [sound, defaultVolume]
  );

  return { play };
};