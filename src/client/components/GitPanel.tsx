import React, { useState, useEffect } from 'react';
import { X, GitBranch, GitCommit, Upload, RefreshCw, History, Plus, CheckCircle, AlertCircle } from 'lucide-react';

interface GitPanelProps {
  isOpen: boolean;
  onClose: () => void;
  projectCode: string;
  projectName: string;
}

interface Repository {
  name: string;
  full_name: string;
  html_url: string;
  private: boolean;
}

interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
}

type TabType = 'push' | 'history' | 'new';

export const GitPanel: React.FC<GitPanelProps> = ({ isOpen, onClose, projectCode, projectName }) => {
  const [activeTab, setActiveTab] = useState<TabType>('push');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [commitMessage, setCommitMessage] = useState('Update from CodeCraft Studio');
  const [branch, setBranch] = useState('main');
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoPrivate, setNewRepoPrivate] = useState(false);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && activeTab === 'push') {
      loadRepositories();
    }
  }, [isOpen, activeTab]);

  const loadRepositories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/git/repositories');
      if (!response.ok) throw new Error('Failed to load repositories');
      const data = await response.json();
      setRepositories(data.repositories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load repositories');
    } finally {
      setLoading(false);
    }
  };

  const loadCommitHistory = async () => {
    if (!selectedRepo) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/git/commits?repo=${selectedRepo}&branch=${branch}`);
      if (!response.ok) throw new Error('Failed to load commit history');
      const data = await response.json();
      setCommits(data.commits || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load commits');
    } finally {
      setLoading(false);
    }
  };

  const handlePush = async () => {
    if (!selectedRepo || !commitMessage.trim()) {
      setError('Please select a repository and enter a commit message');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/git/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repository: selectedRepo,
          branch,
          message: commitMessage,
          files: [
            {
              path: 'index.html',
              content: projectCode
            },
            {
              path: 'README.md',
              content: `# ${projectName}\n\nGenerated with CodeCraft Studio\n\n## Features\n- Modern UI\n- Responsive design\n- Clean code`
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to push to GitHub');
      }

      const data = await response.json();
      setSuccess(`Successfully pushed to ${selectedRepo}! Commit: ${data.commit?.sha?.substring(0, 7)}`);
      setCommitMessage('Update from CodeCraft Studio');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to push to GitHub');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRepo = async () => {
    if (!newRepoName.trim()) {
      setError('Please enter a repository name');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/git/repository', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRepoName,
          private: newRepoPrivate,
          description: `${projectName} - Created with CodeCraft Studio`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create repository');
      }

      const data = await response.json();
      setSuccess(`Repository ${data.repository.full_name} created successfully!`);
      setNewRepoName('');
      setActiveTab('push');
      loadRepositories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create repository');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <GitBranch className="w-6 h-6 text-teal-400" />
            <h2 className="text-xl font-bold text-white">Git Integration</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-4 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('push')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'push'
                ? 'bg-teal-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Upload className="w-4 h-4" />
            Push Code
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              if (selectedRepo) loadCommitHistory();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-teal-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <History className="w-4 h-4" />
            History
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'new'
                ? 'bg-teal-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Plus className="w-4 h-4" />
            New Repo
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-500/10 border border-green-500 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          {/* Push Tab */}
          {activeTab === 'push' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Repository
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedRepo}
                    onChange={(e) => setSelectedRepo(e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    disabled={loading}
                  >
                    <option value="">Choose a repository...</option>
                    {repositories.map((repo) => (
                      <option key={repo.full_name} value={repo.full_name}>
                        {repo.full_name} {repo.private ? '(Private)' : '(Public)'}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={loadRepositories}
                    disabled={loading}
                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50"
                    title="Refresh repositories"
                  >
                    <RefreshCw className={`w-5 h-5 text-slate-300 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Branch
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Commit Message
                </label>
                <textarea
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="Describe your changes..."
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  disabled={loading}
                />
              </div>

              <button
                onClick={handlePush}
                disabled={loading || !selectedRepo || !commitMessage.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-lg transition-colors"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Pushing...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Push to GitHub
                  </>
                )}
              </button>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {!selectedRepo ? (
                <p className="text-slate-400 text-center py-8">
                  Select a repository from the Push tab to view commit history
                </p>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-slate-300 text-sm">
                      {commits.length} commits in <span className="font-mono text-teal-400">{selectedRepo}</span>
                    </p>
                    <button
                      onClick={loadCommitHistory}
                      disabled={loading}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  </div>

                  <div className="space-y-2">
                    {commits.length === 0 && !loading ? (
                      <p className="text-slate-400 text-center py-8">No commits found</p>
                    ) : (
                      commits.map((commit) => (
                        <div
                          key={commit.sha}
                          className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-teal-500/50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <GitCommit className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium truncate">{commit.message}</p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                <span>{commit.author}</span>
                                <span>•</span>
                                <span>{new Date(commit.date).toLocaleString()}</span>
                                <span>•</span>
                                <code className="px-2 py-0.5 bg-slate-800 rounded">{commit.sha.substring(0, 7)}</code>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* New Repo Tab */}
          {activeTab === 'new' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Repository Name
                </label>
                <input
                  type="text"
                  value={newRepoName}
                  onChange={(e) => setNewRepoName(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                  placeholder="my-awesome-project"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-slate-400">
                  Only letters, numbers, hyphens, and underscores allowed
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRepoPrivate}
                    onChange={(e) => setNewRepoPrivate(e.target.checked)}
                    className="w-4 h-4 text-teal-500 bg-slate-700 border-slate-600 rounded focus:ring-2 focus:ring-teal-500"
                    disabled={loading}
                  />
                  <span className="text-sm text-slate-300">Make repository private</span>
                </label>
              </div>

              <button
                onClick={handleCreateRepo}
                disabled={loading || !newRepoName.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-lg transition-colors"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Create Repository
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
