import { useState } from 'react';
import { Customer } from '@/types/customer';
import { decodeHtmlEntities } from '@/utils/formatters';
import { CustomerDetailsDialog } from './CustomerDetailsDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Edit, Eye, ExternalLink, MapPin, User } from 'lucide-react';

interface CustomerTableProps {
  customers: Customer[];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  onEditCustomer?: (customer: Customer) => void;
}

export function CustomerTable({ customers, sortBy, sortDirection, onSort, onEditCustomer }: CustomerTableProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const statusColors = {
    active: "bg-green-50 text-green-700 border-green-200",
    inactive: "bg-gray-50 text-gray-700 border-gray-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    blocked: "bg-red-50 text-red-700 border-red-200"
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Aktiv';
      case 'inactive': return 'Inaktiv';
      case 'pending': return 'Ausstehend';
      case 'blocked': return 'Gesperrt';
      default: return status;
    }
  };

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedCustomer(null);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Name</TableHead>
              <TableHead>Kundennummer</TableHead>
              <TableHead>Ort</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length > 0 ? (
              customers.map((customer) => {
                const isPerson = getCustomerProperty(customer, 'isPerson');
                const companyName = getCustomerProperty(customer, 'companyName');
                const firstName = getCustomerProperty(customer, 'firstName');
                const lastName = getCustomerProperty(customer, 'lastName');
                const customerId = getCustomerProperty(customer, 'customerId');
                const customerNumber = getCustomerProperty(customer, 'customerNumber');
                const contactNumber = getCustomerProperty(customer, 'contactNumber');
                const status = getCustomerProperty(customer, 'status') || 'inactive';
                
                // Kundennummer - prüfe verschiedene mögliche Felder
                const displayId = customerId || customerNumber || contactNumber;
                
                // Sicherer Zugriff auf Adressdaten
                const address = getCustomerProperty(customer, 'address') || {};
                const city = typeof address === 'object' ? address.city : '';
                
                const displayName = isPerson 
                  ? `${firstName || ''} ${lastName || ''}`.trim() 
                  : companyName ? decodeHtmlEntities(companyName) : 'Unbenannter Kunde';
                
                return (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isPerson ? (
                          <User className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="font-medium">{displayName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{displayId || "-"}</TableCell>
                    <TableCell>
                      {city ? (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{city}</span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[status as keyof typeof statusColors] || statusColors.inactive}>
                        {getStatusLabel(status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(customer)}
                          title="Details anzeigen"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {onEditCustomer && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditCustomer(customer)}
                            title="Bearbeiten"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  Keine Kunden gefunden
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedCustomer && (
        <CustomerDetailsDialog
          customer={selectedCustomer}
          open={dialogOpen}
          onOpenChange={handleDialogOpenChange}
        />
      )}
    </>
  );
}