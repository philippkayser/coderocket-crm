import { useState, useEffect } from 'react';
import { CustomerCard } from '@/components/CustomerCard';
import { CustomerFilter } from '@/components/CustomerFilter';
import { CustomerTable } from '@/components/CustomerTable';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { fetchCustomers } from '@/lib/api';
import { Customer } from '@/types/customer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerStats } from '@/components/CustomerStats';

export function CustomerDashboard() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const { toast } = useToast();

  // Typensichere Zugriffsfunktion für optionale Eigenschaften
  const getCustomerProperty = (customer: Customer, propertyPath: string) => {
    const parts = propertyPath.split('.');
    let value: any = customer;
    
    for (const part of parts) {
      if (value === undefined || value === null) return undefined;
      value = value[part];
    }
    
    return value;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCustomers();
      
      // If the response is a single customer (object), convert it to an array
      const customersArray = Array.isArray(data) ? data : [data];
      setCustomers(customersArray);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      setError('Fehler beim Laden der Kunden. Bitte versuchen Sie es später erneut.');
      toast({
        title: "Fehler beim Laden der Kunden",
        description: "Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredCustomers = customers.filter(customer => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Sicherer Zugriff auf Eigenschaften
    const companyName = getCustomerProperty(customer, 'companyName') || '';
    const firstName = getCustomerProperty(customer, 'firstName') || '';
    const lastName = getCustomerProperty(customer, 'lastName') || '';
    const customerNumber = getCustomerProperty(customer, 'customerNumber') || '';
    
    // Sicherer Zugriff auf Adresse
    const address = getCustomerProperty(customer, 'address') || {};
    const city = typeof address === 'object' ? address.city || '' : '';
    const zipcode = typeof address === 'object' ? address.zipcode || '' : '';
    
    // Suche in verschiedenen Feldern
    return (
      companyName.toLowerCase().includes(searchLower) ||
      firstName.toLowerCase().includes(searchLower) ||
      lastName.toLowerCase().includes(searchLower) ||
      customerNumber.toLowerCase().includes(searchLower) ||
      city.toLowerCase().includes(searchLower) ||
      zipcode.toLowerCase().includes(searchLower)
    );
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (sortBy === 'name') {
      const nameA = getCustomerProperty(a, 'companyName') || `${getCustomerProperty(a, 'firstName') || ''} ${getCustomerProperty(a, 'lastName') || ''}`;
      const nameB = getCustomerProperty(b, 'companyName') || `${getCustomerProperty(b, 'firstName') || ''} ${getCustomerProperty(b, 'lastName') || ''}`;
      return sortDirection === 'asc' 
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    }
    if (sortBy === 'customerNumber') {
      const numA = getCustomerProperty(a, 'customerNumber') || "";
      const numB = getCustomerProperty(b, 'customerNumber') || "";
      return sortDirection === 'asc' 
        ? numA.localeCompare(numB)
        : numB.localeCompare(numA);
    }
    if (sortBy === 'city') {
      // Sicherer Zugriff auf Adresse
      const addressA = getCustomerProperty(a, 'address') || {};
      const addressB = getCustomerProperty(b, 'address') || {};
      
      const cityA = typeof addressA === 'object' ? addressA.city || "" : "";
      const cityB = typeof addressB === 'object' ? addressB.city || "" : "";
      
      return sortDirection === 'asc' 
        ? cityA.localeCompare(cityB)
        : cityB.localeCompare(cityA);
    }
    return 0;
  });

  const handleSortChange = (value: string) => {
    if (value === sortBy) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(value);
      setSortDirection('asc');
    }
  };

  const handleRefresh = () => {
    fetchData();
    toast({
      title: "Aktualisierung",
      description: "Die Kundendaten werden aktualisiert...",
    });
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'table' : 'grid');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <div className="flex justify-between">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Fehler</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2" 
          onClick={handleRefresh}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Erneut versuchen
        </Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <CustomerStats customers={customers} />
      
      {/* Filters and View Toggle */}
      <div className="flex flex-col space-y-4">
        <CustomerFilter 
          sortBy={sortBy} 
          sortDirection={sortDirection} 
          onSortChange={handleSortChange} 
          totalCustomers={sortedCustomers.length}
          onRefresh={handleRefresh}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          viewMode={viewMode}
          onViewModeChange={toggleViewMode}
        />
      </div>
      
      {/* Content */}
      {sortedCustomers.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <p className="text-xl text-muted-foreground">
            {searchTerm ? "Keine Kunden für diese Suche gefunden" : "Keine Kunden gefunden"}
          </p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCustomers.map((customer) => (
                <CustomerCard 
                  key={customer.id} 
                  customer={customer} 
                />
              ))}
            </div>
          ) : (
            <CustomerTable 
              customers={sortedCustomers} 
              sortBy={sortBy} 
              sortDirection={sortDirection} 
              onSort={handleSortChange}
            />
          )}
        </>
      )}
    </div>
  );
}