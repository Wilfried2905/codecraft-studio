import React from 'react';
import { MousePointer2 } from 'lucide-react';

interface CursorPosition {
  x: number;
  y: number;
  userId: string;
  userName: string;
}

interface CollaboratorCursorsProps {
  cursors: CursorPosition[];
}

export const CollaboratorCursors: React.FC<CollaboratorCursorsProps> = ({ cursors }) => {
  const getColorFromUserId = (userId: string) => {
    const colors = [
      { bg: 'bg-red-500', text: 'text-red-500' },
      { bg: 'bg-blue-500', text: 'text-blue-500' },
      { bg: 'bg-green-500', text: 'text-green-500' },
      { bg: 'bg-yellow-500', text: 'text-yellow-500' },
      { bg: 'bg-purple-500', text: 'text-purple-500' },
      { bg: 'bg-pink-500', text: 'text-pink-500' },
      { bg: 'bg-indigo-500', text: 'text-indigo-500' },
      { bg: 'bg-teal-500', text: 'text-teal-500' }
    ];
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {cursors.map((cursor) => {
        const color = getColorFromUserId(cursor.userId);
        return (
          <div
            key={cursor.userId}
            className="absolute transition-all duration-100 ease-out"
            style={{
              left: `${cursor.x}px`,
              top: `${cursor.y}px`,
              transform: 'translate(-2px, -2px)'
            }}
          >
            {/* Cursor Icon */}
            <MousePointer2 
              className={`w-5 h-5 ${color.text} drop-shadow-lg`}
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              }}
            />
            
            {/* User Name Label */}
            <div 
              className={`absolute left-4 top-0 ${color.bg} text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg`}
            >
              {cursor.userName}
            </div>
          </div>
        );
      })}
    </div>
  );
};
