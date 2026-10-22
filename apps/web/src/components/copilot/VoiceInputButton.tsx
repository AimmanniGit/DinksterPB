'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Radio, Volume2 } from 'lucide-react';

interface VoiceInputButtonProps {
  onTranscript: (transcript: string) => void;
  onAutoSend?: (transcript: string) => void;
  className?: string;
  autoSendEnabled?: boolean;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  onAutoSend,
  className = '',
  autoSendEnabled = false,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for Web Speech Recognition API
    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setInterimText('');
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          currentInterim += transcript;
        }
      }

      const combined = (finalTranscript || currentInterim).trim();
      if (combined) {
        setInterimText(combined);
        onTranscript(combined);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('SpeechRecognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (autoSendEnabled && interimText.trim() && onAutoSend) {
        onAutoSend(interimText.trim());
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, [onTranscript, onAutoSend, autoSendEnabled, interimText]);

  const toggleListening = () => {
    if (!supported) {
      // Fallback simulation for unsupported browsers
      const sampleQueries = [
        'Set up a 16 court tournament in Dallas with 4 divisions and Franklin balls',
        'Move court 3 matches because of a wet spot to court 5 and court 6',
        'Switch remaining Mixed Doubles matches to games to 9 win by 2 to save time',
      ];
      const randomQuery = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
      onTranscript(randomQuery);
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.warn('Failed to start speech recognition:', e);
      }
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleListening}
        className={`p-2.5 rounded-xl transition flex items-center justify-center shrink-0 ${
          isListening
            ? 'bg-red-500 text-white animate-pulse shadow-lg ring-4 ring-red-500/30'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        } ${className}`}
        title={
          isListening
            ? 'Listening... Click to stop (Hands-free voice mode active)'
            : 'Click to speak instructions hands-free (Drive / Walk mode)'
        }
      >
        {isListening ? <Mic size={16} className="animate-bounce" /> : <Mic size={16} />}
      </button>

      {/* Floating Audio Pulse Strip when active */}
      {isListening && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap shadow-xl flex items-center gap-2 border border-gray-700 z-50">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>Listening... {interimText ? `"${interimText}"` : 'Speak naturally'}</span>
          <button
            type="button"
            onClick={toggleListening}
            className="text-red-400 hover:text-white font-bold ml-1"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
};
