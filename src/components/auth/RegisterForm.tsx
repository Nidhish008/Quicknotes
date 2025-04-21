
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Mail } from 'lucide-react';

const RegisterForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  
  const { register, verifyEmail } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register(name, email, password);
      setIsRegistered(true);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndLogin = async () => {
    try {
      await verifyEmail(email);
      navigate('/login');
    } catch (error) {
      setError("Verification failed. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 items-center text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-300" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isRegistered ? 'Verify Your Email' : 'Create an account'}
          </CardTitle>
          <CardDescription>
            {isRegistered 
              ? 'Check your email for a verification link' 
              : 'Enter your information to create your notes account'}
          </CardDescription>
        </CardHeader>
        {isRegistered ? (
          <CardContent className="space-y-4 text-center">
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-amber-800 mb-4">
              <Mail className="h-12 w-12 mx-auto mb-2 text-amber-600" />
              <h3 className="text-lg font-medium mb-2">Check your inbox</h3>
              <p>
                We've sent a verification link to <strong>{email}</strong>. 
                Please click the link to verify your email address.
              </p>
            </div>
            <p className="text-sm text-gray-500">
              In a real app, you would receive an email with a verification link. 
              For this demo, you can click the button below to simulate email verification.
            </p>
            <Button onClick={handleVerifyAndLogin} className="mt-4">
              Simulate Email Verification
            </Button>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name"
                  placeholder="Your name" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="your@email.com" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password"
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input 
                  id="confirm-password"
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm font-medium text-red-500">{error}</p>}
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button 
                type="submit" 
                className="w-full mb-4" 
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
              <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="underline text-blue-600 hover:text-blue-800">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
};

export default RegisterForm;
