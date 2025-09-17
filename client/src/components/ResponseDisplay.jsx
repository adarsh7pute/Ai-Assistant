import { Typography } from '@mui/material'; // Import Typography
import DOMPurify from 'dompurify';
import { marked } from 'marked';

const ResponseDisplay = ({ response }) => {
  // Only sanitize and mark if there's a response to avoid errors with empty string
  const sanitized = response ? DOMPurify.sanitize(marked(response.trim().replace(/\n{2,}/g, '\n\n'))) : '';

  if (!response) {
    return null; // Don't render anything if there's no response
  }

  return (
    <Typography
      variant="body1" // Use body1 for normal text
      sx={{
        mt: 2, // Margin top for spacing
        color: '#333', // Darker text for readability
        whiteSpace: 'pre-wrap', // Preserve whitespace and line breaks
        fontFamily: 'Roboto, sans-serif', // Consistent font
        lineHeight: 1.6, // Improved line height for readability
      }}
      dangerouslySetInnerHTML={{ __html: sanitized }} // Render sanitized HTML
    />
  );
};

export default ResponseDisplay;
