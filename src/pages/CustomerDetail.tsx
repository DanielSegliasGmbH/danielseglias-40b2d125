import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, User, Phone, Briefcase, Settings, Trash2, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  useCustomer,
  useUpdateCustomer,
  useUpsertCustomerProfile,
  useUpsertCustomerEconomics,
  useUpsertCustomerControl,
  useDeleteCustomer,
  CustomerWithRelations,
  CustomerProfile,
  CustomerEconomics,
  CustomerControl,
} from '@/hooks/useCustomerData';
import { CustomerCoreTab } from '@/components/customers/CustomerCoreTab';
import { CustomerProfileTab } from '@/components/customers/CustomerProfileTab';
import { CustomerEconomicsTab } from '@/components/customers/CustomerEconomicsTab';
import { CustomerControlTab } from '@/components/customers/CustomerControlTab';
import { CustomerDashboardTab } from '@/components/customers/CustomerDashboardTab';

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const { data: customer, isLoading, error } = useCustomer(id || '');
  const updateCustomer = useUpdateCustomer();
  const updateProfile = useUpsertCustomerProfile();
  const updateEconomics = useUpsertCustomerEconomics();
  const updateControl = useUpsertCustomerControl();
  const deleteCustomer = useDeleteCustomer();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Form states
  const [coreForm, setCoreForm] = useState<Partial<CustomerWithRelations>>({});
  const [profileForm, setProfileForm] = useState<Partial<CustomerProfile>>({});
  const [economicsForm, setEconomicsForm] = useState<Partial<CustomerEconomics>>({});
  const [controlForm, setControlForm] = useState<Partial<CustomerControl>>({});
  
  const [savingCore, setSavingCore] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingEconomics, setSavingEconomics] = useState(false);
  const [savingControl, setSavingControl] = useState(false);

  // Initialize forms when customer data loads
  useEffect(() => {
    if (customer) {
      setCoreForm({
        salutation: customer.salutation,
        first_name: customer.first_name,
        last_name: customer.last_name,
        preferred_name: customer.preferred_name,
        date_of_birth: customer.date_of_birth,
        nationality: customer.nationality,
        civil_status: customer.civil_status,
        number_of_children: customer.number_of_children,
        ahv_number: customer.ahv_number,
        customer_status: customer.customer_status,
        priority: customer.priority,
        care_level: customer.care_level,
        acquisition_source: customer.acquisition_source,
        first_contact_date: customer.first_contact_date,
      });
      
      if (customer.customer_profiles) {
        setProfileForm(customer.customer_profiles);
      }
      
      if (customer.customer_economics) {
        setEconomicsForm(customer.customer_economics);
      }
      
      if (customer.customer_control) {
        setControlForm(customer.customer_control);
      }
    }
  }, [customer]);

  const handleCoreChange = (field: string, value: any) => {
    setCoreForm(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileChange = (field: string, value: any) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
  };

  const handleEconomicsChange = (field: string, value: any) => {
    setEconomicsForm(prev => ({ ...prev, [field]: value }));
  };

  const handleControlChange = (field: string, value: any) => {
    setControlForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveCore = async () => {
    if (!id) return;
    setSavingCore(true);
    try {
      await updateCustomer.mutateAsync({ id, ...coreForm });
      toast.success(t('customer.saved', 'Änderungen gespeichert'));
    } catch (error) {
      toast.error(t('customer.saveError', 'Fehler beim Speichern'));
    } finally {
      setSavingCore(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!id) return;
    setSavingProfile(true);
    try {
      await updateProfile.mutateAsync({ customer_id: id, ...profileForm });
      toast.success(t('customer.saved', 'Änderungen gespeichert'));
    } catch (error) {
      toast.error(t('customer.saveError', 'Fehler beim Speichern'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveEconomics = async () => {
    if (!id) return;
    setSavingEconomics(true);
    try {
      await updateEconomics.mutateAsync({ customer_id: id, ...economicsForm });
      toast.success(t('customer.saved', 'Änderungen gespeichert'));
    } catch (error) {
      toast.error(t('customer.saveError', 'Fehler beim Speichern'));
    } finally {
      setSavingEconomics(false);
    }
  };

  const handleSaveControl = async () => {
    if (!id) return;
    setSavingControl(true);
    try {
      await updateControl.mutateAsync({ customer_id: id, ...controlForm });
      toast.success(t('customer.saved', 'Änderungen gespeichert'));
    } catch (error) {
      toast.error(t('customer.saveError', 'Fehler beim Speichern'));
    } finally {
      setSavingControl(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteCustomer.mutateAsync(id);
      toast.success(t('customer.deleted', 'Kunde gelöscht'));
      navigate('/app/customers');
    } catch (error) {
      toast.error(t('customer.deleteError', 'Fehler beim Löschen'));
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'lead': return 'secondary';
      case 'passive': return 'muted';
      case 'former': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPriorityBadgeVariant = (priority: string | null) => {
    switch (priority) {
      case 'A': return 'default';
      case 'B': return 'secondary';
      case 'C': return 'muted';
      default: return 'muted';
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </AppLayout>
    );
  }

  if (error || !customer) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {t('customer.notFound', 'Kunde nicht gefunden')}
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate('/app/customers')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back', 'Zurück')}
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/app/customers')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">
                {customer.first_name} {customer.last_name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getStatusBadgeVariant(customer.customer_status)}>
                  {t(`customer.statuses.${customer.customer_status}`, customer.customer_status)}
                </Badge>
                {customer.priority && (
                  <Badge variant={getPriorityBadgeVariant(customer.priority)}>
                    {t('customer.priorityLabel', 'Priorität')} {customer.priority}
                  </Badge>
                )}
                {customer.care_level && (
                  <Badge variant="outline">
                    {t(`customer.careLevels.${customer.care_level}`, customer.care_level)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t('common.delete', 'Löschen')}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">{t('customer.tabs.dashboard', 'Dashboard')}</span>
            </TabsTrigger>
            <TabsTrigger value="core" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{t('customer.tabs.core', 'Stammdaten')}</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">{t('customer.tabs.profile', 'Kontakt')}</span>
            </TabsTrigger>
            <TabsTrigger value="economics" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">{t('customer.tabs.economics', 'Finanzen')}</span>
            </TabsTrigger>
            <TabsTrigger value="control" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">{t('customer.tabs.control', 'Steuerung')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <CustomerDashboardTab customerId={id!} customerName={`${customer.first_name} ${customer.last_name}`} />
          </TabsContent>

          <TabsContent value="core" className="mt-6">
            <CustomerCoreTab
              customer={customer}
              formData={coreForm}
              onChange={handleCoreChange}
              onSave={handleSaveCore}
              saving={savingCore}
            />
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <CustomerProfileTab
              profile={customer.customer_profiles ?? null}
              formData={profileForm}
              onChange={handleProfileChange}
              onSave={handleSaveProfile}
              saving={savingProfile}
            />
          </TabsContent>

          <TabsContent value="economics" className="mt-6">
            <CustomerEconomicsTab
              economics={customer.customer_economics ?? null}
              formData={economicsForm}
              onChange={handleEconomicsChange}
              onSave={handleSaveEconomics}
              saving={savingEconomics}
            />
          </TabsContent>

          <TabsContent value="control" className="mt-6">
            <CustomerControlTab
              control={customer.customer_control ?? null}
              formData={controlForm}
              onChange={handleControlChange}
              onSave={handleSaveControl}
              saving={savingControl}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('customer.deleteConfirmTitle', 'Kunden löschen?')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('customer.deleteConfirmDescription', 'Diese Aktion kann nicht rückgängig gemacht werden. Der Kunde wird in den Papierkorb verschoben.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'Abbrechen')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {t('common.delete', 'Löschen')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
