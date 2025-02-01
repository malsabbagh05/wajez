import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { PDFDocument } from 'pdf-lib';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = join(dirname(fileURLToPath(import.meta.url)), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Setup CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}-${sanitizedName}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp'
  ];

  // Check if the file's mimetype is in our allowed list
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else if (file.originalname.toLowerCase().endsWith('.pdf') && file.mimetype === 'application/octet-stream') {
    // Special handling for PDFs that might have incorrect MIME type
    file.mimetype = 'application/pdf';
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and image files are supported.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Error handling for multer
const uploadMiddleware = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer error (e.g., file too large)
      return res.status(400).json({ error: 'File upload error: ' + err.message });
    } else if (err) {
      // Other errors (e.g., unsupported file type)
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// List available models
async function listModels() {
  try {
    const models = await openai.models.list();
    console.log('Available models:', models.data.map(model => model.id));
  } catch (error) {
    console.error('Error listing models:', error);
  }
}

// Call listModels on startup
listModels();

// System prompt for analysis
const systemPrompt = `Analyze the content and provide a structured response in GitHub-flavored markdown tables.
Use the following format for tables:

| Header1 | Header2 |
|---------|---------|
| Data1   | Data2   |

For documents: Extract key information like dates, names, amounts, and important details.
For images: Describe visual elements, text, objects, and any notable features.
Ensure proper table formatting with aligned columns using pipes and dashes.`;

async function analyzeFile(filePath, fileType, res) {
  try {
    let messages = [];
    
    if (fileType === 'application/pdf') {
      try {
        // Extract text from PDF using pdf-lib
        const pdfBytes = fs.readFileSync(filePath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const numPages = pdfDoc.getPageCount();
        
        messages = [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Analyze this ${numPages} page PDF document. Extract and organize key information such as:
1. Document type and purpose
2. Important dates, names, and numbers
3. Key sections and their content
4. Any notable formatting or structure

Please present the information in well-organized markdown tables.`
          }
        ];
      } catch (pdfError) {
        console.error('PDF handling error:', pdfError);
        throw new Error('Failed to process PDF file. Please make sure it is a valid PDF.');
      }
    } else if (fileType.startsWith('image/')) {
      // For images, we'll need to use a different approach since we can't analyze them directly
      throw new Error('Image analysis is currently not supported. Please use a PDF document instead.');
    } else {
      throw new Error('Unsupported file type. Only PDF files are currently supported.');
    }

    // Setup streaming response with GPT-3.5 Turbo for better performance
    const stream = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.7,
      max_tokens: 4000,
      stream: true
    });

    // Stream the response
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('Analysis error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
}

// File analysis endpoint with updated middleware
app.post('/api/upload', uploadMiddleware, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    console.log('Processing file:', req.file.originalname, 'Type:', req.file.mimetype);

    // Setup SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    await analyzeFile(req.file.path, req.file.mimetype, res);
    
    // Clean up: remove the temporary file
    try {
      fs.unlinkSync(req.file.path);
    } catch (err) {
      console.error('Error cleaning up file:', err);
    }
    
  } catch (error) {
    console.error('Request error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message || 'Internal server error' })}\n\n`);
    res.end();
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 