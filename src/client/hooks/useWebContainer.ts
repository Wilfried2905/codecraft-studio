import { useState, useEffect, useRef } from 'react';
import { WebContainer } from '@webcontainer/api';

export const useWebContainer = () => {
  const [instance, setInstance] = useState<WebContainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const bootedRef = useRef(false);

  useEffect(() => {
    // Boot WebContainer only once
    if (bootedRef.current) return;
    bootedRef.current = true;

    const bootContainer = async () => {
      try {
        console.log('🚀 Booting WebContainer...');
        const webcontainer = await WebContainer.boot();
        console.log('✓ WebContainer booted successfully');
        setInstance(webcontainer);
        setLoading(false);
      } catch (err) {
        console.error('✗ Failed to boot WebContainer:', err);
        setError(err instanceof Error ? err : new Error('Failed to boot WebContainer'));
        setLoading(false);
      }
    };

    bootContainer();
  }, []);

  const writeFile = async (path: string, content: string) => {
    if (!instance) throw new Error('WebContainer not initialized');
    await instance.fs.writeFile(path, content);
  };

  const readFile = async (path: string): Promise<string> => {
    if (!instance) throw new Error('WebContainer not initialized');
    return await instance.fs.readFile(path, 'utf-8');
  };

  const mkdir = async (path: string) => {
    if (!instance) throw new Error('WebContainer not initialized');
    await instance.fs.mkdir(path, { recursive: true });
  };

  const executeCommand = async (command: string, args: string[] = []): Promise<string> => {
    if (!instance) throw new Error('WebContainer not initialized');

    const process = await instance.spawn(command, args);
    
    let output = '';
    
    process.output.pipeTo(new WritableStream({
      write(data) {
        output += data;
      }
    }));

    const exitCode = await process.exit;

    if (exitCode !== 0) {
      throw new Error(`Command failed with exit code ${exitCode}`);
    }

    return output;
  };

  const installDependencies = async () => {
    if (!instance) throw new Error('WebContainer not initialized');

    console.log('📦 Installing dependencies...');
    const installProcess = await instance.spawn('npm', ['install']);
    
    installProcess.output.pipeTo(new WritableStream({
      write(data) {
        console.log(data);
      }
    }));

    const exitCode = await installProcess.exit;
    
    if (exitCode !== 0) {
      throw new Error('Failed to install dependencies');
    }

    console.log('✓ Dependencies installed');
  };

  const runDevServer = async (port = 3000) => {
    if (!instance) throw new Error('WebContainer not initialized');

    console.log('🚀 Starting dev server...');
    const serverProcess = await instance.spawn('npm', ['run', 'dev']);
    
    serverProcess.output.pipeTo(new WritableStream({
      write(data) {
        console.log(data);
      }
    }));

    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`✓ Dev server running on port ${port}`);
    
    return serverProcess;
  };

  return {
    instance,
    loading,
    error,
    writeFile,
    readFile,
    mkdir,
    executeCommand,
    installDependencies,
    runDevServer
  };
};
