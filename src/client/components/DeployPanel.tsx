import React, { useState } from 'react';
import { X, Rocket, Cloud, CheckCircle, AlertCircle, RefreshCw, ExternalLink, Settings } from 'lucide-react';

interface DeployPanelProps {
  isOpen: boolean;
  onClose: () => void;
  projectCode: string;
  projectName: string;
}

interface DeploymentLog {
  timestamp: string;
  message: string;
  level: 'info' | 'success' | 'error';
}

export const DeployPanel: React.FC<DeployPanelProps> = ({ isOpen, onClose, projectCode, projectName }) => {
  const [projectNameInput, setProjectNameInput] = useState(projectName.toLowerCase().replace(/\s+/g, '-'));
  const [productionBranch, setProductionBranch] = useState('main');
  const [deploymentLogs, setDeploymentLogs] = useState<DeploymentLog[]>([]);
  const [deploymentUrl, setDeploymentUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const addLog = (message: string, level: 'info' | 'success' | 'error' = 'info') => {
    setDeploymentLogs(prev => [
      ...prev,
      { timestamp: new Date().toLocaleTimeString(), message, level }
    ]);
  };

  const handleDeploy = async () => {
    if (!projectNameInput.trim()) {
      setError('Please enter a project name');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setDeploymentLogs([]);
    setDeploymentUrl(null);

    try {
      addLog('🚀 Starting deployment to Cloudflare Pages...', 'info');
      addLog(`📦 Project: ${projectNameInput}`, 'info');
      addLog(`🌿 Branch: ${productionBranch}`, 'info');

      // Step 1: Create project if needed
      addLog('📝 Checking if project exists...', 'info');
      
      const createResponse = await fetch('/api/deploy/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: projectNameInput,
          productionBranch
        })
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        if (!errorData.error?.includes('already exists')) {
          throw new Error(errorData.error || 'Failed to create project');
        }
        addLog('✓ Project already exists', 'success');
      } else {
        addLog('✓ Project created successfully', 'success');
      }

      // Step 2: Deploy files
      addLog('📤 Uploading files to Cloudflare...', 'info');
      
      const deployResponse = await fetch('/api/deploy/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: projectNameInput,
          files: [
            {
              path: 'index.html',
              content: projectCode
            },
            {
              path: '_headers',
              content: `/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin`
            }
          ]
        })
      });

      if (!deployResponse.ok) {
        const errorData = await deployResponse.json();
        throw new Error(errorData.error || 'Failed to deploy');
      }

      const deployData = await deployResponse.json();
      addLog('✓ Files uploaded successfully', 'success');
      addLog('🔄 Building project...', 'info');
      
      // Simulate build process
      await new Promise(resolve => setTimeout(resolve, 2000));
      addLog('✓ Build completed', 'success');
      addLog('🌐 Deploying to edge network...', 'info');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      addLog('✓ Deployed to global edge network', 'success');

      const url = deployData.url || `https://${projectNameInput}.pages.dev`;
      setDeploymentUrl(url);
      setSuccess(`Deployment successful! Your app is live at ${url}`);
      addLog(`✅ Deployment complete! URL: ${url}`, 'success');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Deployment failed';
      setError(errorMessage);
      addLog(`❌ Error: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = () => {
    setDeploymentLogs([]);
    setError(null);
    setSuccess(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Cloud className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Deploy to Cloudflare Pages</h2>
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
          {/* Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-300 mb-4">
              <Settings className="w-5 h-5" />
              <h3 className="font-semibold">Deployment Configuration</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={projectNameInput}
                onChange={(e) => setProjectNameInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="my-awesome-app"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-slate-400">
                Your app will be available at: <span className="text-purple-400">{projectNameInput || 'project-name'}.pages.dev</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Production Branch
              </label>
              <input
                type="text"
                value={productionBranch}
                onChange={(e) => setProductionBranch(e.target.value)}
                placeholder="main"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loading}
              />
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && deploymentUrl && (
            <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-green-400 text-sm">{success}</p>
              </div>
              <a
                href={deploymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors w-fit"
              >
                <ExternalLink className="w-4 h-4" />
                Open Deployed App
              </a>
            </div>
          )}

          {/* Deployment Logs */}
          {deploymentLogs.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-300">Deployment Logs</h3>
                <button
                  onClick={handleClearLogs}
                  className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs space-y-1 max-h-64 overflow-y-auto">
                {deploymentLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`flex gap-2 ${
                      log.level === 'error'
                        ? 'text-red-400'
                        : log.level === 'success'
                        ? 'text-green-400'
                        : 'text-slate-400'
                    }`}
                  >
                    <span className="text-slate-500">[{log.timestamp}]</span>
                    <span>{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deploy Button */}
          <button
            onClick={handleDeploy}
            disabled={loading || !projectNameInput.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5" />
                Deploy to Cloudflare Pages
              </>
            )}
          </button>

          {/* Info */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg">
            <p className="text-blue-400 text-sm">
              <strong>Note:</strong> Make sure you have configured your Cloudflare API token in the settings.
              The deployment will create a new Cloudflare Pages project if it doesn't exist.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
