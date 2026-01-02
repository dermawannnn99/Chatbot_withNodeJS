import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running ✅' });
});

// Chat endpoint - ini yang akan dipanggil dari frontend
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    // Validasi input
    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message tidak boleh kosong' });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API Key tidak terkonfigurasi di backend' });
    }

    // Request ke Gemini API
    const requestBody = {
      contents: [{
        parts: [{
          text: message
        }]
      }]
    };

    const response = await fetch(`${API_BASE}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    // Handle error dari Gemini
    if (!response.ok) {
      const error = data.error?.message || 'Terjadi kesalahan pada Gemini API';
      return res.status(response.status).json({ error });
    }

    // Extract response dari Gemini
    const botMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Tidak ada respons';

    // Return ke frontend
    res.json({ 
      success: true,
      message: botMessage,
      usage: {
        inputTokens: data.usageMetadata?.promptTokenCount || 0,
        outputTokens: data.usageMetadata?.candidatesTokenCount || 0
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: error.message || 'Terjadi kesalahan pada server'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Backend berjalan di http://localhost:${PORT}`);
  console.log(`📝 API endpoint: POST http://localhost:${PORT}/api/chat`);
  console.log(`💚 Health check: GET http://localhost:${PORT}/api/health\n`);
});
