# Wajez - Text Analysis and Summarization Tool

Wajez is a powerful text analysis and summarization tool that helps you extract and organize information from various file formats.

## Features

- Extract text from multiple file formats (PDF, images)
- Smart text analysis and summarization
- JSON data export
- Structured table generation
- Multi-language support (English/Arabic)
- Deep Thinker mode for enhanced analysis

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- React Router for navigation
- Modern CSS with CSS Modules
- LocalStorage for client-side caching

### Backend
- Python 3.8+ with Flask
- OpenAI API for text analysis
- DeepSeek API for enhanced reasoning
- PyTesseract for OCR (Optical Character Recognition)
- PyMuPDF for PDF processing
- File-based caching system

### AI/ML Features
- GPT-4o for standard analysis
- DeepSeek Reasoner for deep thinking mode
- Multi-language OCR (English/Arabic)
- Intelligent table generation
- Structured JSON output

### Development Tools
- Git for version control
- Environment-based configuration
- TypeScript for type safety
- ESLint for code quality
- Cross-Origin Resource Sharing (CORS) enabled

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- npm or yarn
- Tesseract OCR (for image text extraction)

You'll also need:
- OpenAI API key
- DeepSeek API key

## Installation

1. Clone the repository
```bash
git clone https://github.com/malsabbagh05/wajez.git
cd wajez
```

2. Set up the backend
```bash
cd backend
# Create and activate a virtual environment (recommended)
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your API keys
```

3. Set up the frontend
```bash
cd frontend
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

## Configuration

### Backend Configuration
Edit `backend/.env` with your API keys:
```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
PORT=5000
```

### Frontend Configuration
Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

## Running the Application

1. Start the backend server
```bash
cd backend
# Make sure your virtual environment is activated
python app.py
```

2. Start the frontend development server
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173` (or the URL shown in your terminal)

## Usage

1. Navigate to the application in your web browser
2. Upload a document (supported formats: PDF, PNG, JPEG, GIF, WebP)
3. Toggle "Deep Thinker" mode if desired
4. Click "Summarize" to process the document
5. View the results and download JSON data if needed

## Troubleshooting

1. If you see "process is not defined" error:
   - Make sure your frontend `.env` file uses `VITE_` prefix for environment variables
   - Restart the frontend development server

2. If file upload fails:
   - Check that the backend server is running
   - Verify the `VITE_API_URL` points to the correct backend URL
   - Ensure your API keys are correctly set in the backend `.env` file

3. If OCR doesn't work:
   - Verify Tesseract OCR is installed on your system
   - Check the console for specific error messages

## License

This project is licensed under the MIT License - see the LICENSE file for details.
