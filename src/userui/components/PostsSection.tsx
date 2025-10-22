import { useState, useMemo } from 'react';
import { PostCard } from './PostCard';
import { Clock } from 'lucide-react';
import { Button } from './ui/button';

interface Post {
  id: number;
  title: string;
  category: string;
  date: string;
  duration?: string;
  excerpt: string;
  fullDescription: string;
  instructor: string;
  image: string;
}

// Mock data
const allPosts: Post[] = [
  {
    id: 1,
    title: 'Aula de Hatha Yoga para Iniciantes',
    category: 'Hatha Yoga',
    date: '20 de Outubro, 2025',
    duration: '60 min',
    excerpt: 'Descubra os fundamentos do Hatha Yoga com posturas básicas e técnicas de respiração',
    fullDescription: 'Uma aula completa de Hatha Yoga focada em posturas básicas, alinhamento corporal e técnicas de respiração (pranayama). Ideal para quem está começando a prática e busca equilíbrio entre corpo e mente. Inclui aquecimento, sequência de asanas e relaxamento final.',
    instructor: 'Karla Rodrigues',
    image: 'https://images.unsplash.com/photo-1720788074321-47666b7a4fe1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXRoYSUyMHlvZ2ElMjBwcmFjdGljZXxlbnwxfHx8fDE3NjEwNzkzNDh8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 2,
    title: 'Meditação Guiada: Conexão Interior',
    category: 'Meditação',
    date: '19 de Outubro, 2025',
    duration: '30 min',
    excerpt: 'Jornada meditativa para reconexão profunda com seu eu interior e paz mental',
    fullDescription: 'Meditação guiada para reconexão com seu eu interior, usando técnicas de mindfulness, visualização criativa e respiração consciente. Perfeita para reduzir ansiedade, aumentar o foco e cultivar presença no momento atual.',
    instructor: 'Karla Rodrigues',
    image: 'https://images.unsplash.com/photo-1716816211509-6e7b2c82d845?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpdGF0aW9uJTIwcGVhY2VmdWx8ZW58MXx8fHwxNzYxMDE1NDA4fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 3,
    title: 'Reiki: Energia Universal e Cura',
    category: 'Reiki e Karuna',
    date: '18 de Outubro, 2025',
    excerpt: 'Explore os princípios do Reiki e o poder da energia universal para autocura',
    fullDescription: 'Artigo aprofundado sobre os princípios do Reiki e como a energia universal pode auxiliar no processo de autocura e equilíbrio energético. Descubra técnicas de canalização de energia, os cinco princípios do Reiki e como aplicá-los no dia a dia.',
    instructor: 'Karla Rodrigues',
    image: 'https://images.unsplash.com/photo-1627796062215-60edb1e2f2f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWlraSUyMGhlYWxpbmclMjBoYW5kc3xlbnwxfHx8fDE3NjEwNTQ2NTB8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 4,
    title: 'Yoga Restaurativo: Relaxamento Profundo',
    category: 'Yoga Restaurativo',
    date: '17 de Outubro, 2025',
    duration: '45 min',
    excerpt: 'Sessão terapêutica com props para alcançar relaxamento profundo e restauração',
    fullDescription: 'Sessão de Yoga Restaurativo utilizando almofadas, blocos e mantas para alcançar relaxamento profundo e restauração do sistema nervoso. Posturas passivas mantidas por longos períodos promovem cura física e mental, reduzindo estresse e fadiga.',
    instructor: 'Karla Rodrigues',
    image: 'https://images.unsplash.com/photo-1758599879693-9e06f55a4ded?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0b3JhdGl2ZSUyMHlvZ2ElMjByZWxheGF0aW9ufGVufDF8fHx8MTc2MTA3OTM0OXww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 5,
    title: 'Benefícios da Yoga Massagem Ayurvédica',
    category: 'Yoga Massagem Ayurvédica',
    date: '16 de Outubro, 2025',
    excerpt: 'Descubra a união entre massagem ayurvédica e yoga para bem-estar completo',
    fullDescription: 'Descubra como a massagem ayurvédica combinada com princípios do yoga pode transformar seu bem-estar físico e mental. Técnicas milenares indianas promovem equilíbrio dos doshas, liberação de toxinas e harmonização energética profunda.',
    instructor: 'Karla Rodrigues',
    image: 'https://images.unsplash.com/photo-1731597076108-f3bbe268162f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxheXVydmVkaWMlMjBtYXNzYWdlfGVufDF8fHx8MTc2MTA3OTM0OXww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 6,
    title: 'Os 5 Princípios do Yoga na Vida Cotidiana',
    category: 'Artigos',
    date: '15 de Outubro, 2025',
    excerpt: 'Como integrar os princípios fundamentais do yoga em sua rotina diária',
    fullDescription: 'Artigo explorando como integrar os cinco princípios fundamentais do yoga (Ahimsa, Satya, Asteya, Brahmacharya e Aparigraha) em sua rotina diária para uma vida mais equilibrada, consciente e plena. Exemplos práticos e exercícios de reflexão.',
    instructor: 'Karla Rodrigues',
    image: 'https://images.unsplash.com/photo-1758599879906-91085de59ccd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwd2lzZG9tJTIwYXJ0aWNsZXxlbnwxfHx8fDE3NjEwNzkzNTB8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 7,
    title: 'Hatha Yoga: Equilíbrio Entre Corpo e Mente',
    category: 'Hatha Yoga',
    date: '14 de Outubro, 2025',
    duration: '75 min',
    excerpt: 'Aula avançada com asanas desafiadoras e pranayama para equilíbrio energético',
    fullDescription: 'Aula avançada de Hatha Yoga explorando asanas desafiadoras, transições fluidas e técnicas avançadas de pranayama para equilíbrio energético. Inclui inversões, equilíbrios de braços e abertura profunda de quadril. Requer experiência prévia.',
    instructor: 'Karla Rodrigues',
    image: 'https://images.unsplash.com/photo-1720788074321-47666b7a4fe1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXRoYSUyMHlvZ2ElMjBwcmFjdGljZXxlbnwxfHx8fDE3NjEwNzkzNDh8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 8,
    title: 'Meditação para Redução do Estresse',
    category: 'Meditação',
    date: '13 de Outubro, 2025',
    duration: '20 min',
    excerpt: 'Técnicas eficazes para combater o estresse diário e promover calma mental',
    fullDescription: 'Técnicas de meditação especialmente desenvolvidas para combater o estresse do dia a dia e promover calma mental. Inclui body scan, respiração 4-7-8 e visualização de lugares seguros. Ideal para praticar antes de dormir ou após um dia intenso.',
    instructor: 'Karla Rodrigues',
    image: 'https://images.unsplash.com/photo-1631441961409-d350ca05f453?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx6ZW4lMjBtZWRpdGF0aW9uJTIwc3RvbmVzfGVufDF8fHx8MTc2MTA1MTI0NHww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 9,
    title: 'Workshop: Introdução ao Karuna Reiki',
    category: 'Reiki e Karuna',
    date: '12 de Outubro, 2025',
    excerpt: 'Descubra o Karuna Reiki, evolução focada em compaixão e cura profunda',
    fullDescription: 'Workshop introdutório sobre Karuna Reiki, uma evolução do Reiki tradicional focada em compaixão e cura profunda. Aprenda os símbolos sagrados, técnicas de canalização avançada e como aplicar esta modalidade em processos de cura emocional.',
    instructor: 'Karla Rodrigues',
    image: 'https://images.unsplash.com/photo-1627796062215-60edb1e2f2f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWlraSUyMGhlYWxpbmclMjBoYW5kc3xlbnwxfHx8fDE3NjEwNTQ2NTB8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 10,
    title: 'Yoga Restaurativo para Insônia',
    category: 'Yoga Restaurativo',
    date: '11 de Outubro, 2025',
    duration: '50 min',
    excerpt: 'Sequência especial para melhorar a qualidade do sono naturalmente',
    fullDescription: 'Sequência especial de Yoga Restaurativo para melhorar a qualidade do sono e combater a insônia naturalmente. Posturas suaves que acalmam o sistema nervoso, reduzem cortisol e preparam corpo e mente para um sono profundo e reparador.',
    instructor: 'Karla Rodrigues',
    image: 'https://images.unsplash.com/photo-1758599879693-9e06f55a4ded?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0b3JhdGl2ZSUyMHlvZ2ElMjByZWxheGF0aW9ufGVufDF8fHx8MTc2MTA3OTM0OXww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 11,
    title: 'Workshop de Hatha Yoga Avançado',
    category: 'Eventos',
    date: '15 de Novembro, 2025',
    excerpt: 'Aprofunde sua prática com técnicas avançadas de Hatha Yoga',
    fullDescription: 'Aprofunde sua prática com técnicas avançadas de Hatha Yoga, incluindo inversões, equilíbrios de braços e pranayamas intensivos. Workshop de dia inteiro com certificado de participação e material de apoio.',
    instructor: 'Karla Rodrigues',
    image: 'https://images.unsplash.com/photo-1517637382994-f02da38c6728?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwd29ya3Nob3AlMjBldmVudHxlbnwxfHx8fDE3NjEwNzkzNTF8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 12,
    title: 'Retiro de Meditação e Yoga',
    category: 'Eventos',
    date: '22 de Novembro, 2025',
    excerpt: 'Final de semana de imersão em práticas de yoga e meditação',
    fullDescription: 'Um final de semana completo de imersão em práticas de yoga e meditação em meio à natureza. Inclui acomodação, alimentação vegetariana e práticas guiadas pela manhã e tarde em Campos do Jordão.',
    instructor: 'Karla Rodrigues',
    image: 'https://images.unsplash.com/photo-1690229378554-d4a0b22b4019?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwcmV0cmVhdCUyMG5hdHVyZXxlbnwxfHx8fDE3NjA5NTQ1ODd8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 13,
    title: 'Curso de Reiki Nível 1',
    category: 'Eventos',
    date: '5 de Dezembro, 2025',
    excerpt: 'Inicie sua jornada no mundo do Reiki com certificação reconhecida',
    fullDescription: 'Inicie sua jornada no mundo do Reiki com certificação reconhecida internacionalmente. Aprenda os fundamentos, símbolos sagrados e técnicas de canalização de energia universal ao longo de dois dias intensivos.',
    instructor: 'Karla Rodrigues',
    image: 'https://images.unsplash.com/photo-1627796062215-60edb1e2f2f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWlraSUyMGhlYWxpbmclMjBoYW5kc3xlbnwxfHx8fDE3NjEwNTQ2NTB8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 14,
    title: 'Yoga ao Pôr do Sol',
    category: 'Eventos',
    date: '10 de Dezembro, 2025',
    excerpt: 'Prática especial de yoga ao ar livre contemplando o pôr do sol',
    fullDescription: 'Prática especial de yoga ao ar livre contemplando o pôr do sol no Parque Centenário. Aula gratuita aberta à comunidade com foco em gratidão e conexão com a natureza. Traga seu tapete!',
    instructor: 'Karla Rodrigues',
    image: 'https://images.unsplash.com/photo-1616569925882-18e6a431bba9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5zZXQlMjB5b2dhJTIwb3V0ZG9vcnxlbnwxfHx8fDE3NjEwNzkzNTF8MA&ixlib=rb-4.1.0&q=80&w=1080'
  }
];

interface PostsSectionProps {
  activeCategory: string;
}

export function PostsSection({ activeCategory }: PostsSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;

  // Filter posts based on active category
  const filteredPosts = useMemo(() => {
    if (activeCategory === 'Recentes') {
      return allPosts;
    }
    return allPosts.filter(post => post.category === activeCategory);
  }, [activeCategory]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  // Reset to page 1 when category changes
  useMemo(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  return (
    <div className="bg-white py-8">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center gap-2 mb-6">
          {activeCategory === 'Recentes' && <Clock className="w-6 h-6 text-gray-700" />}
          <h2 className="text-gray-900">
            {activeCategory === 'Recentes' ? 'RECENTES' : activeCategory.toUpperCase()}
          </h2>
        </div>

        {/* Posts Grid */}
        <div className="space-y-4 mb-8">
          {currentPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
            >
              Anterior
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first page, last page, current page, and pages around current
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`${
                      page === currentPage
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </Button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page}>...</span>;
              }
              return null;
            })}

            <Button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}