import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const Auth = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(false); // Default to signup
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'passenger' | 'driver'>('passenger');
  const [driverSignupStep, setDriverSignupStep] = useState(1); // 1: Basic Info, 2: Documents

  // Check if we should show login or signup based on URL or query params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const mode = urlParams.get('mode');
    if (mode === 'login') {
      setIsLogin(true);
    } else if (mode === 'signup') {
      setIsLogin(false);
    }
  }, [location]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    // Passenger fields
    fullName: '',
    // Driver fields
    firstName: '',
    lastName: '',
    idType: '',
    idNumber: '',
    // Common field
    phoneNumber: '',
    // Document fields (will store File objects)
    driverPhoto: null as File | null,
    vehicleLicense: null as File | null,
    drivingLicense: null as File | null,
    frontCarPhoto: null as File | null,
    backCarPhoto: null as File | null,
    criminalStatusReport: null as File | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
        navigate('/');
      } else {
        if (selectedRole === 'driver') {
          if (driverSignupStep === 1) {
            // Validate step 1 fields
            if (!formData.firstName || !formData.lastName || !formData.email || 
                !formData.phoneNumber || !formData.password || !formData.idType || 
                !formData.idNumber) {
              throw new Error('Please fill in all required fields');
            }
            setDriverSignupStep(2);
          } else {
            // Validate step 2 fields
            if (!formData.driverPhoto || !formData.vehicleLicense || 
                !formData.drivingLicense || !formData.frontCarPhoto || 
                !formData.backCarPhoto) {
              throw new Error('Please upload all required documents');
            }
            
            await signUp(selectedRole, formData);
            
            // Clear form and show success message
            setFormData({
              email: '',
              password: '',
              confirmPassword: '',
              fullName: '',
              phoneNumber: '',
              firstName: '',
              lastName: '',
              idType: '',
              idNumber: '',
              driverPhoto: null,
              vehicleLicense: null,
              drivingLicense: null,
              frontCarPhoto: null,
              backCarPhoto: null,
              criminalStatusReport: null,
            });
            setIsLogin(true);
            setDriverSignupStep(1);
            alert('Driver registration successful! Please sign in.');
          }
        } else {
          // Passenger signup
          if (!formData.fullName || !formData.email || 
              !formData.phoneNumber || !formData.password) {
            throw new Error('Please fill in all required fields');
          }
          
          await signUp(selectedRole, formData);
          
          // Clear form and show success message
          setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            fullName: '',
            phoneNumber: '',
            firstName: '',
            lastName: '',
            idType: '',
            idNumber: '',
            driverPhoto: null,
            vehicleLicense: null,
            drivingLicense: null,
            frontCarPhoto: null,
            backCarPhoto: null,
            criminalStatusReport: null,
          });
          setIsLogin(true);
          alert('Registration successful! Please sign in.');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert(error instanceof Error ? error.message : 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;

    if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0] || null; // Cast to HTMLInputElement
      setFormData({
        ...formData,
        [name]: file,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleRoleChange = (value: 'passenger' | 'driver') => {
    setSelectedRole(value);
    // Clear all form data and reset step when switching roles
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phoneNumber: '',
      firstName: '',
      lastName: '',
      idType: '',
      idNumber: '',
      driverPhoto: null,
      vehicleLicense: null,
      drivingLicense: null,
      frontCarPhoto: null,
      backCarPhoto: null,
      criminalStatusReport: null,
    });
    setDriverSignupStep(1); // Reset step
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className="text-4xl font-bold text-primary-600 mb-2">SmartLine</h1>
          </Link>
          <p className="text-gray-600">Your smart transportation solution</p>
        </div>

        {/* Auth Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </CardTitle>
            <CardDescription>
              {isLogin 
                ? 'Sign in to your account to continue' 
                : 'Create your SmartLine account today'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection - Only shown in signup mode */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label>I want to join as:</Label>
                  <RadioGroup value={selectedRole} onValueChange={handleRoleChange as (value: string) => void} className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="passenger" id="role-passenger" />
                      <Label htmlFor="role-passenger">Passenger</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="driver" id="role-driver" />
                      <Label htmlFor="role-driver">Driver</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* --- Passenger Signup Form --- */}
              {!isLogin && selectedRole === 'passenger' && (
                <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="h-12"
                  />
                </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      required
                      className="h-12"
                    />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="h-12"
                    />
                  </div>
                </>
              )}

              {/* --- Driver Signup Form (Multi-Step) --- */}
              {!isLogin && selectedRole === 'driver' && (
                <>
                  {/* Step 1: Basic Info + ID + Account */}
                  {driverSignupStep === 1 && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          type="text"
                          placeholder="Enter your first name"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          placeholder="Enter your last name"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="h-12"
                        />
                      </div>
                       <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="idType">ID Type</Label>
                        <Input
                          id="idType"
                          name="idType"
                          type="text"
                          placeholder="e.g. National ID, Passport"
                          value={formData.idType}
                          onChange={handleInputChange}
                          required
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="idNumber">ID Number</Label>
                        <Input
                          id="idNumber"
                          name="idNumber"
                          type="text"
                          placeholder="Enter your ID number"
                          value={formData.idNumber}
                          onChange={handleInputChange}
                          required
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          type="tel"
                          placeholder="Enter your phone number"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          required
                          className="h-12"
                        />
                      </div>
                       <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          className="h-12"
                        />
                      </div>
                       <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                          className="h-12"
                        />
                      </div>
                    </>
                  )}

                  {/* Step 2: Document Uploads */}
                  {driverSignupStep === 2 && (
                    <div className="space-y-4">
                       {/* TODO: Add Document Upload Fields */}
                       <div className="space-y-2">
                           <Label htmlFor="driverPhoto">Driver Photo</Label>
                           <Input id="driverPhoto" name="driverPhoto" type="file" onChange={handleInputChange} required className="h-12" />
                       </div>
                       <div className="space-y-2">
                           <Label htmlFor="vehicleLicense">Vehicle License</Label>
                           <Input id="vehicleLicense" name="vehicleLicense" type="file" onChange={handleInputChange} required className="h-12" />
                       </div>
                       <div className="space-y-2">
                           <Label htmlFor="drivingLicense">Driving License</Label>
                           <Input id="drivingLicense" name="drivingLicense" type="file" onChange={handleInputChange} required className="h-12" />
                       </div>
                       <div className="space-y-2">
                           <Label htmlFor="frontCarPhoto">Front of the Car (with plate)</Label>
                           <Input id="frontCarPhoto" name="frontCarPhoto" type="file" onChange={handleInputChange} required className="h-12" />
                       </div>
                        <div className="space-y-2">
                           <Label htmlFor="backCarPhoto">Back of the Car (with plate)</Label>
                           <Input id="backCarPhoto" name="backCarPhoto" type="file" onChange={handleInputChange} required className="h-12" />
                       </div>
                        <div className="space-y-2">
                           <Label htmlFor="criminalStatusReport">Criminal Status Report (Optional)</Label>
                           <Input id="criminalStatusReport" name="criminalStatusReport" type="file" onChange={handleInputChange} className="h-12" />
                       </div>
                    </div>
                  )}
                </>
              )}
              
              {/* --- Shared Fields (if any for login or future steps) --- */}
               {/* Currently email and password are in both passenger and driver step 1 */}
               {/* For login view, email and password fields are rendered below */}

              {/* --- Login Form Fields --- */}
              {isLogin && (
                <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="h-12"
                />
              </div>
                </>
              )}


              {/* --- Form Submission Button --- */}
              {/* Render different button(s) based on selected role and step */}

              {!isLogin && selectedRole === 'driver' && driverSignupStep === 1 && (
                   <Button
                        type="button" // Use type="button" to prevent form submission on click
                        onClick={() => {
                            // TODO: Add validation before moving to the next step
                            setDriverSignupStep(2);
                        }}
                        className="w-full h-12 text-lg font-medium bg-primary-600 hover:bg-primary-700"
                        disabled={loading} // Still disable if a previous action is loading
                   >
                       Next
                   </Button>
              )}

              {!isLogin && selectedRole === 'driver' && driverSignupStep === 2 && (
                  <div className="flex space-x-4">
                      <Button
                           type="button"
                           onClick={() => setDriverSignupStep(1)}
                           variant="outline"
                           className="w-1/2 h-12 text-lg font-medium"
                           disabled={loading}
                      >
                          Back
                      </Button>
                      <Button 
                          type="submit" // This button submits the form
                          className="w-1/2 h-12 text-lg font-medium bg-primary-600 hover:bg-primary-700"
                          disabled={loading}
                      >
                           {loading ? 'Creating Account...' : 'Create Account'}
                      </Button>
                  </div>
              )}

              {!isLogin && selectedRole === 'passenger' && (
                   <Button 
                        type="submit" 
                        className="w-full h-12 text-lg font-medium bg-primary-600 hover:bg-primary-700"
                        disabled={loading}
                   >
                        {loading ? 'Creating Account...' : 'Create Account'}
                   </Button>
              )}

              {isLogin && (
              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-medium bg-primary-600 hover:bg-primary-700"
                disabled={loading}
              >
                        {loading ? 'Signing In...' : 'Sign In'}
              </Button>
              )}

            </form>

            {/* Switch between login/register */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </p>
              <Button
                variant="link"
                onClick={() => {
                    setIsLogin(!isLogin);
                    // Reset driver signup step when switching to/from login
                    if (!isLogin) setDriverSignupStep(1);
                }}
                className="text-primary-600 hover:text-primary-700 font-medium p-0 h-auto"
              >
                {isLogin ? 'Sign up here' : 'Sign in here'}
              </Button>
            </div>

            {/* Back to home */}
            <div className="mt-4 text-center">
              <Link to="/">
                <Button variant="ghost" className="text-gray-500 hover:text-gray-700">
                  ← Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Additional info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
