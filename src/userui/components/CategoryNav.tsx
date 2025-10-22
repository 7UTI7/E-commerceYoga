interface CategoryNavProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  'Recentes',
  'Hatha Yoga',
  'Reiki e Karuna',
  'Yoga Restaurativo',
  'Yoga Massagem Ayurvédica',
  'Artigos',
  'Meditação',
  'Eventos'
];

export function CategoryNav({ activeCategory, onCategoryChange }: CategoryNavProps) {
  return (
    <nav className="sticky top-[72px] z-40 bg-purple-700 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className="flex items-center justify-center gap-6 py-3 overflow-x-auto">
          {categories.map((category) => (
            <li key={category}>
              <button
                onClick={() => onCategoryChange(category)}
                className={`text-white whitespace-nowrap px-3 py-2 rounded transition-all hover:bg-purple-600 ${
                  activeCategory === category ? 'bg-purple-600' : ''
                }`}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
