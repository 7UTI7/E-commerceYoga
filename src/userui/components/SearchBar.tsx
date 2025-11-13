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
    <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
            <Input
              type="text"
              placeholder="Pesquisar Artigos e Videos"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 pr-12 py-6 bg-white border-purple-200 focus:border-purple-400 focus:ring-purple-400 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={handleClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-600 transition-colors"
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