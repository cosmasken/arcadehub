import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import useWalletStore from '../stores/useWalletStore';

const WelcomeModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { isConnected } = useWalletStore();

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setIsOpen(true);
      localStorage.setItem('hasSeenTutorial', 'true');
    }
  }, []);

  const steps = [
    {
      title: 'Welcome to Retro Arcade!',
      content: 'Play classic games and earn crypto rewards. Complete challenges and climb the leaderboards!',
      button: 'Next',
    },
    {
      title: 'Connect Your Wallet',
      content: 'Connect your wallet to start playing and earning. Your progress and rewards will be saved to your wallet.',
      button: isConnected ? 'Connected!' : 'Connect Now',
    },
    {
      title: 'Play & Earn',
      content: 'Earn tokens by playing games, completing challenges, and climbing the leaderboards.',
      button: 'Let\'s Play!',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-md w-full p-6 relative">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">
            {steps[currentStep].title}
          </h2>
          <p className="text-gray-300 mb-6">
            {steps[currentStep].content}
          </p>
          
          <div className="flex justify-center space-x-2 mb-6">
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`w-2 h-2 rounded-full ${currentStep === index ? 'bg-cyan-400' : 'bg-gray-600'}`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg font-medium"
          >
            {steps[currentStep].button}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
