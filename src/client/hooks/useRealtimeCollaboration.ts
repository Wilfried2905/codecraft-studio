import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface CollaboratorPresence {
  userId: string;
  userName: string;
  userEmail: string;
  cursor?: {
    x: number;
    y: number;
  };
  lastActive: string;
}

interface CursorPosition {
  x: number;
  y: number;
  userId: string;
  userName: string;
}

interface UseRealtimeCollaborationProps {
  projectId: string;
  userId: string;
  userName: string;
  userEmail: string;
  enabled?: boolean;
}

export const useRealtimeCollaboration = ({
  projectId,
  userId,
  userName,
  userEmail,
  enabled = true
}: UseRealtimeCollaborationProps) => {
  const [collaborators, setCollaborators] = useState<CollaboratorPresence[]>([]);
  const [cursors, setCursors] = useState<Map<string, CursorPosition>>(new Map());
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize Realtime channel
  useEffect(() => {
    if (!enabled || !projectId || !userId) return;

    const channelName = `project:${projectId}`;
    const realtimeChannel = supabase.channel(channelName, {
      config: {
        presence: {
          key: userId
        }
      }
    });

    // Subscribe to presence changes
    realtimeChannel
      .on('presence', { event: 'sync' }, () => {
        const state = realtimeChannel.presenceState();
        const presences: CollaboratorPresence[] = [];

        Object.keys(state).forEach(key => {
          const presence = state[key];
          if (presence && presence[0]) {
            presences.push(presence[0] as CollaboratorPresence);
          }
        });

        setCollaborators(presences.filter(p => p.userId !== userId));
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
        setCursors(prev => {
          const newCursors = new Map(prev);
          newCursors.delete(key);
          return newCursors;
        });
      })
      .on('broadcast', { event: 'cursor' }, ({ payload }) => {
        if (payload.userId !== userId) {
          setCursors(prev => {
            const newCursors = new Map(prev);
            newCursors.set(payload.userId, {
              x: payload.x,
              y: payload.y,
              userId: payload.userId,
              userName: payload.userName
            });
            return newCursors;
          });
        }
      })
      .on('broadcast', { event: 'code-update' }, ({ payload }) => {
        console.log('Code updated by:', payload.userId);
        // Handle code updates from other users
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          // Track own presence
          await realtimeChannel.track({
            userId,
            userName,
            userEmail,
            lastActive: new Date().toISOString()
          });
        } else {
          setIsConnected(false);
        }
      });

    setChannel(realtimeChannel);

    // Cleanup on unmount
    return () => {
      realtimeChannel.unsubscribe();
    };
  }, [projectId, userId, userName, userEmail, enabled]);

  // Send cursor position
  const sendCursorPosition = useCallback((x: number, y: number) => {
    if (channel && isConnected) {
      channel.send({
        type: 'broadcast',
        event: 'cursor',
        payload: { x, y, userId, userName }
      });
    }
  }, [channel, isConnected, userId, userName]);

  // Send code update
  const sendCodeUpdate = useCallback((code: string) => {
    if (channel && isConnected) {
      channel.send({
        type: 'broadcast',
        event: 'code-update',
        payload: { code, userId, userName, timestamp: Date.now() }
      });
    }
  }, [channel, isConnected, userId, userName]);

  // Update presence
  const updatePresence = useCallback(async (updates: Partial<CollaboratorPresence>) => {
    if (channel && isConnected) {
      await channel.track({
        userId,
        userName,
        userEmail,
        lastActive: new Date().toISOString(),
        ...updates
      });
    }
  }, [channel, isConnected, userId, userName, userEmail]);

  return {
    collaborators,
    cursors: Array.from(cursors.values()),
    isConnected,
    sendCursorPosition,
    sendCodeUpdate,
    updatePresence,
    activeCount: collaborators.length
  };
};
