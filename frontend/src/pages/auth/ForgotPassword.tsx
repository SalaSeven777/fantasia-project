import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import '../../../src/styles/wood-theme.css'; // Import the wood theme

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
    <>
      <div className="wood-welcome-banner">
        Welcome to SME FANTASIA
      </div>
      
      <div className="wood-container">
        <div className="wood-content space-y-5">
          <div className="text-center">
            <h1 className="wood-company-title">SME FANTASIA</h1>
            <p className="wood-company-tagline">Premium products and services for your business needs</p>
          </div>
          
          <div>
            <h2 className="wood-heading">Reset Your Password</h2>
          </div>
          
          {success ? (
            <div className="bg-green-50 p-4 rounded-md border border-green-200 text-wood-green-600">
              <p className="font-medium">
                Password reset instructions have been sent to your email.
              </p>
              <p className="mt-2">
                If you don't receive an email within a few minutes, please check your spam folder.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="wood-error">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="wood-input-label">
                  Email Address
                </label>
                <div className="relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-wood-neutral-500" aria-hidden="true" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="wood-input pl-10"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="wood-btn wood-btn-primary wood-hover-lift"
                >
                  {loading ? 'Processing...' : 'Send Reset Instructions'}
                </button>
              </div>
              
              <div className="text-center">
                <span className="wood-text-muted">Remember your password?</span>{' '}
                <Link
                  to="/login"
                  className="wood-link"
                >
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
      
      <div className="wood-footer">
        <div className="wood-footer-links">
          <a href="#" className="wood-footer-link">Privacy Policy</a>
          <span className="wood-text-muted">|</span>
          <a href="#" className="wood-footer-link">Terms of Service</a>
          <span className="wood-text-muted">|</span>
          <a href="#" className="wood-footer-link">Contact Us</a>
        </div>
        <div className="wood-footer-copyright">
          © 2023 SME FANTASIA. All rights reserved.
        </div>
      </div>
    </>
  );
};

export default ForgotPassword; 