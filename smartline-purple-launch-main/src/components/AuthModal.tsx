
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import DriverRegistrationForm from './DriverRegistrationForm';

interface AuthModalProps {
  children?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  mode?: 'login' | 'signup';
}

const AuthModal = ({ children, isOpen, onClose, mode = 'login' }: AuthModalProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(mode === 'signup' ? 'signup' : 'signin');
  const [userRole, setUserRole] = useState<'passenger' | 'driver'>('passenger');
  const { signIn, signUp } = useAuth();
  const { isRTL } = useLanguage();

  // Use controlled state if provided, otherwise use internal state
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onClose !== undefined ? onClose : setInternalOpen;

  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });

  const [signUpData, setSignUpData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  const translations = {
    en: {
      welcome: 'Welcome to SmartLine',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      email: 'Email',
      password: 'Password',
      fullName: 'Full Name',
      signingIn: 'Signing In...',
      creatingAccount: 'Creating Account...',
      selectRole: 'I want to join as:',
      passenger: 'Passenger',
      driver: 'Driver'
    },
    ar: {
      welcome: 'مرحباً بك في سمارت لاين',
      signIn: 'تسجيل الدخول',
      signUp: 'إنشاء حساب',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      fullName: 'الاسم الكامل',
      signingIn: 'جاري تسجيل الدخول...',
      creatingAccount: 'جاري إنشاء الحساب...',
      selectRole: 'أريد الانضمام كـ:',
      passenger: 'راكب',
      driver: 'سائق'
    }
  };

  const currentLang = isRTL ? 'ar' : 'en';

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(signInData.email, signInData.password);
      setOpen(false);
      setSignInData({ email: '', password: '' });
    } catch (error) {
      console.error('Sign in error:', error);
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(signUpData.email, signUpData.password, signUpData.fullName);
      setOpen(false);
      setSignUpData({ fullName: '', email: '', password: '' });
    } catch (error) {
      console.error('Sign up error:', error);
    }
    setLoading(false);
  };

  const handleDriverRegistration = async (driverData: any) => {
    setLoading(true);
    try {
      // Here you would submit the driver application data
      console.log('Driver registration data:', driverData);
      // For now, just create a regular account
      await signUp(driverData.email, driverData.password, `${driverData.firstName} ${driverData.lastName}`);
      setOpen(false);
    } catch (error) {
      console.error('Driver registration error:', error);
    }
    setLoading(false);
  };

  // If children are provided, use trigger pattern
  if (children) {
    return (
      <Dialog open={internalOpen} onOpenChange={setInternalOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className={isRTL ? 'font-cairo' : 'font-inter'}>
              {translations[currentLang].welcome}
            </DialogTitle>
          </DialogHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin" className={isRTL ? 'font-cairo' : 'font-inter'}>
                {translations[currentLang].signIn}
              </TabsTrigger>
              <TabsTrigger value="signup" className={isRTL ? 'font-cairo' : 'font-inter'}>
                {translations[currentLang].signUp}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className={isRTL ? 'font-cairo' : 'font-inter'}>
                    {translations[currentLang].email}
                  </Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={signInData.email}
                    onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                    required
                    className={isRTL ? 'font-cairo text-right' : 'font-inter'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className={isRTL ? 'font-cairo' : 'font-inter'}>
                    {translations[currentLang].password}
                  </Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    required
                    className={isRTL ? 'font-cairo text-right' : 'font-inter'}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? translations[currentLang].signingIn : translations[currentLang].signIn}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label className={`text-base font-medium ${isRTL ? 'font-cairo' : 'font-inter'}`}>
                    {translations[currentLang].selectRole}
                  </Label>
                  <RadioGroup 
                    value={userRole} 
                    onValueChange={(value) => setUserRole(value as 'passenger' | 'driver')}
                    className="flex space-x-6 rtl:space-x-reverse"
                  >
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <RadioGroupItem value="passenger" id="passenger" />
                      <Label htmlFor="passenger" className={isRTL ? 'font-cairo' : 'font-inter'}>
                        {translations[currentLang].passenger}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <RadioGroupItem value="driver" id="driver" />
                      <Label htmlFor="driver" className={isRTL ? 'font-cairo' : 'font-inter'}>
                        {translations[currentLang].driver}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {userRole === 'passenger' ? (
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className={isRTL ? 'font-cairo' : 'font-inter'}>
                        {translations[currentLang].fullName}
                      </Label>
                      <Input
                        id="signup-name"
                        type="text"
                        value={signUpData.fullName}
                        onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                        required
                        className={isRTL ? 'font-cairo text-right' : 'font-inter'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className={isRTL ? 'font-cairo' : 'font-inter'}>
                        {translations[currentLang].email}
                      </Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        required
                        className={isRTL ? 'font-cairo text-right' : 'font-inter'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className={isRTL ? 'font-cairo' : 'font-inter'}>
                        {translations[currentLang].password}
                      </Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        required
                        className={isRTL ? 'font-cairo text-right' : 'font-inter'}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? translations[currentLang].creatingAccount : translations[currentLang].signUp}
                    </Button>
                  </form>
                ) : (
                  <DriverRegistrationForm 
                    onSubmit={handleDriverRegistration}
                    loading={loading}
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
  }

  // Otherwise use controlled pattern
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={isRTL ? 'font-cairo' : 'font-inter'}>
            {translations[currentLang].welcome}
          </DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin" className={isRTL ? 'font-cairo' : 'font-inter'}>
              {translations[currentLang].signIn}
            </TabsTrigger>
            <TabsTrigger value="signup" className={isRTL ? 'font-cairo' : 'font-inter'}>
              {translations[currentLang].signUp}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="space-y-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email" className={isRTL ? 'font-cairo' : 'font-inter'}>
                  {translations[currentLang].email}
                </Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={signInData.email}
                  onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                  required
                  className={isRTL ? 'font-cairo text-right' : 'font-inter'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password" className={isRTL ? 'font-cairo' : 'font-inter'}>
                  {translations[currentLang].password}
                </Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={signInData.password}
                  onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                  required
                  className={isRTL ? 'font-cairo text-right' : 'font-inter'}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? translations[currentLang].signingIn : translations[currentLang].signIn}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className={`text-base font-medium ${isRTL ? 'font-cairo' : 'font-inter'}`}>
                  {translations[currentLang].selectRole}
                </Label>
                <RadioGroup 
                  value={userRole} 
                  onValueChange={(value) => setUserRole(value as 'passenger' | 'driver')}
                  className="flex space-x-6 rtl:space-x-reverse"
                >
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <RadioGroupItem value="passenger" id="passenger" />
                    <Label htmlFor="passenger" className={isRTL ? 'font-cairo' : 'font-inter'}>
                      {translations[currentLang].passenger}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <RadioGroupItem value="driver" id="driver" />
                    <Label htmlFor="driver" className={isRTL ? 'font-cairo' : 'font-inter'}>
                      {translations[currentLang].driver}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {userRole === 'passenger' ? (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className={isRTL ? 'font-cairo' : 'font-inter'}>
                      {translations[currentLang].fullName}
                    </Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={signUpData.fullName}
                      onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                      required
                      className={isRTL ? 'font-cairo text-right' : 'font-inter'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className={isRTL ? 'font-cairo' : 'font-inter'}>
                      {translations[currentLang].email}
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                      required
                      className={isRTL ? 'font-cairo text-right' : 'font-inter'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className={isRTL ? 'font-cairo' : 'font-inter'}>
                      {translations[currentLang].password}
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      required
                      className={isRTL ? 'font-cairo text-right' : 'font-inter'}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? translations[currentLang].creatingAccount : translations[currentLang].signUp}
                  </Button>
                </form>
              ) : (
                <DriverRegistrationForm 
                  onSubmit={handleDriverRegistration}
                  loading={loading}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
