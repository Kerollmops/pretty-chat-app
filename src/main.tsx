import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import ToolInterceptorService from './services/toolInterceptorService'

// Initialize the tool interceptor service
ToolInterceptorService.getInstance();

createRoot(document.getElementById("root")!).render(<App />);
