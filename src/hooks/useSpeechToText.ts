import { useState, useCallback, useRef } from 'react';

interface UseSpeechToTextReturn {
  isListening: boolean;
  isSupported: boolean;
  finalText: string;
  interimText: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechToText(): UseSpeechToTextReturn {
  const [isListening, setIsListening] = useState(false);
  const [finalText, setFinalText] = useState('');
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<any>(null);
  const finalTextRef = useRef('');

  const SpeechRecognition =
    typeof window !== 'undefined'
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;

  const isSupported = !!SpeechRecognition;

  const startListening = useCallback(() => {
    if (!SpeechRecognition || recognitionRef.current) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'de-CH';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    finalTextRef.current = '';
    setFinalText('');
    setInterimText('');

    recognition.onresult = (event: any) => {
      let currentFinal = finalTextRef.current;
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          currentFinal += (currentFinal ? ' ' : '') + transcript.trim();
        } else {
          currentInterim = transcript;
        }
      }

      finalTextRef.current = currentFinal;
      setFinalText(currentFinal);
      setInterimText(currentInterim);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        setIsListening(false);
        recognitionRef.current = null;
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText('');
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [SpeechRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimText('');
  }, []);

  const resetTranscript = useCallback(() => {
    finalTextRef.current = '';
    setFinalText('');
    setInterimText('');
  }, []);

  return {
    isListening,
    isSupported,
    finalText,
    interimText,
    startListening,
    stopListening,
    resetTranscript,
  };
}
