import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Clock } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
  image: string;
}

const events: Event[] = [
  {
    id: 1,
    title: 'Workshop de Hatha Yoga Avançado',
    date: '15 de Novembro, 2025',
    location: 'Studio Karla Rodrigues - Shangrilá',
    description: 'Aprofunde sua prática com técnicas avançadas de Hatha Yoga, incluindo inversões, equilíbrios de braços e pranayamas intensivos. Workshop de dia inteiro com certificado de participação.',
    image: 'https://images.unsplash.com/photo-1517637382994-f02da38c6728?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwd29ya3Nob3AlMjBldmVudHxlbnwxfHx8fDE3NjEwNzkzNTF8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 2,
    title: 'Retiro de Meditação e Yoga',
    date: '22 de Novembro, 2025',
    location: 'Campos do Jordão - SP',
    description: 'Um final de semana completo de imersão em práticas de yoga e meditação em meio à natureza. Inclui acomodação, alimentação vegetariana e práticas guiadas pela manhã e tarde.',
    image: 'https://images.unsplash.com/photo-1690229378554-d4a0b22b4019?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwcmV0cmVhdCUyMG5hdHVyZXxlbnwxfHx8fDE3NjA5NTQ1ODd8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 3,
    title: 'Curso de Reiki Nível 1',
    date: '5 de Dezembro, 2025',
    location: 'Studio Karla Rodrigues - Shangrilá',
    description: 'Inicie sua jornada no mundo do Reiki com certificação reconhecida internacionalmente. Aprenda os fundamentos, símbolos sagrados e técnicas de canalização de energia universal.',
    image: 'https://images.unsplash.com/photo-1627796062215-60edb1e2f2f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWlraSUyMGhlYWxpbmclMjBoYW5kc3xlbnwxfHx8fDE3NjEwNTQ2NTB8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 4,
    title: 'Yoga ao Pôr do Sol',
    date: '10 de Dezembro, 2025',
    location: 'Parque Centenário - Mogi das Cruzes',
    description: 'Prática especial de yoga ao ar livre contemplando o pôr do sol. Aula gratuita aberta à comunidade com foco em gratidão e conexão com a natureza. Traga seu tapete!',
    image: 'https://images.unsplash.com/photo-1616569925882-18e6a431bba9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5zZXQlMjB5b2dhJTIwb3V0ZG9vcnxlbnwxfHx8fDE3NjEwNzkzNTF8MA&ixlib=rb-4.1.0&q=80&w=1080'
  }
];

export function EventCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection('right');
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  const goToNext = () => {
    setDirection('right');
    setCurrentIndex((prev) => (prev + 1) % events.length);
  };

  const goToPrev = () => {
    setDirection('left');
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
  };

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-xl shadow-2xl h-[500px]">
          <div 
            className="flex transition-transform duration-700 ease-in-out h-full"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`
            }}
          >
            {events.map((event, index) => (
              <div key={event.id} className="w-full flex-shrink-0 h-full">
                <div className="flex flex-col md:flex-row h-full relative">
                  {/* Background Image with Overlay */}
                  <div className="absolute inset-0 z-0">
                    <ImageWithFallback
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60"></div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 w-full p-8 md:p-12 flex flex-col justify-center text-white">
                    <div className="max-w-3xl mx-auto text-center">
                      <div className="inline-block bg-white text-purple-700 px-4 py-1 rounded-full text-sm mb-6">
                        EVENTO
                      </div>
                      <h2 className="text-white mb-6">{event.title}</h2>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-center gap-2 text-white">
                          <Calendar className="w-5 h-5" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-white">
                          <MapPin className="w-5 h-5" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-white">
                          <Clock className="w-5 h-5" />
                          <span>11h00</span>
                        </div>
                      </div>
                      
                      <p className="text-white leading-relaxed mb-6">{event.description}</p>
                      
                      <button className="bg-white hover:bg-gray-50 border-2 border-green-500 text-green-600 px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Participe!
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 transition-all shadow-lg z-10"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-6 h-6 text-purple-700" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 transition-all shadow-lg z-10"
            aria-label="Próximo"
          >
            <ChevronRight className="w-6 h-6 text-purple-700" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {events.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 'right' : 'left');
                  setCurrentIndex(index);
                }}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-white w-8' : 'bg-white/50 w-2'
                }`}
                aria-label={`Ir para evento ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}