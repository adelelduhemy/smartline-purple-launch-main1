import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  role?: 'passenger' | 'driver'; // Add role to user interface
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (role: 'passenger' | 'driver', formData: any) => Promise<void>; // Simplified for different forms
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data (optional - can remove if relying solely on backend sessions/tokens)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Updated signUp function to handle different roles and data
  const signUp = async (role: 'passenger' | 'driver', formData: any) => {
    try {
      const endpoint = role === 'passenger' 
        ? 'http://localhost:3000/api/signup/passenger'
        : 'http://localhost:3000/api/signup/driver';

      if (role === 'passenger') {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            full_name: formData.fullName,
            email: formData.email,
            phone_number: formData.phoneNumber,
            password: formData.password
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to register passenger');
        }

        return data;
      } else {
        // Driver signup with file uploads
        const formDataToSend = new FormData();
        
        // Add text fields with correct field names
        formDataToSend.append('first_name', formData.firstName);
        formDataToSend.append('last_name', formData.lastName);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('phone_number', formData.phoneNumber);
        formDataToSend.append('password', formData.password);
        formDataToSend.append('id_type', formData.idType);
        formDataToSend.append('id_number', formData.idNumber);

        // Add files
        if (formData.driverPhoto) {
          formDataToSend.append('driverPhoto', formData.driverPhoto);
        }
        if (formData.vehicleLicense) {
          formDataToSend.append('vehicleLicense', formData.vehicleLicense);
        }
        if (formData.drivingLicense) {
          formDataToSend.append('drivingLicense', formData.drivingLicense);
        }
        if (formData.frontCarPhoto) {
          formDataToSend.append('frontCarPhoto', formData.frontCarPhoto);
        }
        if (formData.backCarPhoto) {
          formDataToSend.append('backCarPhoto', formData.backCarPhoto);
        }
        if (formData.criminalStatusReport) {
          formDataToSend.append('criminalStatusReport', formData.criminalStatusReport);
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          body: formDataToSend,
        });

        const data = await response.json();
        
        if (!response.ok) {
          console.error('Driver registration failed:', data);
          throw new Error(data.message || 'Failed to register driver');
        }

        return data;
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to sign in');
      }

      if (!data.user) {
        throw new Error('Invalid response from server');
      }

      // Store user data
      const userData = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        name: data.user.name,
        status: data.user.status
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
