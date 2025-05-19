import { useState, useEffect } from 'react';
import GameCard, { Game } from './GameCard';
import GameFilters from './GameFilters';
import { Link } from 'react-router-dom';

// Mock data for games
const MOCK_GAMES: Game[] = [
  {
    id: "star-blaster",
    title: "Star Blaster",
    thumbnail: "https://images.unsplash.com/photo-1538641297814-26eb2ae7b485?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    genre: "Arcade",
    plays: 15432,
    rating: 4.5
  },
  {
    id: "puzzle-pop",
    title: "Puzzle Pop",
    thumbnail: "https://images.unsplash.com/photo-1536751048178-14c1807eb1a9?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    genre: "Puzzle",
    plays: 12050,
    rating: 4.8
  },
  {
    id: "turbo-dash",
    title: "Turbo Dash",
    thumbnail: "https://images.unsplash.com/photo-1533236897111-3e94666b2edf?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    genre: "Racing",
    plays: 8721,
    rating: 4.2
  },
  {
    id: "clicker-craze",
    title: "Clicker Craze",
    thumbnail: "https://images.unsplash.com/photo-1607016284318-d1384bf5edd1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    genre: "Idle",
    plays: 20548,
    rating: 3.9,
    url: "/games/clicker" // Added direct URL to our new Clicker game
  },
  {
    id: "alien-quest",
    title: "Alien Quest",
    thumbnail: "https://images.unsplash.com/photo-1569701813229-33284b643e3c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    genre: "Adventure",
    plays: 5829,
    rating: 4.7,
    developer: "GameStudio"
  },
  {
    id: "space-explorer",
    title: "Space Explorer",
    thumbnail: "https://images.unsplash.com/photo-1581822261290-991b38693823?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    genre: "Simulation",
    plays: 4215,
    rating: 4.3
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
                  to={game.url || `/game/${game.id}`} 
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
