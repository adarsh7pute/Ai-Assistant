import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import axios from 'axios';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// app.use(bodyParser.json());

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

app.post('/api/ask', async (req, res) => {
  const { prompt, image } = req.body;

  const contents = [];

  if (image) {
    contents.push({
      parts: [
        {
          text: prompt || "Analyze this image",
        },
        {
          inlineData: {
            mimeType: "image/png", // or "image/jpeg" if needed
            data: image, // base64 only
          }
        }
      ]
    });
  } else {
    contents.push({
      parts: [{ text: prompt }]
    });
  }

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
      { contents }
    );

    const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
    res.json({ reply });
  } catch (error) {
    console.error("Error from Gemini:", error.response?.data || error.message);
    res.status(500).json({ error: "Gemini API failed" });
  }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
