export interface Template {
  id: string
  name: string
  category: string
  icon: string
  description: string
  prompt: string
}

export const TEMPLATES: Template[] = [
  // LANDING PAGES
  {
    id: 'landing-modern',
    name: 'Landing Page Moderne',
    category: 'landing',
    icon: 'Sparkles',
    description: 'Hero + Features + CTA',
    prompt: 'Crée une landing page moderne avec hero gradient teal-violet, 3 features avec icônes Lucide, testimonials, et footer. Style glassmorphism avec dark mode.'
  },
  {
    id: 'landing-saas',
    name: 'SaaS Landing',
    category: 'landing',
    icon: 'Rocket',
    description: 'SaaS product page',
    prompt: 'Landing page SaaS avec pricing table (3 tiers), features comparison, FAQ accordion, et CTA sticky. Style professionnel bleu-violet.'
  },
  {
    id: 'landing-app',
    name: 'App Showcase',
    category: 'landing',
    icon: 'Smartphone',
    description: 'Mobile app presentation',
    prompt: 'Page showcase app mobile avec mockup phone, app features, download buttons (iOS/Android), et screenshots carousel. Style moderne gradient.'
  },
  
  // DASHBOARDS
  {
    id: 'dashboard-analytics',
    name: 'Analytics Dashboard',
    category: 'dashboard',
    icon: 'BarChart3',
    description: 'Stats + Charts',
    prompt: 'Dashboard analytics avec 4 stats cards, 2 charts (Chart.js via CDN), table données avec pagination. Dark mode, sidebar navigation, accents cyan.'
  },
  {
    id: 'dashboard-ecommerce',
    name: 'E-commerce Admin',
    category: 'dashboard',
    icon: 'ShoppingBag',
    description: 'Sales dashboard',
    prompt: 'Dashboard e-commerce admin avec sales overview, recent orders table, top products, et revenue chart. Sidebar avec menu, dark theme teal.'
  },
  {
    id: 'dashboard-crm',
    name: 'CRM Dashboard',
    category: 'dashboard',
    icon: 'Users',
    description: 'Customer management',
    prompt: 'CRM dashboard avec leads pipeline (kanban), contacts list, activity feed, et deals chart. Sidebar navigation, purple accents.'
  },
  
  // APPLICATIONS
  {
    id: 'todo-app',
    name: 'Todo App',
    category: 'app',
    icon: 'CheckSquare',
    description: 'Task manager',
    prompt: 'Todo app complet: input ajout, liste avec checkboxes, boutons edit/delete, filtres All/Active/Completed, compteur. LocalStorage persistence. Style moderne cyan.'
  },
  {
    id: 'calculator',
    name: 'Calculatrice',
    category: 'app',
    icon: 'Calculator',
    description: 'Scientific calculator',
    prompt: 'Calculatrice avec boutons 0-9, opérateurs +/-/*/÷, parenthèses, clear, equals. Support clavier. Display grand. Style neumorphism dark.'
  },
  {
    id: 'weather-app',
    name: 'Weather App',
    category: 'app',
    icon: 'Cloud',
    description: 'Weather forecast',
    prompt: 'Application météo avec search ville, weather card actuelle (icône, température, humidité), prévisions 5 jours. Icons météo, gradient sky colors.'
  },
  {
    id: 'notes-app',
    name: 'Notes App',
    category: 'app',
    icon: 'StickyNote',
    description: 'Note taking',
    prompt: 'App notes avec sidebar liste notes, editor markdown avec preview, boutons new/delete, search notes. LocalStorage. Style minimal blanc-gris.'
  },
  
  // WEBSITES
  {
    id: 'portfolio',
    name: 'Portfolio',
    category: 'website',
    icon: 'Briefcase',
    description: 'Personal portfolio',
    prompt: 'Portfolio développeur avec hero photo + bio, about section, projects grid 2x3 avec hover effects, skills badges, contact form. Dark theme gradient teal-purple.'
  },
  {
    id: 'blog',
    name: 'Blog',
    category: 'website',
    icon: 'BookOpen',
    description: 'Blog layout',
    prompt: 'Blog avec header navigation, hero featured post, articles grid avec thumbnails, sidebar categories, footer. Style clean reading typography.'
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    category: 'website',
    icon: 'Utensils',
    description: 'Restaurant website',
    prompt: 'Site restaurant avec hero image, menu categories (entrées/plats/desserts), galerie photos grid, horaires/contact, reservation form. Style élégant warm colors.'
  },
  {
    id: 'agency',
    name: 'Digital Agency',
    category: 'website',
    icon: 'Briefcase',
    description: 'Agency website',
    prompt: 'Site agence digitale avec hero bold, services grid 3 colonnes, portfolio cases, team members, testimonials slider, contact CTA. Style moderne professionnel.'
  },
  
  // E-COMMERCE
  {
    id: 'ecommerce-shop',
    name: 'Online Shop',
    category: 'ecommerce',
    icon: 'ShoppingCart',
    description: 'Product catalog',
    prompt: 'Boutique en ligne avec header (logo, search, cart), products grid avec filters sidebar, product cards (image, title, price, add to cart). Style modern ecommerce.'
  },
  {
    id: 'product-page',
    name: 'Product Page',
    category: 'ecommerce',
    icon: 'Package',
    description: 'Product detail',
    prompt: 'Page produit avec image gallery, title/price/description, variants selector (size/color), quantity input, add to cart button, reviews section. Style premium.'
  },
  {
    id: 'checkout',
    name: 'Checkout Flow',
    category: 'ecommerce',
    icon: 'CreditCard',
    description: 'Payment form',
    prompt: 'Page checkout avec order summary sidebar, shipping form, payment form (card inputs), progress steps (1/2/3), secure badges. Style trustworthy blue.'
  },
  
  // FORMS
  {
    id: 'contact-form',
    name: 'Contact Form',
    category: 'form',
    icon: 'Mail',
    description: 'Contact page',
    prompt: 'Page contact avec form (name, email, subject, message), validation inputs, submit button, contact info sidebar (email, phone, address, map). Style professional.'
  },
  {
    id: 'login-form',
    name: 'Login Page',
    category: 'form',
    icon: 'LogIn',
    description: 'Authentication',
    prompt: 'Page login centrée avec email/password inputs, remember me checkbox, forgot password link, social login buttons (Google/GitHub), sign up link. Style modern gradient.'
  },
  {
    id: 'survey-form',
    name: 'Survey Form',
    category: 'form',
    icon: 'ClipboardList',
    description: 'Multi-step survey',
    prompt: 'Formulaire survey multi-steps (3 étapes): questions radio/checkbox, range slider, textarea. Progress bar, prev/next buttons. Style friendly colorful.'
  }
]

export const CATEGORIES = [
  { id: 'all', name: 'Tous', icon: 'LayoutGrid' },
  { id: 'landing', name: 'Landing Pages', icon: 'Rocket' },
  { id: 'dashboard', name: 'Dashboards', icon: 'BarChart3' },
  { id: 'app', name: 'Applications', icon: 'Smartphone' },
  { id: 'website', name: 'Websites', icon: 'Globe' },
  { id: 'ecommerce', name: 'E-commerce', icon: 'ShoppingCart' },
  { id: 'form', name: 'Forms', icon: 'FileText' }
]
