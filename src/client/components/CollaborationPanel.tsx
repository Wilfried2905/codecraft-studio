import React from 'react';
import { Users, Wifi, WifiOff, Circle } from 'lucide-react';

interface Collaborator {
  userId: string;
  userName: string;
  userEmail: string;
  lastActive: string;
}

interface CollaborationPanelProps {
  collaborators: Collaborator[];
  isConnected: boolean;
  className?: string;
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  collaborators,
  isConnected,
  className = ''
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getColorFromEmail = (email: string) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ];
    const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return 'À l\'instant';
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)}min`;
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
    return `Il y a ${Math.floor(seconds / 86400)}j`;
  };

  return (
    <div className={`bg-slate-800 rounded-lg border border-slate-700 ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-400" />
          <span className="text-sm font-medium text-white">
            Collaborateurs ({collaborators.length})
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400">Connecté</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-400">Déconnecté</span>
            </>
          )}
        </div>
      </div>

      {/* Collaborators List */}
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {collaborators.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">
              Aucun collaborateur en ligne
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Partagez votre projet pour collaborer
            </p>
          </div>
        ) : (
          collaborators.map((collaborator) => (
            <div
              key={collaborator.userId}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
            >
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full ${getColorFromEmail(collaborator.userEmail)} flex items-center justify-center text-white font-semibold text-sm relative`}>
                {getInitials(collaborator.userName)}
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-slate-800 rounded-full" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white truncate">
                    {collaborator.userName}
                  </p>
                  <Circle className="w-2 h-2 text-green-400 fill-current animate-pulse" />
                </div>
                <p className="text-xs text-slate-400 truncate">
                  {collaborator.userEmail}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {getTimeAgo(collaborator.lastActive)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Footer */}
      {collaborators.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-700 bg-blue-500/10">
          <p className="text-xs text-blue-400">
            💡 Les modifications sont synchronisées en temps réel entre tous les collaborateurs
          </p>
        </div>
      )}
    </div>
  );
};
