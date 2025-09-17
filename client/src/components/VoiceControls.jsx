import { Stack, Button } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic'; // Import microphone icon
import StopIcon from '@mui/icons-material/Stop'; // Import stop icon

const VoiceControls = ({ startListening, stopSpeaking }) => (
  <Stack direction="row" spacing={2} justifyContent="center" sx={{ my: 3 }}> {/* Increased margin */}
    <Button
      variant="contained"
      color="primary"
      onClick={startListening}
      startIcon={<MicIcon />} // Add microphone icon
      size="large" // Make button larger
      sx={{ borderRadius: 2 }} // Slightly rounded corners
    >
      Speak
    </Button>
    <Button
      variant="outlined" // Outlined variant for secondary action
      color="error"
      onClick={stopSpeaking}
      startIcon={<StopIcon />} // Add stop icon
      size="large" // Make button larger
      sx={{ borderRadius: 2 }} // Slightly rounded corners
    >
      Stop
    </Button>
  </Stack>
);

export default VoiceControls;
