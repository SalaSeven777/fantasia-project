import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppRoutes from './routes';
import { AuthProvider } from './contexts/AuthContext';

// Import i18n
import './i18n';

// Simple loading component for i18n suspense fallback
const Loading = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
  </div>
);

const App: React.FC = () => {
  return (
    <Suspense fallback={<Loading />}>
    <Provider store={store}>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
            rtl={document.documentElement.dir === 'rtl'}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </Provider>
    </Suspense>
  );
};

export default App;
