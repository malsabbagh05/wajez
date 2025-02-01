# Wajez - Text Analysis and Summarization Tool

Wajez is a powerful text analysis and summarization tool that helps you extract and organize information from various file formats.

## Features

- Extract text from multiple file formats (PDF, images)
- Smart text analysis and summarization
- JSON data export
- Structured table generation
- Multi-language support (English/Arabic)
- Deep Thinker mode for enhanced analysis

## Project Structure

```
wajez/
├── frontend/           # React frontend application
├── backend/           # Python backend API
├── .env              # Development environment variables
├── .env.production   # Production environment variables
├── vercel.json       # Vercel deployment configuration
└── README.md         # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/wajez.git
cd wajez
```

2. Install frontend dependencies
```bash
cd frontend
npm install
```

3. Install backend dependencies
```bash
cd backend
pip install -r requirements.txt
```

4. Set up environment variables
- Copy `.env.example` to `.env`
- Update the variables as needed

### Development

1. Start the backend server
```bash
cd backend
python app.py
```

2. Start the frontend development server
```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## Deployment

The frontend is configured for deployment with Vercel. The backend should be deployed separately to your preferred hosting service.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
