import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import '../../../src/styles/wood-theme.css'; // Import the wood theme

const Register: React.FC = () => {
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  
  // Redux hooks
  const dispatch = useAppDispatch();
  const { loading, error: authError, isAuthenticated } = useAppSelector((state) => state.auth);
  
  // Router hooks
  const navigate = useNavigate();

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!firstName || !lastName || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      // Log the data we're sending
      console.log('Sending registration data:', {
        first_name: firstName,
        last_name: lastName,
        email,
        password: '********' // Don't log actual password
      });
      
      // Dispatch register action
      await dispatch(register({
        first_name: firstName,
        last_name: lastName,
        email,
        password
      })).unwrap();
      // Success - user will be redirected by the useEffect
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Handle different error formats
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.errors) {
        // Try to extract field-specific error messages
        const errorDetails = [];
        
        // Check common fields
        if (err.errors.email) {
          errorDetails.push(`Email: ${Array.isArray(err.errors.email) ? err.errors.email.join(', ') : err.errors.email}`);
        }
        if (err.errors.password) {
          errorDetails.push(`Password: ${Array.isArray(err.errors.password) ? err.errors.password.join(', ') : err.errors.password}`);
        }
        if (err.errors.first_name) {
          errorDetails.push(`First name: ${Array.isArray(err.errors.first_name) ? err.errors.first_name.join(', ') : err.errors.first_name}`);
        }
        if (err.errors.last_name) {
          errorDetails.push(`Last name: ${Array.isArray(err.errors.last_name) ? err.errors.last_name.join(', ') : err.errors.last_name}`);
        }
        if (err.errors.non_field_errors) {
          errorDetails.push(Array.isArray(err.errors.non_field_errors) ? err.errors.non_field_errors.join(', ') : err.errors.non_field_errors);
        }
        
        // If we have specific error details, use those
        if (errorDetails.length > 0) {
          errorMessage = errorDetails.join('; ');
        }
      } else if (err.message) {
        // Use the error message if available
        errorMessage = err.message;
      }
      
      setError(errorMessage);
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
            <h2 className="wood-heading">Create your account</h2>
          </div>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="first-name" className="wood-input-label">
                    First Name
                  </label>
                  <input
                    id="first-name"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    className="wood-input"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="last-name" className="wood-input-label">
                    Last Name
                  </label>
                  <input
                    id="last-name"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    className="wood-input"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="wood-input-label">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="wood-input"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="wood-input-label">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="wood-input pr-10"
                    placeholder="Password (min 8 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-wood-neutral-500 hover:text-wood-brown-600 focus:outline-none"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="confirm-password" className="wood-input-label">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className="wood-input pr-10"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-wood-neutral-500 hover:text-wood-brown-600 focus:outline-none"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {(error || authError) && (
              <div className="wood-error">
                {error || authError}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="wood-btn wood-btn-primary wood-hover-lift"
              >
                {loading ? 'Creating account...' : 'Sign up'}
              </button>
            </div>
            
            <div className="wood-divider">
              <span className="wood-divider-text">
                Or sign up with
              </span>
            </div>
            
            <div>
              <button
                type="button"
                className="wood-btn wood-btn-outline wood-hover-lift flex items-center justify-center"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign up with Google
              </button>
            </div>
          </form>
          
          <div className="text-center">
            <span className="wood-text-muted">Already have an account?</span>{' '}
            <Link to="/login" className="wood-link">
              Sign in now
            </Link>
          </div>
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

export default Register; 