
import React, { useState } from 'react';
import { GameLibrary } from '../components/GameLibrary';
import { GameView } from '../components/GameView';
// import { Header } from '../components/Header';

 interface Game {
  id: string;
  title: string;
  thumbnail: string;
  category: string;
  description: string;
  rating: number;
  plays: string;
}

const Index = () => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const handleGameSelect = (game: Game) => {
    setSelectedGame(game);
  };

  const handleBackToLibrary = () => {
    setSelectedGame(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* <Header /> */}
      {selectedGame ? (
        <GameView game={selectedGame} onBack={handleBackToLibrary} />
      ) : (
        <GameLibrary onGameSelect={handleGameSelect} />
      )}
    </div>
  );
};

export default Index;
