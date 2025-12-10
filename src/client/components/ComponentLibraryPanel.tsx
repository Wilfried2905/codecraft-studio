import React, { useState } from 'react';
import { X, Package, Search, Download, Eye, Code, Sparkles, Grid3x3, Copy, CheckCircle } from 'lucide-react';

interface Component {
  id: string;
  name: string;
  description: string;
  category: 'ui' | 'layout' | 'form' | 'navigation' | 'data' | 'feedback';
  code: string;
  preview: string;
  tags: string[];
}

interface ComponentLibraryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertComponent?: (code: string) => void;
}

const SAMPLE_COMPONENTS: Component[] = [
  {
    id: '1',
    name: 'Button Primary',
    description: 'Bouton principal avec effet hover',
    category: 'ui',
    code: `<button class="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors shadow-lg">
  Click Me
</button>`,
    preview: 'https://via.placeholder.com/300x150?text=Button+Preview',
    tags: ['button', 'primary', 'ui']
  },
  {
    id: '2',
    name: 'Card Product',
    description: 'Carte produit e-commerce',
    category: 'ui',
    code: `<div class="bg-white rounded-lg shadow-md overflow-hidden">
  <img src="https://via.placeholder.com/300x200" alt="Product" class="w-full h-48 object-cover">
  <div class="p-4">
    <h3 class="text-lg font-semibold mb-2">Product Name</h3>
    <p class="text-gray-600 text-sm mb-4">Product description goes here</p>
    <div class="flex items-center justify-between">
      <span class="text-2xl font-bold text-teal-600">$99.99</span>
      <button class="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600">Add to Cart</button>
    </div>
  </div>
</div>`,
    preview: 'https://via.placeholder.com/300x150?text=Card+Preview',
    tags: ['card', 'product', 'ecommerce']
  },
  {
    id: '3',
    name: 'Hero Section',
    description: 'Section hero avec CTA',
    category: 'layout',
    code: `<section class="bg-gradient-to-r from-teal-500 to-blue-600 py-20">
  <div class="container mx-auto px-4 text-center text-white">
    <h1 class="text-5xl font-bold mb-4">Welcome to Our Platform</h1>
    <p class="text-xl mb-8">Build amazing things with our tools</p>
    <button class="px-8 py-4 bg-white text-teal-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
      Get Started
    </button>
  </div>
</section>`,
    preview: 'https://via.placeholder.com/300x150?text=Hero+Preview',
    tags: ['hero', 'section', 'landing']
  },
  {
    id: '4',
    name: 'Input Field',
    description: 'Champ de saisie stylisé',
    category: 'form',
    code: `<div class="mb-4">
  <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
    Email Address
  </label>
  <input 
    type="email" 
    id="email"
    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
    placeholder="Enter your email"
  />
</div>`,
    preview: 'https://via.placeholder.com/300x150?text=Input+Preview',
    tags: ['input', 'form', 'field']
  },
  {
    id: '5',
    name: 'Navbar',
    description: 'Barre de navigation responsive',
    category: 'navigation',
    code: `<nav class="bg-white shadow-md">
  <div class="container mx-auto px-4 py-4 flex items-center justify-between">
    <div class="text-2xl font-bold text-teal-600">Logo</div>
    <div class="hidden md:flex space-x-6">
      <a href="#" class="text-gray-700 hover:text-teal-600">Home</a>
      <a href="#" class="text-gray-700 hover:text-teal-600">About</a>
      <a href="#" class="text-gray-700 hover:text-teal-600">Services</a>
      <a href="#" class="text-gray-700 hover:text-teal-600">Contact</a>
    </div>
    <button class="md:hidden">☰</button>
  </div>
</nav>`,
    preview: 'https://via.placeholder.com/300x150?text=Navbar+Preview',
    tags: ['navbar', 'navigation', 'menu']
  },
  {
    id: '6',
    name: 'Alert Success',
    description: 'Message de succès',
    category: 'feedback',
    code: `<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
  <strong class="font-bold">Success!</strong>
  <span class="block sm:inline"> Your changes have been saved.</span>
  <span class="absolute top-0 bottom-0 right-0 px-4 py-3">
    <svg class="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
      <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
    </svg>
  </span>
</div>`,
    preview: 'https://via.placeholder.com/300x150?text=Alert+Preview',
    tags: ['alert', 'success', 'notification']
  }
];

export const ComponentLibraryPanel: React.FC<ComponentLibraryPanelProps> = ({
  isOpen,
  onClose,
  onInsertComponent
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  const categories = [
    { id: 'all', label: 'Tous', icon: Grid3x3 },
    { id: 'ui', label: 'UI', icon: Package },
    { id: 'layout', label: 'Layout', icon: Grid3x3 },
    { id: 'form', label: 'Forms', icon: Code },
    { id: 'navigation', label: 'Navigation', icon: Package },
    { id: 'feedback', label: 'Feedback', icon: Sparkles }
  ];

  const filteredComponents = SAMPLE_COMPONENTS.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         component.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = (component: Component) => {
    if (onInsertComponent) {
      onInsertComponent(component.code);
    }
    onClose();
  };

  const handleGenerateCustom = async () => {
    if (!customPrompt.trim()) return;

    setGenerating(true);
    try {
      // Simulate AI generation (replace with actual AI call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const generatedComponent: Component = {
        id: Date.now().toString(),
        name: 'Generated Component',
        description: customPrompt,
        category: 'ui',
        code: `<!-- Generated from: ${customPrompt} -->\n<div class="p-4 bg-white rounded shadow">\n  <p>Your custom component will appear here</p>\n</div>`,
        preview: 'https://via.placeholder.com/300x150?text=Generated',
        tags: ['custom', 'ai-generated']
      };

      setSelectedComponent(generatedComponent);
      setCustomPrompt('');
    } catch (error) {
      console.error('Error generating component:', error);
    } finally {
      setGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Component Library</h2>
            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
              {filteredComponents.length} components
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-slate-700 p-4 space-y-4 overflow-y-auto">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search components..."
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Categories */}
            <div className="space-y-1">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-purple-500 text-white'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {category.label}
                  </button>
                );
              })}
            </div>

            {/* AI Generator */}
            <div className="pt-4 border-t border-slate-700">
              <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                AI Generator
              </h3>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe a component..."
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={3}
              />
              <button
                onClick={handleGenerateCustom}
                disabled={!customPrompt.trim() || generating}
                className="w-full mt-2 px-3 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm rounded-lg transition-colors"
              >
                {generating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>

          {/* Components Grid */}
          <div className="flex-1 flex overflow-hidden">
            {/* Grid View */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredComponents.map((component) => (
                  <div
                    key={component.id}
                    onClick={() => setSelectedComponent(component)}
                    className={`group bg-slate-700 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedComponent?.id === component.id
                        ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                        : 'border-slate-600 hover:border-purple-400'
                    }`}
                  >
                    <div className="p-4">
                      <div className="aspect-video bg-slate-800 rounded mb-3 flex items-center justify-center overflow-hidden">
                        <Code className="w-8 h-8 text-slate-600" />
                      </div>
                      <h3 className="font-semibold text-white mb-1">{component.name}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2">{component.description}</p>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {component.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-0.5 bg-slate-600 text-slate-300 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredComponents.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No components found</p>
                </div>
              )}
            </div>

            {/* Detail View */}
            {selectedComponent && (
              <div className="w-96 border-l border-slate-700 p-6 overflow-y-auto">
                <h3 className="text-lg font-semibold text-white mb-2">{selectedComponent.name}</h3>
                <p className="text-sm text-slate-400 mb-4">{selectedComponent.description}</p>

                <div className="space-y-3">
                  <button
                    onClick={() => handleInsert(selectedComponent)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Insert Component
                  </button>

                  <button
                    onClick={() => handleCopyCode(selectedComponent.code)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-white mb-2">Code:</h4>
                  <pre className="p-3 bg-slate-900 rounded text-xs text-slate-300 overflow-x-auto">
                    {selectedComponent.code}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
