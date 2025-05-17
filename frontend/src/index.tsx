import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import reportWebVitals from './reportWebVitals';

// Import styles
import './global.css';
import './i18n'; // Import i18n before App to ensure it's initialized

// Import Google Fonts for wood theme
// @ts-ignore
import WebFont from 'webfontloader';

// Load fonts
WebFont.load({
  google: {
    families: ['Poppins:400,500,600,700', 'Playfair Display:400,700']
  }
});

// Set document direction based on saved language
const savedLanguage = localStorage.getItem('i18nextLng') || localStorage.getItem('userLanguage');
if (savedLanguage === 'ar') {
  document.documentElement.dir = 'rtl';
  document.documentElement.lang = 'ar';
  document.documentElement.classList.add('rtl');
} else {
  document.documentElement.dir = 'ltr';
  document.documentElement.lang = savedLanguage?.split('-')[0] || 'en';
  document.documentElement.classList.remove('rtl');
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
