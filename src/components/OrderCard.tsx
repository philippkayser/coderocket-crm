import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency, decodeHtmlEntities } from "@/utils/formatters";
import { Order } from "@/types/order";
import { Calendar, MapPin, User, Tag, AlertTriangle, ExternalLink, Edit, Info } from "lucide-react";
import { useState } from "react";
import { OrderDetailsDialog } from "./OrderDetailsDialog";

interface OrderCardProps {
  order: Order;
  onEdit?: (order: Order) => void;
}

export function OrderCard({ order, onEdit }: OrderCardProps) {
  const [showDetails, setShowDetails] = useState(false);

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
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Hohe Priorität</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Mittlere Priorität</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Niedrige Priorität</Badge>;
      default:
        return null;
    }
  };

  // Typensichere Zugriffsfunktion für optionale Eigenschaften
  const getOrderProperty = (propertyPath: string) => {
    const parts = propertyPath.split('.');
    let value: any = order;
    
    for (const part of parts) {
      if (value === undefined || value === null) return undefined;
      value = value[part];
    }
    
    return value;
  };

  // Sicherer Zugriff auf verschachtelte Eigenschaften
  const postalAddress = getOrderProperty('postalAddress') || {};
  const zipcode = postalAddress.zipcode;
  const city = postalAddress.city;
  
  // Sicherer Zugriff auf priority
  const priority = getOrderProperty('priority');
  
  // Sicherer Zugriff auf Kundendaten
  const customerName = order.customer?.companyName 
    ? decodeHtmlEntities(order.customer.companyName)
    : getOrderProperty('customer.firstName') && getOrderProperty('customer.lastName')
      ? `${getOrderProperty('customer.firstName')} ${getOrderProperty('customer.lastName')}`
      : 'Kein Kundenname';

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                {order.jobNumber}
              </div>
              <h3 className="text-lg font-semibold">{order.title}</h3>
            </div>
            <div className="flex flex-col gap-1">
              {getStatusBadge(order.status)}
              {priority && getPriorityBadge(priority)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span>{customerName}</span>
            </div>
            
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <div>{formatDate(order.startDate)}</div>
                {order.endDate && order.endDate !== order.startDate && (
                  <div className="text-muted-foreground text-sm">
                    bis {formatDate(order.endDate)}
                  </div>
                )}
              </div>
            </div>
            
            {(zipcode || city) && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>
                  {zipcode && `${zipcode} `}
                  {city}
                </span>
              </div>
            )}
            
            {order.overallPriceValue > 0 && (
              <div className="flex items-start gap-2">
                <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>{formatCurrency(order.overallPriceValue / 100)}</span>
              </div>
            )}
            
            {order.stockConflict && (
              <div className="flex items-start gap-2 text-amber-600">
                <AlertTriangle className="h-4 w-4 mt-0.5" />
                <span>Lagerkonflikt</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-2 flex justify-between">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowDetails(true)}
          >
            <Info className="h-4 w-4 mr-2" />
            Details
          </Button>
          
          <Button 
            variant="default" 
            size="sm"
            onClick={() => window.open(`https://lsz-vt.eventworx.biz/eventworx/#job/edit/order/${order.id}`, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
        </CardFooter>
      </Card>

      <OrderDetailsDialog 
        order={order} 
        open={showDetails} 
        onOpenChange={setShowDetails} 
      />
    </>
  );
}