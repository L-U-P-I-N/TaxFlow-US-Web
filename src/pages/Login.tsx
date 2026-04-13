import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useAppDispatch } from '../hooks/redux';
import { setUser } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Chrome } from 'lucide-react';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      // Important: Make sure this is set to handle the popup properly
      provider.setCustomParameters({
        prompt: 'select_account',
      });

      const result = await signInWithPopup(auth, provider);
      
      // Get the ID token to ensure proper authentication
      const user = result.user;
      
      if (user) {
        dispatch(setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        }));
        
        // Redirect to dashboard after successful login
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      // Handle specific error cases
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Popup was closed before completing sign-in. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Popup was blocked by browser. Please allow popups and try again.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        setError('Sign-in was cancelled. Please try again.');
      } else {
        setError('Failed to sign in with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to TaxFlow</CardTitle>
          <CardDescription>
            Sign in with your Google account to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2"
            variant="outline"
          >
            <Chrome className="h-5 w-5" />
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </Button>
          
          <div className="text-center text-sm text-gray-600">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
