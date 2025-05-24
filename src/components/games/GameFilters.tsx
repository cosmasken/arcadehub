
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

interface GameFiltersProps {
  filters: {
    search: string;
    genre: string;
    sort: string;
    showDeveloperOnly: boolean;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    search: string;
    genre: string;
    sort: string;
    showDeveloperOnly: boolean;
  }>>;
}

const GameFilters = ({ filters, setFilters }: GameFiltersProps) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleGenreChange = (value: string) => {
    setFilters(prev => ({ ...prev, genre: value }));
  };

  const handleSortChange = (value: string) => {
    setFilters(prev => ({ ...prev, sort: value }));
  };

  const handleDeveloperToggle = (checked: boolean) => {
    setFilters(prev => ({ ...prev, showDeveloperOnly: checked }));
  };

  return (
    <div className="bg-secondary rounded-lg border border-muted/20 p-4 sticky top-20">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>
      
      {/* Search */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-2.5 top-2.5 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search games..."
          value={filters.search}
          onChange={handleSearchChange}
          className="pl-9 bg-muted border-muted/30 focus-visible:ring-arcade-purple"
        />
      </div>
      
      {/* Genre Filter */}
      <div className="mb-4">
        <Label htmlFor="genre-filter" className="text-sm text-muted-foreground mb-1.5 block">
          Genre
        </Label>
        <Select value={filters.genre} onValueChange={handleGenreChange}>
          <SelectTrigger id="genre-filter" className="w-full bg-muted border-muted/30 focus-visible:ring-arcade-purple">
            <SelectValue placeholder="All genres" />
          </SelectTrigger>
          <SelectContent className="bg-secondary border-muted/30">
            <SelectItem value="all">All genres</SelectItem>
            <SelectItem value="Arcade">Arcade</SelectItem>
            <SelectItem value="Puzzle">Puzzle</SelectItem>
            <SelectItem value="Racing">Racing</SelectItem>
            <SelectItem value="Idle">Idle</SelectItem>
            <SelectItem value="Adventure">Adventure</SelectItem>
            <SelectItem value="Simulation">Simulation</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Sort By */}
      <div className="mb-5">
        <Label htmlFor="sort-by" className="text-sm text-muted-foreground mb-1.5 block">
          Sort by
        </Label>
        <Select value={filters.sort} onValueChange={handleSortChange}>
          <SelectTrigger id="sort-by" className="w-full bg-muted border-muted/30 focus-visible:ring-arcade-purple">
            <SelectValue placeholder="Most popular" />
          </SelectTrigger>
          <SelectContent className="bg-secondary border-muted/30">
            <SelectItem value="popular">Most popular</SelectItem>
            <SelectItem value="rating">Highest rating</SelectItem>
            <SelectItem value="a-z">A to Z</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Developer Toggle */}
      <div className="flex items-center justify-between">
        <Label htmlFor="developer-toggle" className="cursor-pointer">
          Show developer games only
        </Label>
        <Switch
          id="developer-toggle"
          checked={filters.showDeveloperOnly}
          onCheckedChange={handleDeveloperToggle}
        />
      </div>
    </div>
  );
};

export default GameFilters;
