import { Typography } from '@mui/material';

const Header = () => (
  <Typography
    variant="h3" // Slightly larger font size
    align="center"
    gutterBottom
    sx={{
      fontWeight: 'bold',
      color: '#1976d2', // Keep the blue color
      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)', // Subtle text shadow
      mb: 3, // More margin bottom
    }}
  >
    🧠Virtual Assistant
  </Typography>
);

export default Header;
