import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

// Get the root element
const container = document.getElementById('root')

if (!container) {
  throw new Error('Failed to find the root element')
}

const root = createRoot(container)

root.render(
  <Router>
    <App />
  </Router>
)
