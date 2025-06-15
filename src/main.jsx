import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { SurveyProvider } from './contexts/SurveyContext'; // ✅ 추가
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SurveyProvider> {/* ✅ 추가: SurveyContext로 App 감싸기 */}
        <App />
      </SurveyProvider>
    </BrowserRouter>
  </React.StrictMode>
);
