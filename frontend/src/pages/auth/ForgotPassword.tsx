import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Try both possible endpoints for password reset
      const resetEndpoints = ['/auth/password/reset/', '/password/reset/'];
      let resetSuccessful = false;
      
      for (const endpoint of resetEndpoints) {
        try {
          await apiService.post(endpoint, { email });
          resetSuccessful = true;
          break;
        } catch (endpointError) {
          // Try next endpoint
          console.log(`Failed to reset using ${endpoint}:`, endpointError);
        }
      }
      
      if (resetSuccessful) {
        setSuccess(true);
      } else {
        setError('Failed to send password reset email. Please contact support.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
      console.error('Password reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-center text-2xl font-primary font-bold text-primary-900 mb-6">Reset Your Password</h2>
      
      {success ? (
        <div className="bg-success-color bg-opacity-10 p-4 rounded-md mb-6 text-success-color border border-success-color border-opacity-20">
          <p className="text-sm font-medium">
            Password reset instructions have been sent to your email.
          </p>
          <p className="text-sm mt-2">
            If you don't receive an email within a few minutes, please check your spam folder.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-error-color bg-opacity-10 p-4 rounded-md mb-4 text-error-color border border-error-color border-opacity-20">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-primary-800 mb-1">
              Email Address
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-neutral-400" aria-hidden="true" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-neutral-300 rounded-md py-3"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-700 hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
            >
              {loading ? 'Processing...' : 'Send Reset Instructions'}
            </button>
          </div>
          
          <div className="text-sm text-center">
            <span className="text-neutral-500">Remember your password?</span>{' '}
            <Link
              to="/login"
              className="font-medium text-primary-700 hover:text-primary-800 transition-colors"
            >
              Back to login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword; 