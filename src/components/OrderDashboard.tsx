import { useState, useEffect } from 'react';
import { OrderCard } from '@/components/OrderCard';
import { OrderFilter } from '@/components/OrderFilter';
import { OrderTable } from '@/components/OrderTable';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { fetchOrders } from '@/lib/api';
import { Order } from '@/types/order';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderStats } from '@/components/OrderStats';

interface OrderDashboardProps {
  filter: 'all' | 'open' | 'completed';
}

export function OrderDashboard({ filter }: OrderDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const { toast } = useToast();

  // Typensichere Zugriffsfunktion für optionale Eigenschaften
  const getOrderProperty = (order: Order, propertyPath: string) => {
    const parts = propertyPath.split('.');
    let value: any = order;
    
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
      const data = await fetchOrders();
      
      // If the response is a single order (object), convert it to an array
      const ordersArray = Array.isArray(data) ? data : [data];
      setOrders(ordersArray);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setError('Fehler beim Laden der Aufträge. Bitte versuchen Sie es später erneut.');
      toast({
        title: "Fehler beim Laden der Aufträge",
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

  const filteredOrders = orders.filter(order => {
    // First filter by status
    if (filter !== 'all' && order.status !== filter) return false;
    
    // Then filter by search term if present
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Search in various fields
    return (
      (order.title && order.title.toLowerCase().includes(searchLower)) ||
      (order.jobNumber && order.jobNumber.toLowerCase().includes(searchLower)) ||
      (order.customer?.companyName && order.customer.companyName.toLowerCase().includes(searchLower)) ||
      (getOrderProperty(order, 'postalAddress.city') && getOrderProperty(order, 'postalAddress.city').toLowerCase().includes(searchLower)) ||
      (getOrderProperty(order, 'postalAddress.zipcode') && getOrderProperty(order, 'postalAddress.zipcode').toLowerCase().includes(searchLower))
    );
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
      const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }
    if (sortBy === 'title') {
      const titleA = a.title || "";
      const titleB = b.title || "";
      return sortDirection === 'asc' 
        ? titleA.localeCompare(titleB)
        : titleB.localeCompare(titleA);
    }
    if (sortBy === 'jobNumber') {
      const jobA = a.jobNumber || "";
      const jobB = b.jobNumber || "";
      return sortDirection === 'asc' 
        ? jobA.localeCompare(jobB)
        : jobB.localeCompare(jobA);
    }
    if (sortBy === 'customer') {
      const customerA = a.customer?.companyName || "";
      const customerB = b.customer?.companyName || "";
      return sortDirection === 'asc' 
        ? customerA.localeCompare(customerB)
        : customerB.localeCompare(customerA);
    }
    if (sortBy === 'price') {
      const priceA = a.overallPriceValue || 0;
      const priceB = b.overallPriceValue || 0;
      return sortDirection === 'asc' 
        ? priceA - priceB
        : priceB - priceA;
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
      description: "Die Auftragsdaten werden aktualisiert...",
    });
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'table' : 'grid');
  };

  // Funktion zum Öffnen des Auftrags in EventWorx
  const handleEditOrder = (order: Order) => {
    if (order.id) {
      // Öffne einen neuen Tab mit der EventWorx-URL
      window.open(`https://lsz-vt.eventworx.biz/eventworx/#job/edit/order/${order.id}`, '_blank');
    } else {
      toast({
        title: "Fehler",
        description: "Keine Auftrags-ID gefunden",
        variant: "destructive",
      });
    }
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
      <OrderStats orders={orders} />
      
      {/* Filters and View Toggle */}
      <div className="flex flex-col space-y-4">
        <OrderFilter 
          sortBy={sortBy} 
          sortDirection={sortDirection} 
          onSortChange={handleSortChange} 
          totalOrders={sortedOrders.length}
          onRefresh={handleRefresh}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          viewMode={viewMode}
          onViewModeChange={toggleViewMode}
        />
      </div>
      
      {/* Content */}
      {sortedOrders.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <p className="text-xl text-muted-foreground">
            {searchTerm ? "Keine Aufträge für diese Suche gefunden" : "Keine Aufträge gefunden"}
          </p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedOrders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  onEdit={handleEditOrder}
                />
              ))}
            </div>
          ) : (
            <OrderTable 
              orders={sortedOrders} 
              sortBy={sortBy} 
              sortDirection={sortDirection} 
              onSort={handleSortChange}
              onEditOrder={handleEditOrder}
            />
          )}
        </>
      )}
    </div>
  );
}