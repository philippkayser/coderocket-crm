import { useState } from 'react';
import { Order } from '@/types/order';
import { formatDate, formatCurrency, decodeHtmlEntities } from '@/utils/formatters';
import { OrderDetailsDialog } from './OrderDetailsDialog';
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
import { AlertTriangle, Calendar, CheckCircle, Clock, Edit, Eye, ExternalLink } from 'lucide-react';

interface OrderTableProps {
  orders: Order[];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  onEditOrder?: (order: Order) => void;
}

export function OrderTable({ orders, sortBy, sortDirection, onSort, onEditOrder }: OrderTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  // Sortiere Aufträge nach Startdatum (neueste zuerst)
  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
    const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
    return dateB - dateA;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Neu</Badge>;
      case 'open':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Offen</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">In Bearbeitung</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Abgeschlossen</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Storniert</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Hoch</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Mittel</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Niedrig</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedOrder(null);
    }
  };

  // Funktion zum Öffnen des Auftrags in EventWorx
  const handleOpenInEventWorx = (order: Order) => {
    if (order.id) {
      window.open(`https://lsz-vt.eventworx.biz/eventworx/#job/edit/order/${order.id}`, '_blank');
    }
  };

  // Funktion zum Formatieren des Kundennamens
  const formatCustomerName = (order: Order) => {
    if (order.customer?.companyName) {
      return decodeHtmlEntities(order.customer.companyName);
    }
    
    const personFirstName = getOrderProperty(order, 'customer.personFirstName');
    const personLastName = getOrderProperty(order, 'customer.personLastName');
    
    if (personFirstName || personLastName) {
      return `${personFirstName || ''} ${personLastName || ''}`.trim();
    }
    
    return 'Kein Kundenname';
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Auftragsnr.</TableHead>
              <TableHead>Titel</TableHead>
              <TableHead>Kunde</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priorität</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOrders.length > 0 ? (
              sortedOrders.map((order) => {
                const priority = getOrderProperty(order, 'priority');
                
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.jobNumber}</TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <span>{order.title}</span>
                        {order.stockConflict && (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatCustomerName(order)}
                    </TableCell>
                    <TableCell>
                      {formatDate(order.startDate)}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{priority ? getPriorityBadge(priority) : '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(order)}
                          title="Details anzeigen"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenInEventWorx(order)}
                          title="In EventWorx öffnen"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        
                        {onEditOrder && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditOrder(order)}
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
                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                  Keine Aufträge gefunden
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedOrder && (
        <OrderDetailsDialog
          order={selectedOrder}
          open={dialogOpen}
          onOpenChange={handleDialogOpenChange}
        />
      )}
    </>
  );
}