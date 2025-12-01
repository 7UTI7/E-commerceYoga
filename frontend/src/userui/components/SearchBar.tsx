import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './ui/input';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <div className="bg-gradient-to-r">
      <div className="container mx-auto px-4 py-10">
        <div className="w-full mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-800" />
            <Input
              type="text"
              placeholder="Pesquisar Artigos e Videos"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-16 pr-12 py-8 bg-white border-purple-200 focus:border-purple-800 focus:ring-purple-800 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={handleClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-800 hover:text-purple-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {searchQuery && (
            <div className="mt-3 text-sm text-purple-700">
              Pesquisando por: <span className="font-medium">"{searchQuery}"</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default SearchBar;