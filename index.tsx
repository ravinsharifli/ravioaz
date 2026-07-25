import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './styles/global.css';
import App from './App';

// Təhlükəsizlik toru: əgər lazy-load olunan səhifə (məs. məhsul kartı klikləndikdə) köhnə
// keşdən qalma, artıq mövcud olmayan JS faylını axtarırsa (yeni deploy-dan sonra hash dəyişib),
// "ağ ekran" göstərmək əvəzinə səhifəni bir dəfə avtomatik yeniləyir.
window.addEventListener('vite:preloadError', () => {
  const key = 'ravio-reload-once';
  if (!sessionStorage.getItem(key)) {
    sessionStorage.setItem(key, '1');
    window.location.reload();
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

// react-snap prerender zamanı hydrateRoot işlədir,
// normal brauzer yükləməsində createRoot işlədir.
if (rootElement.hasChildNodes()) {
  hydrateRoot(
    rootElement,
    <React.StrictMode>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </React.StrictMode>
  );
} else {
  createRoot(rootElement).render(
    <React.StrictMode>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </React.StrictMode>
  );
}