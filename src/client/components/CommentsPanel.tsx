import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Trash2, Edit2, MoreVertical, AtSign } from 'lucide-react';
import { commentService, type Comment } from '../services/commentService';
import { useAuth } from '../context/AuthContext';

interface CommentsPanelProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CommentsPanel: React.FC<CommentsPanelProps> = ({ projectId, isOpen, onClose }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && projectId) {
      loadComments();
      
      // Subscribe to real-time updates
      const subscription = commentService.subscribeToComments(projectId, () => {
        loadComments();
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [projectId, isOpen]);

  const loadComments = async () => {
    try {
      const data = await commentService.getProjectComments(projectId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleSubmit = async () => {
    if (!newComment.trim() || loading) return;

    setLoading(true);
    try {
      const mentions = commentService.parseMentions(newComment);
      await commentService.createComment({
        project_id: projectId,
        content: newComment,
        mentions,
        parent_id: replyingTo
      });

      setNewComment('');
      setReplyingTo(null);
      await loadComments();
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (commentId: string) => {
    if (!editContent.trim() || loading) return;

    setLoading(true);
    try {
      const mentions = commentService.parseMentions(editContent);
      await commentService.updateComment(commentId, {
        content: editContent,
        mentions
      });

      setEditingId(null);
      setEditContent('');
      await loadComments();
    } catch (error) {
      console.error('Error updating comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Supprimer ce commentaire ?')) return;

    try {
      await commentService.deleteComment(commentId);
      await loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getColorFromEmail = (email: string) => {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
    const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR');
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const isOwner = comment.user_id === user?.id;
    const isEditing = editingId === comment.id;
    const userName = comment.user?.user_metadata?.full_name || comment.user?.email || 'Utilisateur';

    return (
      <div key={comment.id} className={`${isReply ? 'ml-12 mt-3' : 'mb-4'}`}>
        <div className="flex gap-3">
          {/* Avatar */}
          <div className={`w-8 h-8 rounded-full ${getColorFromEmail(comment.user?.email || '')} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}>
            {getInitials(userName)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-white">{userName}</span>
              <span className="text-xs text-slate-500">{formatTime(comment.created_at)}</span>
              {comment.updated_at !== comment.created_at && (
                <span className="text-xs text-slate-500">(modifié)</span>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows={3}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(comment.id)}
                    disabled={loading}
                    className="px-3 py-1 bg-teal-500 hover:bg-teal-600 text-white text-sm rounded disabled:opacity-50"
                  >
                    Enregistrer
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditContent('');
                    }}
                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-300 whitespace-pre-wrap">{comment.content}</p>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => setReplyingTo(comment.id)}
                    className="text-xs text-slate-400 hover:text-teal-400 transition-colors"
                  >
                    Répondre
                  </button>
                  {isOwner && (
                    <>
                      <button
                        onClick={() => startEdit(comment)}
                        className="text-xs text-slate-400 hover:text-blue-400 transition-colors"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-xs text-slate-400 hover:text-red-400 transition-colors"
                      >
                        Supprimer
                      </button>
                    </>
                  )}
                </div>
              </>
            )}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3 space-y-3">
                {comment.replies.map(reply => renderComment(reply, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-slate-800 border-l border-slate-700 shadow-2xl z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-teal-400" />
          <h2 className="text-lg font-semibold text-white">Commentaires</h2>
          <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded">
            {comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-slate-700 rounded transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4">
        {comments.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Aucun commentaire</p>
            <p className="text-slate-500 text-xs mt-1">Soyez le premier à commenter !</p>
          </div>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700">
        {replyingTo && (
          <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
            <span>Réponse en cours...</span>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-red-400 hover:text-red-300"
            >
              Annuler
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                handleSubmit();
              }
            }}
            placeholder="Ajouter un commentaire... (@ pour mentionner)"
            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            rows={3}
            disabled={loading}
          />
          <button
            onClick={handleSubmit}
            disabled={!newComment.trim() || loading}
            className="p-2 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded transition-colors self-end"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          💡 Ctrl+Enter pour envoyer • @ pour mentionner
        </p>
      </div>
    </div>
  );
};
