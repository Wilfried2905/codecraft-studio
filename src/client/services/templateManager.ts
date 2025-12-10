/**
 * Template Manager - Gestion des templates dynamiques et personnalisés
 */

export interface CustomTemplate {
  id: string
  name: string
  description: string
  category: 'landing-page' | 'dashboard' | 'app' | 'website' | 'ecommerce' | 'form' | 'custom'
  code: string
  thumbnail?: string
  tags: string[]
  prompt: string
  createdAt: number
  updatedAt: number
  favorite: boolean
  usageCount: number
  style: 'minimal' | 'modern' | 'professional' | 'creative' | 'custom'
  features: string[]
}

export interface TemplateStats {
  totalTemplates: number
  favoriteTemplates: number
  mostUsed: CustomTemplate[]
  recentTemplates: CustomTemplate[]
}

export class TemplateManager {
  private storageKey = 'codecraft-custom-templates'
  private statsKey = 'codecraft-template-stats'

  /**
   * Récupère tous les templates personnalisés
   */
  getAllTemplates(): CustomTemplate[] {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading templates:', error)
      return []
    }
  }

  /**
   * Récupère un template par ID
   */
  getTemplateById(id: string): CustomTemplate | null {
    const templates = this.getAllTemplates()
    return templates.find(t => t.id === id) || null
  }

  /**
   * Sauvegarde un nouveau template
   */
  saveTemplate(template: Omit<CustomTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): CustomTemplate {
    const templates = this.getAllTemplates()
    
    const newTemplate: CustomTemplate = {
      ...template,
      id: this.generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      usageCount: 0
    }

    templates.push(newTemplate)
    this.saveTemplates(templates)
    
    return newTemplate
  }

  /**
   * Met à jour un template existant
   */
  updateTemplate(id: string, updates: Partial<CustomTemplate>): CustomTemplate | null {
    const templates = this.getAllTemplates()
    const index = templates.findIndex(t => t.id === id)

    if (index === -1) return null

    templates[index] = {
      ...templates[index],
      ...updates,
      updatedAt: Date.now()
    }

    this.saveTemplates(templates)
    return templates[index]
  }

  /**
   * Supprime un template
   */
  deleteTemplate(id: string): boolean {
    const templates = this.getAllTemplates()
    const filtered = templates.filter(t => t.id !== id)
    
    if (filtered.length === templates.length) return false
    
    this.saveTemplates(filtered)
    return true
  }

  /**
   * Toggle favorite sur un template
   */
  toggleFavorite(id: string): boolean {
    const template = this.getTemplateById(id)
    if (!template) return false

    this.updateTemplate(id, { favorite: !template.favorite })
    return !template.favorite
  }

  /**
   * Incrémente le compteur d'utilisation
   */
  incrementUsage(id: string): void {
    const template = this.getTemplateById(id)
    if (!template) return

    this.updateTemplate(id, { usageCount: template.usageCount + 1 })
  }

  /**
   * Recherche de templates
   */
  searchTemplates(query: string): CustomTemplate[] {
    const templates = this.getAllTemplates()
    const lowerQuery = query.toLowerCase()

    return templates.filter(t => 
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      t.features.some(feature => feature.toLowerCase().includes(lowerQuery))
    )
  }

  /**
   * Filtre par catégorie
   */
  getTemplatesByCategory(category: CustomTemplate['category']): CustomTemplate[] {
    return this.getAllTemplates().filter(t => t.category === category)
  }

  /**
   * Récupère les templates favoris
   */
  getFavoriteTemplates(): CustomTemplate[] {
    return this.getAllTemplates().filter(t => t.favorite)
  }

  /**
   * Récupère les templates les plus utilisés
   */
  getMostUsedTemplates(limit: number = 5): CustomTemplate[] {
    return this.getAllTemplates()
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit)
  }

  /**
   * Récupère les templates récents
   */
  getRecentTemplates(limit: number = 5): CustomTemplate[] {
    return this.getAllTemplates()
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit)
  }

  /**
   * Crée un template à partir d'une génération réussie
   */
  createFromGeneration(
    name: string,
    code: string,
    prompt: string,
    options: {
      description?: string
      category?: CustomTemplate['category']
      style?: CustomTemplate['style']
      tags?: string[]
      features?: string[]
    } = {}
  ): CustomTemplate {
    return this.saveTemplate({
      name,
      description: options.description || `Template créé automatiquement`,
      category: options.category || 'custom',
      code,
      prompt,
      tags: options.tags || [],
      favorite: false,
      style: options.style || 'custom',
      features: options.features || []
    })
  }

  /**
   * Obtient les statistiques
   */
  getStats(): TemplateStats {
    const templates = this.getAllTemplates()
    
    return {
      totalTemplates: templates.length,
      favoriteTemplates: templates.filter(t => t.favorite).length,
      mostUsed: this.getMostUsedTemplates(3),
      recentTemplates: this.getRecentTemplates(3)
    }
  }

  /**
   * Export templates en JSON
   */
  exportTemplates(): string {
    return JSON.stringify(this.getAllTemplates(), null, 2)
  }

  /**
   * Import templates depuis JSON
   */
  importTemplates(jsonString: string): number {
    try {
      const imported = JSON.parse(jsonString) as CustomTemplate[]
      const current = this.getAllTemplates()
      
      // Fusionner sans doublons (par nom)
      const merged = [...current]
      let addedCount = 0

      imported.forEach(template => {
        if (!current.some(t => t.name === template.name)) {
          merged.push({
            ...template,
            id: this.generateId(),
            createdAt: Date.now(),
            updatedAt: Date.now()
          })
          addedCount++
        }
      })

      this.saveTemplates(merged)
      return addedCount
    } catch (error) {
      console.error('Error importing templates:', error)
      return 0
    }
  }

  /**
   * Nettoie les templates non utilisés depuis X jours
   */
  cleanupOldTemplates(daysOld: number = 90): number {
    const templates = this.getAllTemplates()
    const cutoffDate = Date.now() - (daysOld * 24 * 60 * 60 * 1000)
    
    const filtered = templates.filter(t => 
      t.favorite || // Garder les favoris
      t.usageCount > 0 || // Garder ceux utilisés
      t.createdAt > cutoffDate // Garder les récents
    )

    const removedCount = templates.length - filtered.length
    if (removedCount > 0) {
      this.saveTemplates(filtered)
    }

    return removedCount
  }

  /**
   * Sauvegarde les templates dans localStorage
   */
  private saveTemplates(templates: CustomTemplate[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(templates))
    } catch (error) {
      console.error('Error saving templates:', error)
    }
  }

  /**
   * Génère un ID unique
   */
  private generateId(): string {
    return `template-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }
}

// Export singleton instance
export const templateManager = new TemplateManager()
