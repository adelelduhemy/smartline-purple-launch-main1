import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Eye, Check, X } from 'lucide-react';

interface DriverApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export function DriverApplications() {
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const [applications, setApplications] = useState<DriverApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const translations = {
    en: {
      driverApplications: 'Driver Applications',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      status: 'Status',
      dateApplied: 'Date Applied',
      earnings: 'Earnings',
      trips: 'Trips',
      rating: 'Rating',
      actions: 'Actions',
      approve: 'Approve',
      reject: 'Reject',
      view: 'View',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      noApplications: 'No driver applications found'
    },
    ar: {
      driverApplications: 'طلبات السائقين',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      status: 'الحالة',
      dateApplied: 'تاريخ التقديم',
      earnings: 'الأرباح',
      trips: 'الرحلات',
      rating: 'التقييم',
      actions: 'الإجراءات',
      approve: 'موافقة',
      reject: 'رفض',
      view: 'عرض',
      pending: 'معلق',
      approved: 'مقبول',
      rejected: 'مرفوض',
      noApplications: 'لا توجد طلبات سائقين'
    }
  };

  const currentLang = isRTL ? 'ar' : 'en';

  useEffect(() => {
    // Load applications from localStorage
    const storedApplications = localStorage.getItem('driverApplications');
    if (storedApplications) {
      setApplications(JSON.parse(storedApplications));
    }
    setLoading(false);
  }, []);

  const handleStatusChange = async (applicationId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const updatedApplications = applications.map(app =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      );
      
      localStorage.setItem('driverApplications', JSON.stringify(updatedApplications));
      setApplications(updatedApplications);
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Failed to update application status. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { variant: 'secondary' as const, text: translations[currentLang].pending },
      approved: { variant: 'default' as const, text: translations[currentLang].approved },
      rejected: { variant: 'destructive' as const, text: translations[currentLang].rejected }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap];
    return (
      <Badge variant={statusInfo?.variant || 'secondary'}>
        {statusInfo?.text || status}
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{translations[currentLang].driverApplications}</CardTitle>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <p className="text-center text-gray-600 py-8">
            {translations[currentLang].noApplications}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{translations[currentLang].name}</TableHead>
                <TableHead>{translations[currentLang].email}</TableHead>
                <TableHead>{translations[currentLang].phone}</TableHead>
                <TableHead>{translations[currentLang].status}</TableHead>
                <TableHead>{translations[currentLang].actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell className="font-medium">
                    {application.full_name}
                  </TableCell>
                  <TableCell>{application.email}</TableCell>
                  <TableCell>{application.phone}</TableCell>
                  <TableCell>{getStatusBadge(application.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {/* TODO: Implement view details */}}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {application.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(application.id, 'approved')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(application.id, 'rejected')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
