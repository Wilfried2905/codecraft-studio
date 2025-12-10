/**
 * Error Handler - Gestion centralisée des erreurs
 */

export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, 400, details)
    this.name = 'ValidationError'
  }
}

export class APIError extends AppError {
  constructor(message: string, details?: any) {
    super('API_ERROR', message, 502, details)
    this.name = 'APIError'
  }
}

export class FileProcessingError extends AppError {
  constructor(message: string, details?: any) {
    super('FILE_PROCESSING_ERROR', message, 422, details)
    this.name = 'FileProcessingError'
  }
}

export class AgentExecutionError extends AppError {
  constructor(message: string, details?: any) {
    super('AGENT_EXECUTION_ERROR', message, 500, details)
    this.name = 'AgentExecutionError'
  }
}

/**
 * Formatte une erreur pour l'affichage utilisateur
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return `❌ **${error.name}**\n\n${error.message}${error.details ? `\n\nDétails: ${JSON.stringify(error.details, null, 2)}` : ''}`
  }

  if (error instanceof Error) {
    return `❌ **Erreur**\n\n${error.message}`
  }

  return `❌ **Erreur inconnue**\n\nUne erreur inattendue est survenue.`
}

/**
 * Log une erreur avec contexte
 */
export function logError(error: unknown, context?: string) {
  const timestamp = new Date().toISOString()
  const prefix = context ? `[${context}]` : ''
  
  console.error(`${timestamp} ${prefix} Error:`, error)
  
  if (error instanceof AppError) {
    console.error(`  Code: ${error.code}`)
    console.error(`  Status: ${error.statusCode}`)
    if (error.details) {
      console.error(`  Details:`, error.details)
    }
  }
}

/**
 * Retry logic pour appels API
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    delayMs?: number
    onRetry?: (attempt: number, error: unknown) => void
  } = {}
): Promise<T> {
  const { maxRetries = 3, delayMs = 1000, onRetry } = options
  
  let lastError: unknown
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (attempt < maxRetries) {
        if (onRetry) {
          onRetry(attempt, error)
        }
        
        // Exponential backoff
        const delay = delayMs * Math.pow(2, attempt - 1)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError
}

/**
 * Timeout pour les opérations longues
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new AppError('TIMEOUT', timeoutMessage, 408)), timeoutMs)
    )
  ])
}

/**
 * Safe JSON parse avec fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

/**
 * Validation helper
 */
export function validate(condition: boolean, message: string, details?: any): void {
  if (!condition) {
    throw new ValidationError(message, details)
  }
}
