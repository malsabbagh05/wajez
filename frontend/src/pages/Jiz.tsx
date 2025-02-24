import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../App.css'

interface CachedResult {
  result: string;
  jsonData: string;
  timestamp: number;
}

interface FileCache {
  [key: string]: CachedResult;
}

function Jiz() {
  const [files, setFiles] = useState<File[]>([])
  const [result, setResult] = useState<string>('')
  const [jsonData, setJsonData] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [deepThinkerEnabled, setDeepThinkerEnabled] = useState(false)
  const [fileCache, setFileCache] = useState<FileCache>({})

  // Load cache from localStorage on component mount
  useEffect(() => {
    const savedCache = localStorage.getItem('wajez_file_cache')
    if (savedCache) {
      setFileCache(JSON.parse(savedCache))
    }
  }, [])

  // Save cache to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wajez_file_cache', JSON.stringify(fileCache))
  }, [fileCache])

  const generateFileKey = async (file: File, useDeepThinker: boolean): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return `${hashHex}_${useDeepThinker}`
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles([...files, e.target.files[0]])
      setResult('')
      setJsonData(null)
      setError(null)
      setProgress(33)
    }
  }

  const handleDownload = () => {
    if (!jsonData) return;
    
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analysis_results.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
    setProgress(0)
  }

  const handleSubmit = async () => {
    if (files.length === 0) return

    setLoading(true)
    setResult('')
    setJsonData(null)
    setError(null)
    setProgress(66)

    try {
      const file = files[0]
      const fileKey = await generateFileKey(file, deepThinkerEnabled)
      
      // Check cache first
      const cachedData = fileCache[fileKey]
      if (cachedData && (Date.now() - cachedData.timestamp) < 24 * 60 * 60 * 1000) { // 24 hours cache
        setResult(cachedData.result)
        setJsonData(cachedData.jsonData)
        setProgress(100)
        setLoading(false)
        return
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('useDeepThinker', deepThinkerEnabled.toString())

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/analyze`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to analyze file')
      }

      const data = await response.json()
      
      // Cache the result
      setFileCache(prev => ({
        ...prev,
        [fileKey]: {
          result: data.result,
          jsonData: data.json_data,
          timestamp: Date.now()
        }
      }))

      setResult(data.result)
      setJsonData(data.json_data)
      setProgress(100)
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'Error analyzing file')
      setProgress(33)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      {progress > 0 && (
        <div 
          className="progress-indicator" 
          style={{ transform: `scaleX(${progress / 100})` }} 
        />
      )}

      <header className="header">
        <Link to="/" className="logo">
          <img src="/logo.svg" alt="W" className="logo-image" />
          <span className="logo-text">ajez</span>
        </Link>
        <nav className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/jiz" className="nav-link">Jiz</Link>
        </nav>
      </header>

      <main className="main-content">
        <div className="upload-section">
          <div className="deep-thinker-toggle">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={deepThinkerEnabled}
                onChange={(e) => setDeepThinkerEnabled(e.target.checked)}
                disabled={loading}
              />
              <span className="toggle-slider"></span>
            </label>
            <span className="toggle-label">Deep Thinker {deepThinkerEnabled ? 'Enabled' : 'Disabled'}</span>
          </div>

          <div 
            className={`dropzone ${files.length > 0 ? 'has-file' : ''}`}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <div className="upload-icon">
              {files.length > 0 ? '📄' : '📁'}
            </div>
            <p>{files.length > 0 ? 'File ready for processing' : 'Select or drop a file'}</p>
            <p className="supported-formats">We support (pdf), (png, jpeg, gif, web p)</p>
            <input
              id="file-input"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg,.gif,.webp"
              style={{ display: 'none' }}
            />
          </div>

          {files.length > 0 && (
            <div className="file-list">
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <span>📄</span>
                  <span className="file-name">{file.name}</span>
                  <button className="remove-file" onClick={() => handleRemoveFile(index)}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="action-button-container">
            <button 
              className="action-button primary-button"
              onClick={handleSubmit}
              disabled={files.length === 0 || loading}
            >
              {loading ? 'Processing...' : 'Summarize'}
            </button>
            {loading && (
              <p className="status-message">Analyzing your file, please wait...</p>
            )}
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        {result && (
          <div className="results-section">
            <div className="results-header">
              <h2>Results</h2>
              <button 
                className="download-button"
                onClick={handleDownload}
                disabled={!jsonData}
              >
                Download Results
              </button>
            </div>
            <div 
              className="results-content"
              dangerouslySetInnerHTML={{ __html: result }}
            />
          </div>
        )}
      </main>
    </div>
  )
}

export default Jiz 