
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  verifyEmail: (email: string) => Promise<void>;
}

// Mock database for users
const USERS_STORAGE_KEY = 'quicknotes_users';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('quicknotes_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.emailVerified) {
        setUser(parsedUser);
        setIsAuthenticated(true);
      } else {
        // If email is not verified, log the user out
        localStorage.removeItem('quicknotes_user');
        toast({
          title: "Email not verified",
          description: "Please check your email and verify your account.",
          variant: "destructive"
        });
      }
    }
  }, []);

  // Helper to get registered users
  const getRegisteredUsers = (): Record<string, { name: string; password: string; emailVerified: boolean }> => {
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : {};
  };

  // Helper to save registered users
  const saveRegisteredUsers = (users: Record<string, any>) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  };

  // Login function
  const login = async (email: string, password: string) => {
    // Get registered users
    const users = getRegisteredUsers();
    
    // Check if user exists and password matches
    if (!users[email] || users[email].password !== password) {
      throw new Error("Invalid email or password");
    }
    
    // Check if email is verified
    if (!users[email].emailVerified) {
      throw new Error("Email not verified. Please check your inbox.");
    }
    
    // Create user object
    const loggedInUser: User = {
      id: `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: users[email].name,
      email: email,
      emailVerified: true
    };
    
    // Save to local storage
    localStorage.setItem('quicknotes_user', JSON.stringify(loggedInUser));
    
    // Update state
    setUser(loggedInUser);
    setIsAuthenticated(true);
    
    toast({
      title: "Login successful",
      description: `Welcome back, ${users[email].name}!`
    });
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    // Get current users
    const users = getRegisteredUsers();
    
    // Check if user already exists
    if (users[email]) {
      throw new Error("Email already registered");
    }
    
    // Add new user
    users[email] = {
      name,
      password,
      emailVerified: false // Initially not verified
    };
    
    // Save updated users
    saveRegisteredUsers(users);
    
    // Show success toast with instructions to verify email
    toast({
      title: "Registration successful",
      description: "Please check your email to verify your account."
    });
    
    // Simulate sending verification email
    console.log(`MOCK EMAIL: Verification link sent to ${email}`);
    
    // This is where you'd typically send a real email in a production app
  };

  // Email verification function
  const verifyEmail = async (email: string) => {
    // Get current users
    const users = getRegisteredUsers();
    
    // Check if user exists
    if (!users[email]) {
      throw new Error("User not found");
    }
    
    // Mark email as verified
    users[email].emailVerified = true;
    
    // Save updated users
    saveRegisteredUsers(users);
    
    // If this is the current user, update their status
    if (user && user.email === email) {
      const updatedUser = { ...user, emailVerified: true };
      localStorage.setItem('quicknotes_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
    
    toast({
      title: "Email verified",
      description: "Your email has been successfully verified."
    });
  };

  const logout = () => {
    localStorage.removeItem('quicknotes_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, verifyEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
