import React, { useState, useEffect, useRef } from 'react';
import { Container, Box, Paper, Button, CircularProgress, Typography } from '@mui/material'; // Import Typography
import geminiResponse from './utils/geminiResponse';
import Header from './components/Header';
import VoiceControls from './components/VoiceControls';
import InputForm from './components/InputForm';
import DOMPurify from 'dompurify'; // Import DOMPurify
import { marked } from 'marked'; // Import marked for Markdown parsing

function App() {
  const [response, setResponse] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(false); // New state for loading
  const imageRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        handleSubmit(transcript, true);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setLoading(false); // Ensure loading is off on error
      };
      setRecognition(recognitionInstance);
    } else {
      alert('Your browser does not support speech recognition.');
    }
  }, []);

  const handleSubmit = async (prompt, isVoice = false) => {
    if (!prompt && !imageRef.current) return;
    setResponse(""); // Clear previous response
    setLoading(true); // Set loading to true
    window.speechSynthesis.cancel();

    try {
      const reply = await geminiResponse(prompt, "Gemini Assistant", "User    ", imageRef.current);
      setResponse(reply);
      if (isVoice) speakResponse(reply);
      setInputValue('');
    } catch (err) {
      console.error("Error:", err);
      setResponse("Error occurred.");
    } finally {
      setLoading(false); // Set loading to false regardless of success or error
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        setImageData(base64);
        imageRef.current = base64;
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageData(null);
    imageRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = null; // Reset file input field
    }
  };

  const speakResponse = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    window.speechSynthesis.cancel();
    if (recognition) recognition.start();
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(to right, #e0f7fa, #bbdefb)', // Lighter, more inviting gradient
        display: 'flex',
        alignItems: 'flex-start', // Align items to the start
        justifyContent: 'center',
        padding: 2,
        overflowX: 'hidden', // Prevent horizontal scrolling
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={8} sx={{ // Increased elevation for more depth
          padding: 4,
          borderRadius: 4,
          backgroundColor: '#ffffff', // Solid white for content area
          boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.1)', // Softer, more pronounced shadow
        }}>
          <Header />
          <VoiceControls startListening={startListening} stopSpeaking={stopSpeaking} />
          
          {/* InputForm with sticky position */}
          <Box sx={{ position: 'sticky', top: 0, zIndex: 1, width: '100%', mb: 2 }}> {/* Box to contain InputForm */}
            <InputForm
              inputValue={inputValue}
              setInputValue={setInputValue}
              handleSubmit={handleSubmit}
              handleImageUpload={handleImageUpload}
              fileInputRef={fileInputRef}
            />
          </Box>

          {/* Show Clear Image button only if imageData exists */}
          {imageData && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={clearImage}
              sx={{ mt: 2, width: '100%' }} // Full width for better alignment
            >
              Clear Image
            </Button>
          )}

          
        </Paper>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress color="primary" />
            </Box>
          )}
        {/* Response Display outside of the Paper component */}
        {!loading && response && (
          <Typography
            variant="body1" // Use body1 for normal text
            sx={{
              mt: 4, // Margin top for spacing
              color: '#333', // Darker text for readability
              whiteSpace: 'pre-wrap', // Preserve whitespace and line breaks
              fontFamily: 'Roboto, sans-serif', // Consistent font
              lineHeight: 1.6, // Improved line height for readability
              width: '100%', // Ensure response takes full width
            }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(response.trim().replace(/\n{2,}/g, '\n\n'))) }} // Render sanitized HTML
          />
        )}
      </Container>
    </Box>
  );
}

export default App;
