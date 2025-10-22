import { useState } from 'react';
import { Calendar, Clock, Tag } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

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

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative bg-white rounded-lg overflow-hidden transition-all duration-300 cursor-pointer border border-gray-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isHovered ? '0 10px 40px rgba(147, 51, 234, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: isHovered ? 10 : 1
      }}
    >
      <div className="flex gap-4">
        {/* Image */}
        <div className="w-48 h-48 flex-shrink-0 overflow-hidden">
          <ImageWithFallback
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300"
            style={{
              transform: isHovered ? 'scale(1.1)' : 'scale(1)'
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-purple-900 flex-1">{post.title}</h3>
            <div className="flex items-center gap-1 text-purple-700 text-sm ml-4">
              <Tag className="w-4 h-4" />
              <span>{post.category}</span>
            </div>
          </div>

          <p className="text-gray-700 mb-4">{post.excerpt}</p>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{post.date}</span>
            </div>
            {post.duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{post.duration}</span>
              </div>
            )}
          </div>

          {/* Expanded Content */}
          <div
            className="mt-4 transition-all duration-300"
            style={{
              maxHeight: isHovered ? '200px' : '0',
              opacity: isHovered ? 1 : 0,
              overflow: 'hidden'
            }}
          >
            <div className="border-t border-gray-300 pt-4">
              <p className="text-gray-700 mb-2">{post.fullDescription}</p>
              <p className="text-purple-700">
                <strong>Instrutora:</strong> {post.instructor}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}