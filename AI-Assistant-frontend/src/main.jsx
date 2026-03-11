import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from "@react-oauth/google";
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  
  <GoogleOAuthProvider clientId='66052120990-1r3763utqjkm1rcnnefn3jerajjipgco.apps.googleusercontent.com'>
    <App />
  </GoogleOAuthProvider>
    
  
)
