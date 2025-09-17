import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import geminiResponse from './geminiResponse';

const ResponseDisplay = ({ response }) => {
  const sanitizedResponse = DOMPurify.sanitize(marked(response.trim().replace(/\n{2,}/g, '\n\n')));

  return (
    <div style={{ whiteSpace: 'pre-wrap', marginTop: '1rem' }}>
      <strong>Response:</strong>
      <div dangerouslySetInnerHTML={{ __html: sanitizedResponse }} />
    </div>
  );
};

function App() {
  const [response, setResponse] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        handleSubmit(transcript, true); // ✅ Pass true for voice input
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };

      setRecognition(recognitionInstance);
    } else {
      alert('Your browser does not support speech recognition.');
    }
  }, []);

  const handleSubmit = async (prompt, isVoice = false) => {
  if (!prompt) return;
  setResponse("Thinking...");
  window.speechSynthesis.cancel();

  try {
    const reply = await geminiResponse(prompt, "Gemini Assistant", "User ");
    setResponse(reply);

    if (isVoice) {
      speakResponse(reply); // ✅ Only speak if voice input
    }

    setInputValue('');
  } catch (err) {
    setResponse("Error occurred.");
  }
};


  const speakResponse = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    window.speechSynthesis.cancel();
    if (recognition) {
      recognition.start();
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>🧠 Gemini Virtual Assistant</h1>
      <button onClick={startListening}>🎤 Speak</button>
      <button onClick={() => { window.speechSynthesis.cancel(); }}>Stop</button>
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(inputValue, false); // ✅ Explicitly mark as typed input
      }}>
        <input
          type="text"
          placeholder="Ask something..."
          value={inputValue}
          onChange={(e) => {
            window.speechSynthesis.cancel();
            setInputValue(e.target.value);
          }}
          style={{ width: '300px', padding: '0.5rem' }}
        />
        <button type="submit" style={{ marginLeft: '10px' }}>Send</button>
      </form>
      <ResponseDisplay response={response} />
    </div>
  );
}

export default App;
