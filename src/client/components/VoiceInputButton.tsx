import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Circle } from 'lucide-react';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({ onTranscript, className = '' }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if Web Speech API is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'fr-FR'; // French by default, can be made configurable

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      if (interim) {
        setInterimTranscript(interim);
      }

      if (final) {
        onTranscript(final.trim());
        setInterimTranscript('');
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        // User didn't speak, just stop
        setIsListening(false);
      } else if (event.error === 'not-allowed') {
        setIsSupported(false);
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      if (isListening) {
        // Restart if still supposed to be listening
        recognition.start();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening, onTranscript]);

  const toggleListening = () => {
    if (!isSupported) {
      alert('Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setInterimTranscript('');
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
      }
    }
  };

  if (!isSupported) {
    return (
      <button
        disabled
        className={`p-2 bg-slate-700 text-slate-500 rounded-lg cursor-not-allowed ${className}`}
        title="Voice input not supported in this browser"
      >
        <MicOff className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={toggleListening}
        className={`relative p-2 rounded-lg transition-all ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/50'
            : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
        } ${className}`}
        title={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isListening ? (
          <div className="relative">
            <Mic className="w-5 h-5" />
            <Circle className="absolute -top-1 -right-1 w-3 h-3 text-white fill-current animate-pulse" />
          </div>
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>

      {/* Interim transcript tooltip */}
      {isListening && interimTranscript && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap max-w-xs overflow-hidden text-ellipsis">
          {interimTranscript}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900" />
        </div>
      )}

      {/* Listening indicator */}
      {isListening && (
        <div className="absolute -bottom-1 -right-1 flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
          <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse delay-75" />
          <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse delay-150" />
        </div>
      )}
    </div>
  );
};
