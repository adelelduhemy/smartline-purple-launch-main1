
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DriverRegistrationFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
}

const DriverRegistrationForm = ({ onSubmit, loading = false }: DriverRegistrationFormProps) => {
  const { t, isRTL } = useLanguage();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    identityType: '',
    identityNumber: '',
    password: '',
    passwordConfirmation: '',
    driverPhoto: null as File | null,
    drivingLicense: null as File | null,
    leadershipLicense: null as File | null,
    driverCard: null as File | null,
    carFrontPhoto: null as File | null,
    carBackPhoto: null as File | null,
    criminalRecord: null as File | null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0] || null;
    setFormData({
      ...formData,
      [fieldName]: file,
    });
  };

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      identityType: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const FileUploadField = ({ 
    label, 
    fieldName, 
    required = false 
  }: { 
    label: string; 
    fieldName: string; 
    required?: boolean;
  }) => (
    <div className="space-y-2">
      <Label htmlFor={fieldName} className={isRTL ? 'font-cairo' : 'font-inter'}>
        {label} {required && '*'}
      </Label>
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <Input
          id={fieldName}
          type="file"
          onChange={(e) => handleFileChange(e, fieldName)}
          accept="image/*,.pdf"
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById(fieldName)?.click()}
          className={`flex-1 justify-start ${isRTL ? 'font-cairo' : 'font-inter'}`}
        >
          {formData[fieldName as keyof typeof formData] 
            ? (formData[fieldName as keyof typeof formData] as File)?.name 
            : t('driver.chooseFile')
          }
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className={`text-center text-2xl ${isRTL ? 'font-cairo' : 'font-inter'}`}>
          {t('driver.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className={isRTL ? 'font-cairo' : 'font-inter'}>
                {t('driver.firstName')} *
              </Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className={`h-12 ${isRTL ? 'font-cairo text-right' : 'font-inter'}`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className={isRTL ? 'font-cairo' : 'font-inter'}>
                {t('driver.lastName')} *
              </Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className={`h-12 ${isRTL ? 'font-cairo text-right' : 'font-inter'}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className={isRTL ? 'font-cairo' : 'font-inter'}>
                {t('driver.email')} *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={`h-12 ${isRTL ? 'font-cairo text-right' : 'font-inter'}`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className={isRTL ? 'font-cairo' : 'font-inter'}>
                {t('driver.phone')} *
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className={`h-12 ${isRTL ? 'font-cairo text-right' : 'font-inter'}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={isRTL ? 'font-cairo' : 'font-inter'}>
                {t('driver.idType')} *
              </Label>
              <Select onValueChange={handleSelectChange} required>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder={t('driver.selectIdType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="national_id">{t('driver.nationalId')}</SelectItem>
                  <SelectItem value="passport">{t('driver.passport')}</SelectItem>
                  <SelectItem value="driver_license">{t('driver.driverLicense')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="identityNumber" className={isRTL ? 'font-cairo' : 'font-inter'}>
                {t('driver.idNumber')} *
              </Label>
              <Input
                id="identityNumber"
                name="identityNumber"
                type="text"
                value={formData.identityNumber}
                onChange={handleInputChange}
                required
                className={`h-12 ${isRTL ? 'font-cairo text-right' : 'font-inter'}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password" className={isRTL ? 'font-cairo' : 'font-inter'}>
                {t('driver.password')} *
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className={`h-12 ${isRTL ? 'font-cairo text-right' : 'font-inter'}`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordConfirmation" className={isRTL ? 'font-cairo' : 'font-inter'}>
                {t('driver.confirmPassword')} *
              </Label>
              <Input
                id="passwordConfirmation"
                name="passwordConfirmation"
                type="password"
                value={formData.passwordConfirmation}
                onChange={handleInputChange}
                required
                className={`h-12 ${isRTL ? 'font-cairo text-right' : 'font-inter'}`}
              />
            </div>
          </div>

          {/* File Uploads */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${isRTL ? 'font-cairo' : 'font-inter'}`}>
              Required Documents
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileUploadField 
                label={t('driver.driverPhoto')} 
                fieldName="driverPhoto" 
                required 
              />
              <FileUploadField 
                label={t('driver.drivingLicense')} 
                fieldName="drivingLicense" 
                required 
              />
              <FileUploadField 
                label={t('driver.leadershipLicense')} 
                fieldName="leadershipLicense" 
                required 
              />
              <FileUploadField 
                label={t('driver.driverCard')} 
                fieldName="driverCard" 
                required 
              />
              <FileUploadField 
                label={t('driver.carFront')} 
                fieldName="carFrontPhoto" 
                required 
              />
              <FileUploadField 
                label={t('driver.carBack')} 
                fieldName="carBackPhoto" 
                required 
              />
            </div>
            
            <FileUploadField 
              label={t('driver.criminalRecord')} 
              fieldName="criminalRecord" 
              required 
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-lg font-medium bg-primary-600 hover:bg-primary-700"
            disabled={loading}
          >
            {loading ? 'Submitting...' : t('driver.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DriverRegistrationForm;
