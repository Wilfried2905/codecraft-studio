/**
 * FileUpload Component - Upload Word, Excel, PowerPoint, PDF
 */

import { useRef, useState } from 'react';
import { Upload, X, FileText, FileSpreadsheet, File, Check } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
  status: 'uploading' | 'success' | 'error';
}

interface FileUploadProps {
  onFilesUploaded: (files: Array<{ name: string; content: string; type: string }>) => void;
}

export default function FileUpload({ onFilesUploaded }: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ACCEPTED_TYPES = {
    'application/pdf': '.pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'application/vnd.ms-powerpoint': '.ppt',
    'text/plain': '.txt',
  };

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  /**
   * Gère le clic sur la zone d'upload
   */
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Gère la sélection de fichiers
   */
  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const fileArray = Array.from(selectedFiles);
    
    // Valider les fichiers
    const validFiles = fileArray.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`${file.name} est trop volumineux (max 10MB)`);
        return false;
      }
      if (!Object.keys(ACCEPTED_TYPES).includes(file.type) && !file.name.match(/\.(pdf|docx?|xlsx?|pptx?|txt)$/i)) {
        alert(`${file.name} n'est pas un format supporté`);
        return false;
      }
      return true;
    });

    // Créer les objets UploadedFile
    const newFiles: UploadedFile[] = validFiles.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type || getTypeFromExtension(file.name),
      status: 'uploading',
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Upload les fichiers
    for (let i = 0; i < validFiles.length; i++) {
      await uploadFile(validFiles[i], newFiles[i].id);
    }
  };

  /**
   * Upload un fichier via l'API
   */
  const uploadFile = async (file: File, fileId: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/parse-file', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      // Mettre à jour le fichier avec le contenu parsé
      setFiles(prev =>
        prev.map(f =>
          f.id === fileId
            ? { ...f, content: data.content, status: 'success' }
            : f
        )
      );

      // Notifier le parent
      notifyParent();

    } catch (error) {
      console.error('Erreur upload:', error);
      setFiles(prev =>
        prev.map(f =>
          f.id === fileId ? { ...f, status: 'error' } : f
        )
      );
    }
  };

  /**
   * Notifie le composant parent des fichiers uploadés
   */
  const notifyParent = () => {
    const successfulFiles = files
      .filter(f => f.status === 'success' && f.content)
      .map(f => ({
        name: f.name,
        content: f.content!,
        type: f.type,
      }));

    if (successfulFiles.length > 0) {
      onFilesUploaded(successfulFiles);
    }
  };

  /**
   * Supprime un fichier
   */
  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    notifyParent();
  };

  /**
   * Gère le drag & drop
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    await handleFileSelect(e.dataTransfer.files);
  };

  /**
   * Récupère l'icône selon le type de fichier
   */
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    if (['pdf'].includes(ext || '')) return <File className="w-5 h-5 text-red-500" />;
    if (['doc', 'docx'].includes(ext || '')) return <FileText className="w-5 h-5 text-blue-500" />;
    if (['xls', 'xlsx'].includes(ext || '')) return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
    if (['ppt', 'pptx'].includes(ext || '')) return <File className="w-5 h-5 text-orange-500" />;
    
    return <File className="w-5 h-5 text-gray-500" />;
  };

  /**
   * Formate la taille du fichier
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  /**
   * Obtient le type MIME depuis l'extension
   */
  function getTypeFromExtension(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const typeMap: Record<string, string> = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      doc: 'application/msword',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      xls: 'application/vnd.ms-excel',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ppt: 'application/vnd.ms-powerpoint',
      txt: 'text/plain',
    };
    return typeMap[ext || ''] || 'application/octet-stream';
  }

  return (
    <div className="w-full">
      {/* Zone d'upload */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200
          ${isDragging 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
          }
        `}
      >
        <Upload className={`w-12 h-12 mx-auto mb-3 ${isDragging ? 'text-primary-500' : 'text-gray-400'}`} />
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span className="font-semibold text-primary-600 dark:text-primary-400">Cliquez pour upload</span> ou glissez-déposez
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          PDF, Word, Excel, PowerPoint (max 10MB)
        </p>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={Object.values(ACCEPTED_TYPES).join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Liste des fichiers */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map(file => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              {/* Icône */}
              <div className="flex-shrink-0">
                {getFileIcon(file.name)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(file.size)}
                </p>
              </div>

              {/* Status */}
              <div className="flex-shrink-0 flex items-center gap-2">
                {file.status === 'uploading' && (
                  <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                )}
                {file.status === 'success' && (
                  <Check className="w-5 h-5 text-green-500" />
                )}
                {file.status === 'error' && (
                  <X className="w-5 h-5 text-red-500" />
                )}

                {/* Bouton supprimer */}
                <button
                  onClick={() => removeFile(file.id)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
