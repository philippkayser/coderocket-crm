import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency, decodeHtmlEntities } from "@/utils/formatters";
import { Order } from "@/types/order";
import { Calendar, MapPin, User, Tag, Phone, Mail, FileText, ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface OrderDetailsDialogProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailsDialog({ order, open, onOpenChange }: OrderDetailsDialogProps) {
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
  
  // Sicherer Zugriff auf Kundendaten
  const customerCompanyName = getOrderProperty('customer.companyName');
  const customerPersonFirstName = getOrderProperty('customer.personFirstName');
  const customerPersonLastName = getOrderProperty('customer.personLastName');
  
  // Suche nach Kommunikationsdaten (E-Mail, Telefon) in den communications
  const findCommunicationValue = (typeName: string) => {
    const communications = getOrderProperty('customer.communications');
    if (!communications || !Array.isArray(communications)) return undefined;
    
    const comm = communications.find(c => c.typeName === typeName);
    return comm ? comm.value : undefined;
  };
  
  const customerEmail = findCommunicationValue('email');
  const customerPhone = findCommunicationValue('phone');
  
  // Formatierter Kundenname
  const customerName = customerCompanyName 
    ? decodeHtmlEntities(customerCompanyName)
    : customerPersonFirstName || customerPersonLastName
      ? `${customerPersonFirstName || ''} ${customerPersonLastName || ''}`.trim()
      : 'Kein Kundenname';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                {order.jobNumber}
              </div>
              <DialogTitle className="text-xl">{order.title}</DialogTitle>
            </div>
            <div className="flex flex-col gap-1">
              {getStatusBadge(order.status)}
              {getOrderProperty('priority') && getPriorityBadge(getOrderProperty('priority'))}
            </div>
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Linke Spalte */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Kundeninformationen</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{customerName}</span>
                </div>
                
                {customerEmail && (
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <a href={`mailto:${customerEmail}`} className="text-blue-600 hover:underline">
                      {customerEmail}
                    </a>
                  </div>
                )}
                
                {customerPhone && (
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <a href={`tel:${customerPhone}`} className="text-blue-600 hover:underline">
                      {customerPhone}
                    </a>
                  </div>
                )}
                
                {(zipcode || city) && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>
                      {zipcode && `${zipcode} `}
                      {city}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Zeitraum</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div><span className="font-medium">Start:</span> {formatDate(order.startDate)}</div>
                    {order.endDate && (
                      <div><span className="font-medium">Ende:</span> {formatDate(order.endDate)}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {getOrderProperty('description') && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Beschreibung</h3>
                  <div className="whitespace-pre-wrap text-sm">{getOrderProperty('description')}</div>
                </div>
              </>
            )}
          </div>
          
          {/* Rechte Spalte */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Auftragsinformationen</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <div><span className="font-medium">Auftragsnummer:</span> {order.jobNumber}</div>
                    
                    {/* Sicherer Zugriff auf orderNumber */}
                    {getOrderProperty('orderNumber') && (
                      <div><span className="font-medium">Bestellnummer:</span> {getOrderProperty('orderNumber')}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Finanzen</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    {order.overallPriceValue !== undefined && (
                      <div><span className="font-medium">Gesamtpreis (netto):</span> {formatCurrency(order.overallPriceValue / 100)}</div>
                    )}
                    
                    {/* Sicherer Zugriff auf totalVATfull */}
                    {getOrderProperty('totalVATfull') !== undefined && (
                      <div><span className="font-medium">MwSt.:</span> {formatCurrency(getOrderProperty('totalVATfull') / 100)}</div>
                    )}
                    
                    {/* Sicherer Zugriff auf overallPriceValueOtherPriceType */}
                    {getOrderProperty('overallPriceValueOtherPriceType') !== undefined && (
                      <div>
                        <span className="font-medium">Gesamtpreis (brutto):</span> 
                        {formatCurrency(getOrderProperty('overallPriceValueOtherPriceType') / 100)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Lieferinformationen</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    {/* Sicherer Zugriff auf handoverType */}
                    {getOrderProperty('handoverType') && (
                      <div>
                        <span className="font-medium">Übergabetyp:</span> 
                        {getOrderProperty('handoverType') || 'Nicht angegeben'}
                      </div>
                    )}
                    
                    {/* Sicherer Zugriff auf deliveryStatus */}
                    {getOrderProperty('deliveryStatus') && (
                      <div>
                        <span className="font-medium">Lieferstatus:</span> 
                        {getOrderProperty('deliveryStatus') || 'Nicht angegeben'}
                      </div>
                    )}
                    
                    {/* Sicherer Zugriff auf deliveryPlanningStatus */}
                    {getOrderProperty('deliveryPlanningStatus') && (
                      <div>
                        <span className="font-medium">Planungsstatus:</span> 
                        {getOrderProperty('deliveryPlanningStatus') || 'Nicht angegeben'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Schließen
          </Button>
          <Button 
            variant="default" 
            onClick={() => window.open(`https://lsz-vt.eventworx.biz/eventworx/#job/edit/order/${order.id}`, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            In EventWorx öffnen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}