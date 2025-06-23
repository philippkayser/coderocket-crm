import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Customer } from "@/types/customer";
import { MapPin, Phone, Mail, User, Building2 } from "lucide-react";
import { decodeHtmlEntities } from "@/utils/formatters";
import { useState } from "react";
import { CustomerDetailsDialog } from "./CustomerDetailsDialog";

interface CustomerCardProps {
  customer: Customer;
}

export function CustomerCard({ customer }: CustomerCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Bestimme den Namen basierend auf dem Kundentyp
  let displayName = "";
  
  // Prüfe auf Personendaten für Personen
  if (customer.isPerson && customer.isCustomer) {
    const firstName = customer.personFirstName || customer.firstName || "";
    const lastName = customer.personLastName || customer.lastName || "";
    displayName = `${firstName} ${lastName}`.trim();
  } 
  // Prüfe auf Firmennamen für Unternehmen
  else if (customer.isCompany && customer.isCustomer) {
    displayName = decodeHtmlEntities(customer.companyName || "").trim();
  }
  // Fallback für andere Fälle
  else {
    // Prüfe auf Personendaten
    if (customer.personFirstName || customer.personLastName) {
      const firstName = customer.personFirstName || "";
      const lastName = customer.personLastName || "";
      displayName = `${firstName} ${lastName}`.trim();
    } 
    // Prüfe auf Firmennamen
    else if (customer.companyName && customer.companyName.trim() !== "") {
      displayName = decodeHtmlEntities(customer.companyName).trim();
    }
    // Prüfe auf Standortnamen
    else if (customer.locationName && customer.locationName.trim() !== "") {
      displayName = decodeHtmlEntities(customer.locationName).trim();
    }
    // Wenn keine direkten Namen verfügbar sind, prüfe contactFor
    else if (customer.contactFor && customer.contactFor.length > 0) {
      const primaryCompany = customer.contactFor[0];
      if (primaryCompany.companyName && primaryCompany.companyName.trim() !== "") {
        displayName = decodeHtmlEntities(primaryCompany.companyName).trim();
      } else if (primaryCompany.personFirstName && primaryCompany.personFirstName.trim() !== "") {
        displayName = decodeHtmlEntities(primaryCompany.personFirstName).trim();
      } else if (primaryCompany.locationName && primaryCompany.locationName.trim() !== "") {
        displayName = decodeHtmlEntities(primaryCompany.locationName).trim();
      }
    }
  }
  
  // Wenn immer noch kein Name gefunden wurde, verwende einen Platzhalter
  if (!displayName) {
    displayName = "Unbenannter Kontakt";
  }
  
  // Extrahiere weitere Daten
  const customerId = customer.customerId || customer.contactNumber || "";
  
  // Suche nach der ersten verfügbaren Adresse
  const addresses = customer.addresses || [];
  const firstAddress = addresses.length > 0 ? addresses[0] : null;
  
  // Suche nach Kommunikationsdaten
  const communications = customer.communications || [];
  const getContactByType = (type: string) => {
    return communications.find(c => c.typeName === type);
  };
  
  const emailBusiness = getContactByType("email_business") || getContactByType("email");
  const phoneBusiness = getContactByType("tel_business") || getContactByType("phone_business") || getContactByType("phone") || getContactByType("mobile");
  const phoneMobile = getContactByType("phone_mobile") || getContactByType("mobile");
  
  // Prüfe, ob Kontaktpersonen vorhanden sind
  const hasContactPersons = customer.contactPersons && customer.contactPersons.length > 0;
  
  // Prüfe, ob contactFor-Einträge vorhanden sind
  const hasContactFor = customer.contactFor && customer.contactFor.length > 0;
  
  // Bestimme den Kundentyp
  const customerType = customer.isCompany ? "Unternehmen" : 
                       customer.isPerson ? "Person" : 
                       customer.isLocation ? "Standort" : "Kontakt";

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold truncate">
            {displayName}
          </CardTitle>
          <CardDescription className="flex items-center text-xs">
            <span className="font-medium mr-1">{customerId}</span>
            <span className="text-muted-foreground ml-1">({customerType})</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="space-y-2 text-sm">
            {firstAddress && (
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                <div>
                  {firstAddress.street && <p>{firstAddress.street}</p>}
                  {firstAddress.zipcode && firstAddress.city && (
                    <p>{firstAddress.zipcode} {firstAddress.city}</p>
                  )}
                </div>
              </div>
            )}
            
            {phoneBusiness && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <a href={`tel:${phoneBusiness.value}`} className="hover:underline">
                  {phoneBusiness.value}
                </a>
              </div>
            )}
            
            {emailBusiness && (
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <a href={`mailto:${emailBusiness.value}`} className="hover:underline truncate">
                  {emailBusiness.value}
                </a>
              </div>
            )}
            
            {hasContactPersons && (
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{customer.contactPersons.length} Kontaktperson{customer.contactPersons.length !== 1 ? 'en' : ''}</span>
              </div>
            )}
            
            {hasContactFor && (
              <div className="flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Kontakt für {customer.contactFor.length} Unternehmen</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <Button variant="outline" className="w-full" onClick={() => setShowDetails(true)}>
            Details anzeigen
          </Button>
        </CardFooter>
      </Card>
      
      <CustomerDetailsDialog 
        customer={customer} 
        open={showDetails} 
        onOpenChange={setShowDetails} 
      />
    </>
  );
}