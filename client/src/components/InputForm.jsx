import { Stack, TextField, Button, InputAdornment, IconButton } from '@mui/material'; // Import IconButton
import { useRef } from 'react';
import ImageSearchIcon from '@mui/icons-material/ImageSearch'; // Icon for image upload
import SendIcon from '@mui/icons-material/Send'; // Icon for send button

const InputForm = ({ inputValue, setInputValue, handleSubmit, handleImageUpload, fileInputRef }) => {
  const handleButtonClick = () => {
    fileInputRef.current.click(); // Trigger the hidden file input
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(inputValue, false);
    }}>
      <Stack spacing={2}>
        <TextField
          label="Ask something..."
          fullWidth
          variant="outlined"
          value={inputValue}
          onChange={(e) => {
            window.speechSynthesis.cancel();
            setInputValue(e.target.value);
          }}
          InputProps={{ // Add input adornment
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="upload image"
                  onClick={handleButtonClick} // Trigger hidden file input
                  edge="end"
                  color="primary"
                >
                  <ImageSearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }} // Margin bottom for spacing
        />
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          style={{ display: 'none' }} // Hide the native input
        />
        <Button
          type="submit"
          variant="contained"
          color="success"
          endIcon={<SendIcon />} // Add send icon
          size="large" // Make button larger
          sx={{ borderRadius: 2 }} // Slightly rounded corners
        >
          Send
        </Button>
      </Stack>
    </form>
  );
};

export default InputForm;
