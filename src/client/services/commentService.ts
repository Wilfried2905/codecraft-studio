import { supabase } from './supabaseClient';

export interface Comment {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  mentions: string[];
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  user?: {
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
  replies?: Comment[];
}

export interface CreateCommentInput {
  project_id: string;
  content: string;
  mentions?: string[];
  parent_id?: string | null;
}

export interface UpdateCommentInput {
  content: string;
  mentions?: string[];
}

class CommentService {
  // Create a new comment
  async createComment(input: CreateCommentInput): Promise<Comment> {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        project_id: input.project_id,
        content: input.content,
        mentions: input.mentions || [],
        parent_id: input.parent_id || null
      })
      .select('*, user:user_id(*)')
      .single();

    if (error) throw error;
    return data;
  }

  // Get all comments for a project with replies
  async getProjectComments(projectId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select('*, user:user_id(*)')
      .eq('project_id', projectId)
      .is('parent_id', null)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Fetch replies for each comment
    const commentsWithReplies = await Promise.all(
      data.map(async (comment) => {
        const replies = await this.getCommentReplies(comment.id);
        return { ...comment, replies };
      })
    );

    return commentsWithReplies;
  }

  // Get replies for a comment
  async getCommentReplies(commentId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select('*, user:user_id(*)')
      .eq('parent_id', commentId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Update a comment
  async updateComment(commentId: string, input: UpdateCommentInput): Promise<Comment> {
    const { data, error } = await supabase
      .from('comments')
      .update({
        content: input.content,
        mentions: input.mentions || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .select('*, user:user_id(*)')
      .single();

    if (error) throw error;
    return data;
  }

  // Delete a comment
  async deleteComment(commentId: string): Promise<void> {
    // First delete all replies
    await supabase
      .from('comments')
      .delete()
      .eq('parent_id', commentId);

    // Then delete the comment
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
  }

  // Subscribe to new comments
  subscribeToComments(
    projectId: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`comments:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `project_id=eq.${projectId}`
        },
        callback
      )
      .subscribe();
  }

  // Parse mentions from content (e.g., @username)
  parseMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }

    return [...new Set(mentions)]; // Remove duplicates
  }

  // Create notification for mentioned users
  async notifyMentionedUsers(
    projectId: string,
    commentId: string,
    mentions: string[]
  ): Promise<void> {
    // This would integrate with a notification system
    // For now, we just log it
    console.log('Notify users:', mentions, 'about comment:', commentId, 'in project:', projectId);
  }
}

export const commentService = new CommentService();
