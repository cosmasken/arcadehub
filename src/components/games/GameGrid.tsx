import { useState, useEffect } from 'react';
import GameCard, { Game } from './GameCard';
import GameFilters from './GameFilters';
import { Link } from 'react-router-dom';
import clickerlogo from '../../assets/clicker.jpg';
import spintowin from '../../assets/spintowin.png';
import tictactoe from '../../assets/tictactoe.png';
import memorygame from '../../assets/memory-game.png';

// Mock data for games
const MOCK_GAMES: Game[] = [
 
  {
    id: "clicker",
    title: "Clicker Craze",
    thumbnail: clickerlogo,
    genre: "Idle",
    plays: 20548,
    rating: 3.9,
    url: "/games/clicker"
  },
  {
    id: "tic-tac-toe",
    title: "Tic Tac Toe",
    thumbnail: tictactoe,
    genre: "Puzzle",
    plays: 5000,
    rating: 4.5,
    url: "/games/tic-tac-toe"
  },
  {
    id: "memory-game",
    title: "Memory Match",
    thumbnail: memorygame,
    genre: "Puzzle",
    plays: 3800,
    rating: 4.4,
    url: "/games/memory-game"
  },
  {
    id: "spin-to-win",
    title: "Spin to Win",
    thumbnail: spintowin,
    genre: "Casino",
    plays: 6200,
    rating: 4.6,
    url: "/games/spin-to-win"
  }

];

type FilterOptions = {
  search: string;
  genre: string;
  sort: string;
  showDeveloperOnly: boolean;
};

const GameGrid = () => {
  const [games, setGames] = useState<Game[]>(MOCK_GAMES);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    genre: 'all',
    sort: 'popular',
    showDeveloperOnly: false,
  });

  // Update filtered games whenever filters change
  useEffect(() => {
    let filtered = [...MOCK_GAMES];

    // Filter by search term
    if (filters.search) {
      filtered = filtered.filter(game => 
        game.title.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filter by genre
    if (filters.genre !== 'all') {
      filtered = filtered.filter(game => game.genre === filters.genre);
    }

    // Filter developer games
    if (filters.showDeveloperOnly) {
      filtered = filtered.filter(game => game.developer);
    }

    // Sort results
    switch (filters.sort) {
      case 'popular':
        filtered.sort((a, b) => b.plays - a.plays);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'a-z':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    setGames(filtered);
  }, [filters]);

  return (
    <div className="container mx-auto px-4 mt-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <GameFilters filters={filters} setFilters={setFilters} />
        </div>
        
        {/* Game grid */}
        <div className="flex-1">
          {games.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map(game => (
                <Link 
                  key={game.id}
                  to={game.url || `/games/${game.id}`} 
                  className="block transition-transform hover:scale-105"
                >
                  <GameCard game={game} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-secondary/50 rounded-lg border border-muted/20">
              <p className="text-white/70">No games found with these filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameGrid;
