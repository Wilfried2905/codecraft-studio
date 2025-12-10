/**
 * Conversation History - Gestion de l'historique des conversations
 */

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  code?: string
}

export interface Conversation {
  id: string
  title: string
  messages: ConversationMessage[]
  createdAt: number
  updatedAt: number
  projectName?: string
  generatedCode?: string
}

export class ConversationHistoryManager {
  private storageKey = 'codecraft-conversation-history'
  private maxConversations = 50

  /**
   * Récupère toutes les conversations
   */
  getAllConversations(): Conversation[] {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading conversations:', error)
      return []
    }
  }

  /**
   * Récupère une conversation par ID
   */
  getConversation(id: string): Conversation | null {
    const conversations = this.getAllConversations()
    return conversations.find(c => c.id === id) || null
  }

  /**
   * Sauvegarde une nouvelle conversation
   */
  saveConversation(conversation: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>): Conversation {
    let conversations = this.getAllConversations()
    
    const newConversation: Conversation = {
      ...conversation,
      id: this.generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    conversations.unshift(newConversation)
    
    // Limiter le nombre de conversations
    if (conversations.length > this.maxConversations) {
      conversations = conversations.slice(0, this.maxConversations)
    }

    this.saveConversations(conversations)
    return newConversation
  }

  /**
   * Met à jour une conversation existante
   */
  updateConversation(id: string, updates: Partial<Conversation>): Conversation | null {
    const conversations = this.getAllConversations()
    const index = conversations.findIndex(c => c.id === id)

    if (index === -1) return null

    conversations[index] = {
      ...conversations[index],
      ...updates,
      updatedAt: Date.now()
    }

    this.saveConversations(conversations)
    return conversations[index]
  }

  /**
   * Ajoute un message à une conversation
   */
  addMessage(conversationId: string, message: ConversationMessage): Conversation | null {
    const conversation = this.getConversation(conversationId)
    if (!conversation) return null

    conversation.messages.push(message)
    conversation.updatedAt = Date.now()

    // Mettre à jour le code généré si présent
    if (message.code) {
      conversation.generatedCode = message.code
    }

    return this.updateConversation(conversationId, conversation)
  }

  /**
   * Supprime une conversation
   */
  deleteConversation(id: string): boolean {
    const conversations = this.getAllConversations()
    const filtered = conversations.filter(c => c.id !== id)
    
    if (filtered.length === conversations.length) return false
    
    this.saveConversations(filtered)
    return true
  }

  /**
   * Recherche dans les conversations
   */
  searchConversations(query: string): Conversation[] {
    const conversations = this.getAllConversations()
    const lowerQuery = query.toLowerCase()

    return conversations.filter(c => 
      c.title.toLowerCase().includes(lowerQuery) ||
      c.projectName?.toLowerCase().includes(lowerQuery) ||
      c.messages.some(m => m.content.toLowerCase().includes(lowerQuery))
    )
  }

  /**
   * Récupère les conversations récentes
   */
  getRecentConversations(limit: number = 10): Conversation[] {
    return this.getAllConversations()
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limit)
  }

  /**
   * Génère un titre automatique depuis le premier message
   */
  generateTitle(firstMessage: string): string {
    // Prendre les 50 premiers caractères
    let title = firstMessage.substring(0, 50)
    
    // Nettoyer et ajouter ...
    if (firstMessage.length > 50) {
      title += '...'
    }
    
    return title || 'Nouvelle conversation'
  }

  /**
   * Export des conversations en JSON
   */
  exportConversations(): string {
    return JSON.stringify(this.getAllConversations(), null, 2)
  }

  /**
   * Import de conversations depuis JSON
   */
  importConversations(jsonString: string): number {
    try {
      const imported = JSON.parse(jsonString) as Conversation[]
      const current = this.getAllConversations()
      
      const merged = [...current]
      let addedCount = 0

      imported.forEach(conv => {
        if (!current.some(c => c.id === conv.id)) {
          merged.push(conv)
          addedCount++
        }
      })

      this.saveConversations(merged)
      return addedCount
    } catch (error) {
      console.error('Error importing conversations:', error)
      return 0
    }
  }

  /**
   * Nettoie les anciennes conversations
   */
  cleanupOldConversations(daysOld: number = 30): number {
    const conversations = this.getAllConversations()
    const cutoffDate = Date.now() - (daysOld * 24 * 60 * 60 * 1000)
    
    const filtered = conversations.filter(c => c.updatedAt > cutoffDate)
    const removedCount = conversations.length - filtered.length
    
    if (removedCount > 0) {
      this.saveConversations(filtered)
    }

    return removedCount
  }

  /**
   * Sauvegarde les conversations
   */
  private saveConversations(conversations: Conversation[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(conversations))
    } catch (error) {
      console.error('Error saving conversations:', error)
    }
  }

  /**
   * Génère un ID unique
   */
  private generateId(): string {
    return `conv-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }
}

// Export singleton instance
export const conversationHistory = new ConversationHistoryManager()
