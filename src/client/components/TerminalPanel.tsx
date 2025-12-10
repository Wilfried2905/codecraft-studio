import React, { useEffect, useRef, useState } from 'react';
import { Terminal as TerminalIcon, X, Play, Square, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';

interface TerminalPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand?: (command: string) => Promise<string>;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
  isOpen,
  onClose,
  onExecuteCommand
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstance = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const commandHistory = useRef<string[]>([]);
  const historyIndex = useRef<number>(-1);
  const currentCommand = useRef<string>('');

  useEffect(() => {
    if (!isOpen || !terminalRef.current) return;

    // Initialize terminal
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
      theme: {
        background: '#0f172a',
        foreground: '#e2e8f0',
        cursor: '#14b8a6',
        black: '#1e293b',
        red: '#ef4444',
        green: '#10b981',
        yellow: '#f59e0b',
        blue: '#3b82f6',
        magenta: '#a855f7',
        cyan: '#06b6d4',
        white: '#cbd5e1',
        brightBlack: '#475569',
        brightRed: '#f87171',
        brightGreen: '#34d399',
        brightYellow: '#fbbf24',
        brightBlue: '#60a5fa',
        brightMagenta: '#c084fc',
        brightCyan: '#22d3ee',
        brightWhite: '#f1f5f9'
      },
      rows: 20,
      cols: 80
    });

    // Add addons
    const fit = new FitAddon();
    const webLinks = new WebLinksAddon();
    
    term.loadAddon(fit);
    term.loadAddon(webLinks);
    
    fitAddon.current = fit;
    terminalInstance.current = term;

    // Open terminal in DOM
    term.open(terminalRef.current);
    fit.fit();

    // Welcome message
    term.writeln('\x1b[1;36m╔═══════════════════════════════════════════════════════╗\x1b[0m');
    term.writeln('\x1b[1;36m║      CodeCraft Studio - Interactive Terminal          ║\x1b[0m');
    term.writeln('\x1b[1;36m╚═══════════════════════════════════════════════════════╝\x1b[0m');
    term.writeln('');
    term.writeln('\x1b[1;32m✓\x1b[0m WebContainer environment ready');
    term.writeln('\x1b[1;33m💡\x1b[0m Type commands to interact with your code');
    term.writeln('\x1b[1;36m📝\x1b[0m Available commands: npm, node, clear, help');
    term.writeln('');
    prompt(term);

    // Handle input
    let currentLine = '';

    term.onData((data) => {
      const char = data;

      switch (char) {
        case '\r': // Enter
          term.write('\r\n');
          if (currentLine.trim()) {
            commandHistory.current.push(currentLine);
            historyIndex.current = commandHistory.current.length;
            executeCommand(term, currentLine.trim());
          } else {
            prompt(term);
          }
          currentLine = '';
          break;

        case '\u007F': // Backspace
          if (currentLine.length > 0) {
            currentLine = currentLine.slice(0, -1);
            term.write('\b \b');
          }
          break;

        case '\u001b[A': // Up arrow
          if (historyIndex.current > 0) {
            // Clear current line
            term.write('\r\x1b[K');
            prompt(term);
            
            historyIndex.current--;
            currentLine = commandHistory.current[historyIndex.current];
            term.write(currentLine);
          }
          break;

        case '\u001b[B': // Down arrow
          if (historyIndex.current < commandHistory.current.length) {
            // Clear current line
            term.write('\r\x1b[K');
            prompt(term);
            
            historyIndex.current++;
            currentLine = historyIndex.current < commandHistory.current.length
              ? commandHistory.current[historyIndex.current]
              : '';
            term.write(currentLine);
          }
          break;

        case '\u0003': // Ctrl+C
          term.write('^C\r\n');
          currentLine = '';
          prompt(term);
          break;

        default:
          // Regular character
          if (char >= String.fromCharCode(0x20) && char <= String.fromCharCode(0x7E)) {
            currentLine += char;
            term.write(char);
          }
      }

      currentCommand.current = currentLine;
    });

    // Resize handler
    const handleResize = () => {
      fit.fit();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, [isOpen]);

  const prompt = (term: Terminal) => {
    term.write('\r\n\x1b[1;32m❯\x1b[0m ');
  };

  const executeCommand = async (term: Terminal, command: string) => {
    setIsRunning(true);

    try {
      // Built-in commands
      if (command === 'clear') {
        term.clear();
        prompt(term);
        setIsRunning(false);
        return;
      }

      if (command === 'help') {
        term.writeln('');
        term.writeln('\x1b[1;36mAvailable commands:\x1b[0m');
        term.writeln('  \x1b[1;32mclear\x1b[0m     - Clear terminal');
        term.writeln('  \x1b[1;32mhelp\x1b[0m      - Show this help');
        term.writeln('  \x1b[1;32mexit\x1b[0m      - Close terminal');
        term.writeln('  \x1b[1;32mnpm\x1b[0m       - Run npm commands');
        term.writeln('  \x1b[1;32mnode\x1b[0m      - Run Node.js');
        term.writeln('');
        prompt(term);
        setIsRunning(false);
        return;
      }

      if (command === 'exit') {
        onClose();
        setIsRunning(false);
        return;
      }

      // Execute through WebContainer (if handler provided)
      if (onExecuteCommand) {
        term.writeln('\x1b[1;33m⚙ Executing...\x1b[0m');
        const output = await onExecuteCommand(command);
        term.writeln(output);
      } else {
        term.writeln(`\x1b[1;31m✗\x1b[0m Command not available yet: ${command}`);
        term.writeln('\x1b[1;33m💡\x1b[0m WebContainer integration coming soon');
      }

      prompt(term);
    } catch (error) {
      term.writeln(`\x1b[1;31m✗ Error:\x1b[0m ${error instanceof Error ? error.message : 'Unknown error'}`);
      prompt(term);
    } finally {
      setIsRunning(false);
    }
  };

  const handleClear = () => {
    if (terminalInstance.current) {
      terminalInstance.current.clear();
      prompt(terminalInstance.current);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      fitAddon.current?.fit();
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed ${isFullscreen ? 'inset-0' : 'inset-x-0 bottom-0 h-96'} bg-slate-900 border-t border-slate-700 shadow-2xl z-50 flex flex-col transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <TerminalIcon className="w-5 h-5 text-teal-400" />
          <span className="text-sm font-semibold text-white">Terminal</span>
          {isRunning && (
            <span className="flex items-center gap-1.5 text-xs text-yellow-400">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              Running...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Clear Button */}
          <button
            onClick={handleClear}
            className="p-1.5 hover:bg-slate-700 rounded transition-colors"
            title="Clear terminal"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 hover:bg-slate-700 rounded transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-slate-400" />
            ) : (
              <Maximize2 className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-700 rounded transition-colors"
            title="Close terminal"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Terminal Container */}
      <div className="flex-1 overflow-hidden">
        <div
          ref={terminalRef}
          className="h-full w-full p-2"
          style={{ background: '#0f172a' }}
        />
      </div>

      {/* Status Bar */}
      <div className="px-4 py-1.5 bg-slate-800 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
        <span>WebContainer Ready</span>
        <span>Press Ctrl+C to interrupt • Type 'help' for commands</span>
      </div>
    </div>
  );
};
