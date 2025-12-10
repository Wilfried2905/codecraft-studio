/**
 * Login/Signup Modal Component
 * 
 * Provides UI for user authentication:
 * - Sign in with email/password
 * - Sign up with email/password
 * - Password reset
 */

import { useState } from 'react'
import { signIn, signUp, resetPassword } from '../services/authService'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

type AuthMode = 'signin' | 'signup' | 'reset'

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (mode === 'signin') {
        const { error } = await signIn({ email, password })
        if (error) {
          setError(error.message)
        } else {
          setSuccess('Connexion réussie !')
          setTimeout(() => {
            onClose()
            resetForm()
          }, 1000)
        }
      } else if (mode === 'signup') {
        const { error } = await signUp({ email, password, fullName })
        if (error) {
          setError(error.message)
        } else {
          setSuccess('Compte créé ! Vérifiez votre email pour confirmer.')
          setTimeout(() => {
            setMode('signin')
            setSuccess(null)
          }, 3000)
        }
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email)
        if (error) {
          setError(error.message)
        } else {
          setSuccess('Email de réinitialisation envoyé !')
          setTimeout(() => {
            setMode('signin')
            setSuccess(null)
          }, 3000)
        }
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setFullName('')
    setError(null)
    setSuccess(null)
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    resetForm()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {mode === 'signin' && 'Connexion'}
            {mode === 'signup' && 'Créer un compte'}
            {mode === 'reset' && 'Réinitialiser le mot de passe'}
          </h2>
          <button
            onClick={() => {
              onClose()
              resetForm()
            }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name (signup only) */}
          {mode === 'signup' && (
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nom complet
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                placeholder="John Doe"
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              placeholder="vous@exemple.com"
            />
          </div>

          {/* Password (not for reset) */}
          {mode !== 'reset' && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Chargement...' : mode === 'signin' ? 'Se connecter' : mode === 'signup' ? 'Créer le compte' : 'Envoyer'}
          </button>
        </form>

        {/* Mode switchers */}
        <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          {mode === 'signin' && (
            <>
              <p>
                Pas encore de compte ?{' '}
                <button onClick={() => switchMode('signup')} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  Créer un compte
                </button>
              </p>
              <p className="mt-2">
                <button onClick={() => switchMode('reset')} className="text-blue-600 dark:text-blue-400 hover:underline">
                  Mot de passe oublié ?
                </button>
              </p>
            </>
          )}
          {mode === 'signup' && (
            <p>
              Déjà un compte ?{' '}
              <button onClick={() => switchMode('signin')} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                Se connecter
              </button>
            </p>
          )}
          {mode === 'reset' && (
            <p>
              <button onClick={() => switchMode('signin')} className="text-blue-600 dark:text-blue-400 hover:underline">
                Retour à la connexion
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
