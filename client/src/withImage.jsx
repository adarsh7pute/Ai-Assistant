import React, { useState, useEffect, useRef } from 'react';
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
  const [imageData, setImageData] = useState(null);
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);



  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        handleSubmit(transcript, true, imageRef.current); // ✅ Use ref instead of state
      };



      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };

      setRecognition(recognitionInstance);
    } else {
      alert('Your browser does not support speech recognition.');
    }
  }, []);

  const handleSubmit = async (prompt, isVoice = false, image = null) => {
    if (!prompt && !image) return;
    setResponse("Thinking...");
    window.speechSynthesis.cancel();

    try {
      const reply = await geminiResponse(prompt, "Gemini Assistant", "User", image);
      setResponse(reply);

      if (isVoice) {
        speakResponse(reply); // ✅ Voice reply even with image
      }

      setInputValue('');
      setImageData(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
    } catch (err) {
      console.error("Error occurred:", err);
      setResponse("Error occurred.");
    }
  };




  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result.split(',')[1];
        setImageData(base64Data);
        imageRef.current = base64Data; // ✅ Keep latest image
      };
      reader.readAsDataURL(file);
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
        handleSubmit(inputValue, false, imageData); // ✅ Pass imageData
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
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          ref={fileInputRef}
        />

        <button type="submit" style={{ marginLeft: '10px' }}>Send</button>
      </form>
      <ResponseDisplay response={response} />
    </div>
  );
}

export default App;
