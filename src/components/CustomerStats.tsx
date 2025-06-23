import { Customer } from '@/types/customer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, MapPin, User, Users } from 'lucide-react';

interface CustomerStatsProps {
  customers: Customer[];
}

export function CustomerStats({ customers }: CustomerStatsProps) {
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

  // Zähle Personen und Unternehmen
  const personCount = customers.filter(customer => getCustomerProperty(customer, 'isPerson')).length;
  const companyCount = customers.filter(customer => !getCustomerProperty(customer, 'isPerson')).length;
  
  // Zähle aktive Kunden
  const activeCount = customers.filter(customer => getCustomerProperty(customer, 'status') === 'active').length;
  
  // Sammle einzigartige Städte
  const uniqueCities = new Set<string>();
  customers.forEach(customer => {
    const address = getCustomerProperty(customer, 'address');
    if (address && typeof address === 'object' && address.city) {
      uniqueCities.add(address.city);
    }
  });
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gesamtkunden</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{customers.length}</div>
          <p className="text-xs text-muted-foreground">Alle Kunden</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Personen</CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{personCount}</div>
          <p className="text-xs text-muted-foreground">
            {personCount > 0 
              ? `${Math.round((personCount / customers.length) * 100)}% aller Kunden`
              : 'Keine Personen'}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unternehmen</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{companyCount}</div>
          <p className="text-xs text-muted-foreground">
            {companyCount > 0 
              ? `${Math.round((companyCount / customers.length) * 100)}% aller Kunden`
              : 'Keine Unternehmen'}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Städte</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueCities.size}</div>
          <p className="text-xs text-muted-foreground">Einzigartige Standorte</p>
        </CardContent>
      </Card>
    </div>
  );
}