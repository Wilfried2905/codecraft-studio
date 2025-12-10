export interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  description: string
  action: string
}

export const KEYBOARD_SHORTCUTS: Shortcut[] = [
  {
    key: 's',
    ctrl: true,
    description: 'Sauvegarder / Exporter',
    action: 'save'
  },
  {
    key: 'f',
    ctrl: true,
    description: 'Rechercher',
    action: 'search'
  },
  {
    key: 'b',
    ctrl: true,
    description: 'Toggle Sidebar',
    action: 'toggleSidebar'
  },
  {
    key: 'e',
    ctrl: true,
    description: 'Toggle Editor Mode',
    action: 'toggleEditor'
  },
  {
    key: 't',
    ctrl: true,
    description: 'Ouvrir Templates',
    action: 'openTemplates'
  },
  {
    key: 'n',
    ctrl: true,
    description: 'Nouveau Fichier',
    action: 'newFile'
  },
  {
    key: 'Enter',
    ctrl: true,
    description: 'Envoyer Message',
    action: 'sendMessage'
  },
  {
    key: '/',
    ctrl: true,
    description: 'Aide Raccourcis',
    action: 'help'
  }
]
