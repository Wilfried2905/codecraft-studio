import React, { useState } from 'react';
import { X, Image as ImageIcon, Sparkles, Download, RefreshCw, Wand2, AlertCircle, CheckCircle } from 'lucide-react';

interface ImageGenerationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onImageGenerated?: (imageUrl: string) => void;
}

interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: string;
}

export const ImageGenerationPanel: React.FC<ImageGenerationPanelProps> = ({ 
  isOpen, 
  onClose, 
  onImageGenerated 
}) => {
  const [prompt, setPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const examplePrompts = [
    'A modern minimalist logo for a tech startup',
    'Abstract geometric background in teal and purple',
    'Professional product photo of a smartphone',
    'Futuristic dashboard UI design',
    'Elegant landing page hero image',
    'Creative illustration for a blog post'
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();
      const newImage: GeneratedImage = {
        url: data.imageUrl,
        prompt,
        timestamp: new Date().toISOString()
      };

      setGeneratedImages(prev => [newImage, ...prev]);
      setSuccess('Image generated successfully!');
      
      if (onImageGenerated) {
        onImageGenerated(data.imageUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-image-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download image:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Wand2 className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">AI Image Generation</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Prompt Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Describe the image you want to generate
              </label>
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A futuristic cityscape at sunset with flying cars..."
                  rows={4}
                  className="w-full px-4 py-3 pr-12 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  disabled={loading}
                />
                <Sparkles className="absolute top-3 right-3 w-5 h-5 text-purple-400" />
              </div>
            </div>

            {/* Example Prompts */}
            <div>
              <p className="text-xs text-slate-400 mb-2">Quick examples:</p>
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(example)}
                    disabled={loading}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-300 text-xs rounded-lg transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ImageIcon className="w-5 h-5" />
                  Generate Image
                </>
              )}
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          {/* Generated Images Gallery */}
          {generatedImages.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-300">Generated Images</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedImages.map((image, index) => (
                  <div
                    key={index}
                    className="group relative bg-slate-700 rounded-lg overflow-hidden border border-slate-600 hover:border-purple-500 transition-colors"
                  >
                    <div className="aspect-square">
                      <img
                        src={image.url}
                        alt={image.prompt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                      <p className="text-white text-sm line-clamp-3">{image.prompt}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownload(image.url, index)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                        {onImageGenerated && (
                          <button
                            onClick={() => onImageGenerated(image.url)}
                            className="px-3 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm rounded-lg transition-colors"
                            title="Use in code"
                          >
                            Use
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Timestamp badge */}
                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 rounded text-xs text-white">
                      {new Date(image.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {generatedImages.length === 0 && !loading && (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-sm">
                No images generated yet. Enter a prompt above to get started!
              </p>
            </div>
          )}

          {/* Info */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg">
            <p className="text-blue-400 text-sm">
              <strong>Powered by Cloudflare Workers AI</strong> - Generate images using state-of-the-art AI models.
              Perfect for creating UI mockups, logos, backgrounds, and illustrations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
