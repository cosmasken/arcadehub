
import React, { useEffect, useState } from "react";
import { Progress } from "../../../components/ui/progress";

interface LoadingScreenProps {
  onLoadComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadComplete }) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Initializing...");

  useEffect(() => {
    const loadingSteps = [
      { progress: 20, text: "Loading honey jars..." },
      { progress: 40, text: "Preparing bees..." },
      { progress: 60, text: "Setting up shop..." },
      { progress: 80, text: "Loading achievements..." },
      { progress: 100, text: "Ready to collect honey!" }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < loadingSteps.length) {
        setProgress(loadingSteps[currentStep].progress);
        setLoadingText(loadingSteps[currentStep].text);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(onLoadComplete, 500);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [onLoadComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center z-50">
      <div className="text-center space-y-6 max-w-md mx-auto p-8">
        <div className="text-8xl animate-bounce">🍯</div>
        <h1 className="text-4xl font-bold text-amber-800 mb-4">Honey Clicker</h1>
        <div className="space-y-4">
          <Progress value={progress} className="w-full h-3" />
          <p className="text-amber-600 text-lg">{loadingText}</p>
        </div>
      </div>
    </div>
  );
};
