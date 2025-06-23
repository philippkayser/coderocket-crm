import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Customer } from "@/types/customer";
import { Contact } from "@/types/contact";
import { decodeHtmlEntities } from "@/utils/formatters";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Tag,
  FileText,
  CreditCard,
  Globe,
  Printer,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { fetchContactDetails } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CustomerDetailsDialogProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerDetailsDialog({ customer, open, onOpenChange }: CustomerDetailsDialogProps) {
  const [contactDetails, setContactDetails] = useState<Record<string, Contact | null>>({});
  const [loadingContacts, setLoadingContacts] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Typensichere Zugriffsfunktion für optionale Eigenschaften
  const getCustomerProperty = (propertyPath: string) => {
    const parts = propertyPath.split('.');
    let value: any = customer;
    
    for (const part of parts) {
      if (value === undefined || value === null) return undefined;
      value = value[part];
    }
    
    return value;
  };

  // Bestimme den Namen basierend auf dem Kundentyp
  let displayName = "";
  
  // Für Unternehmen (isCompany: true) verwende personFirstName
  if (customer.isCompany) {
    // Prüfe, ob personFirstName vorhanden ist
    if (customer.personFirstName && customer.personFirstName.trim() !== "") {
      displayName = decodeHtmlEntities(customer.personFirstName).trim();
    }
    // Fallback auf companyName, wenn personFirstName nicht vorhanden ist
    else if (customer.companyName && customer.companyName.trim() !== "") {
      displayName = decodeHtmlEntities(customer.companyName).trim();
    }
  } 
  // Prüfe auf Personendaten für Personen
  else if (customer.isPerson) {
    const firstName = customer.personFirstName || customer.firstName || "";
    const lastName = customer.personLastName || customer.lastName || "";
    displayName = `${firstName} ${lastName}`.trim();
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
  const customerId = customer.customerId || "";
  const customerNumber = customer.customerNumber || "";
  const contactNumber = customer.contactNumber || "";
  const isPerson = customer.isPerson || false;
  const isCompany = customer.isCompany || false;
  const isLocation = customer.isLocation || false;
  const activation = customer.activation || "active";
  const customerUstId = customer.customerUstId || "";
  const customerPriceType = customer.customerPriceType || "";
  const customerPriceListIdentifier = customer.customerPriceListIdentifier || "";
  const customerTaxType = customer.customerTaxType || "";
  const discountRent = customer.discountRent;
  const discountSale = customer.discountSale;
  const notes = customer.notes || "";
  const personSalutation = customer.personSalutation || "";
  
  // Adressen und Kontaktpersonen
  const addresses = customer.addresses || [];
  const contactPersons = customer.contactPersons || [];
  
  // Kommunikationsdaten
  const communications = customer.communications || [];
  
  const getContactByType = (type: string) => {
    return communications.find(c => c.typeName === type);
  };
  
  const emailBusiness = getContactByType("email_business") || getContactByType("email");
  const emailPrivate = getContactByType("email_private");
  const phoneBusiness = getContactByType("tel_business") || getContactByType("phone_business") || getContactByType("phone");
  const phoneMobile = getContactByType("phone_mobile") || getContactByType("mobile");
  const phonePrivate = getContactByType("phone_private");
  const fax = getContactByType("fax") || getContactByType("fax_business");
  const website = getContactByType("website");

  // Lade Kontaktdetails, wenn der Dialog geöffnet wird
  useEffect(() => {
    if (open && contactPersons && contactPersons.length > 0) {
      contactPersons.forEach(person => {
        if (person.personId && !contactDetails[person.personId] && !loadingContacts[person.personId]) {
          setLoadingContacts(prev => ({ ...prev, [person.personId]: true }));
          
          fetchContactDetails(person.personId)
            .then(data => {
              console.log(`Contact details loaded for ${person.personId}:`, data);
              setContactDetails(prev => ({ ...prev, [person.personId]: data }));
              // Fehler für diese ID zurücksetzen, falls vorhanden
              setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[person.personId];
                return newErrors;
              });
            })
            .catch(error => {
              console.error(`Fehler beim Laden der Kontaktdetails für ${person.personId}:`, error);
              setErrors(prev => ({ 
                ...prev, 
                [person.personId]: `Fehler beim Laden der Kontaktdetails: ${error.message}` 
              }));
              setContactDetails(prev => ({ ...prev, [person.personId]: null }));
            })
            .finally(() => {
              setLoadingContacts(prev => ({ ...prev, [person.personId]: false }));
            });
        }
      });
    }
  }, [open, contactPersons]);
  
  // Prüfe, ob contactFor-Einträge vorhanden sind
  const contactFor = customer.contactFor || [];
  const hasContactFor = contactFor.length > 0;
  
  // Bestimme den Anzeigenamen mit Anrede für Personen
  let displayNameWithSalutation = displayName;
  if (isPerson && personSalutation) {
    displayNameWithSalutation = `${personSalutation} ${displayName}`;
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{displayNameWithSalutation}</DialogTitle>
          <DialogDescription className="flex items-center">
            <Tag className="h-4 w-4 mr-1" />
            <span>{customerId || contactNumber || customerNumber}</span>
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Allgemein</TabsTrigger>
            <TabsTrigger value="addresses">Adressen</TabsTrigger>
            <TabsTrigger value="contacts">Kontaktpersonen</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="py-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  {isPerson ? (
                    <User className="h-4 w-4 mr-2" />
                  ) : (
                    <Building2 className="h-4 w-4 mr-2" />
                  )}
                  {isPerson ? "Persönliche Informationen" : "Unternehmensinformationen"}
                </h3>
                <div className="text-sm pl-6 space-y-1">
                  <p>
                    <span className="font-medium">Name:</span> {displayNameWithSalutation}
                  </p>
                  {isCompany && customer.companyName && customer.companyName.trim() !== "" && (
                    <p>
                      <span className="font-medium">Firmenname:</span> {decodeHtmlEntities(customer.companyName)}
                    </p>
                  )}
                  {customerId && (
                    <p>
                      <span className="font-medium">Kundennummer:</span> {customerId}
                    </p>
                  )}
                  {contactNumber && (
                    <p>
                      <span className="font-medium">Kontaktnummer:</span> {contactNumber}
                    </p>
                  )}
                  {customerNumber && (
                    <p>
                      <span className="font-medium">Kundennummer:</span> {customerNumber}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Typ:</span> {
                      isCompany ? "Unternehmen" : 
                      isPerson ? "Person" : 
                      isLocation ? "Standort" : "Kontakt"
                    }
                  </p>
                  <p>
                    <span className="font-medium">Status:</span> {activation === "active" ? "Aktiv" : "Inaktiv"}
                  </p>
                  {customerUstId && (
                    <p>
                      <span className="font-medium">USt-ID:</span> {customerUstId}
                    </p>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Kontaktinformationen
                </h3>
                <div className="text-sm pl-6 space-y-1">
                  {emailBusiness && (
                    <p>
                      <span className="font-medium">E-Mail (Geschäftlich):</span>{" "}
                      <a href={`mailto:${emailBusiness.value}`} className="text-blue-600 hover:underline">
                        {emailBusiness.value}
                      </a>
                    </p>
                  )}
                  {emailPrivate && (
                    <p>
                      <span className="font-medium">E-Mail (Privat):</span>{" "}
                      <a href={`mailto:${emailPrivate.value}`} className="text-blue-600 hover:underline">
                        {emailPrivate.value}
                      </a>
                    </p>
                  )}
                  {phoneBusiness && (
                    <p>
                      <span className="font-medium">Telefon (Geschäftlich):</span>{" "}
                      <a href={`tel:${phoneBusiness.value}`} className="text-blue-600 hover:underline">
                        {phoneBusiness.value}
                      </a>
                    </p>
                  )}
                  {phoneMobile && (
                    <p>
                      <span className="font-medium">Telefon (Mobil):</span>{" "}
                      <a href={`tel:${phoneMobile.value}`} className="text-blue-600 hover:underline">
                        {phoneMobile.value}
                      </a>
                    </p>
                  )}
                  {phonePrivate && (
                    <p>
                      <span className="font-medium">Telefon (Privat):</span>{" "}
                      <a href={`tel:${phonePrivate.value}`} className="text-blue-600 hover:underline">
                        {phonePrivate.value}
                      </a>
                    </p>
                  )}
                  {fax && (
                    <p className="flex items-center">
                      <Printer className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span className="font-medium">Fax:</span> {fax.value}
                    </p>
                  )}
                  {website && (
                    <p className="flex items-center">
                      <Globe className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span className="font-medium">Website:</span>{" "}
                      <a href={website.value.startsWith('http') ? website.value : `https://${website.value}`} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="text-blue-600 hover:underline">
                        {website.value}
                      </a>
                    </p>
                  )}
                  {(!emailBusiness && !emailPrivate && !phoneBusiness && !phoneMobile && !phonePrivate && !fax && !website) && (
                    <p className="text-muted-foreground">Keine Kontaktinformationen verfügbar</p>
                  )}
                </div>
              </div>
              
              {(customerPriceType || customerPriceListIdentifier || customerTaxType || 
                discountRent !== undefined || discountSale !== undefined) && (
                <>
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Finanzinformationen
                    </h3>
                    <div className="text-sm pl-6 space-y-1">
                      <p>
                        <span className="font-medium">Preistyp:</span> {customerPriceType || "Nicht angegeben"}
                      </p>
                      <p>
                        <span className="font-medium">Preisliste:</span> {customerPriceListIdentifier || "Nicht angegeben"}
                      </p>
                      <p>
                        <span className="font-medium">Steuertyp:</span> {customerTaxType || "Nicht angegeben"}
                      </p>
                      {discountRent !== null && discountRent !== undefined && (
                        <p>
                          <span className="font-medium">Rabatt (Miete):</span> {discountRent}%
                        </p>
                      )}
                      {discountSale !== null && discountSale !== undefined && (
                        <p>
                          <span className="font-medium">Rabatt (Verkauf):</span> {discountSale}%
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
              
              {notes && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Notizen
                    </h3>
                    <p className="text-sm whitespace-pre-wrap pl-6">{notes}</p>
                  </div>
                </>
              )}
              
              {hasContactFor && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <Building2 className="h-4 w-4 mr-2" />
                      Zugehörige Unternehmen
                    </h3>
                    <div className="space-y-3 pl-6">
                      {contactFor.map((company, index) => (
                        <div key={index} className="border-l-2 border-gray-200 pl-2">
                          <p className="font-medium">
                            {decodeHtmlEntities(company.companyName || company.personFirstName || company.locationName || '')}
                          </p>
                          {company.customerId && (
                            <p className="text-xs text-muted-foreground">Kundennummer: {company.customerId}</p>
                          )}
                          {company.contactNumber && (
                            <p className="text-xs text-muted-foreground">Kontaktnummer: {company.contactNumber}</p>
                          )}
                          {company.addresses && company.addresses.length > 0 && (
                            <p className="text-xs">
                              {company.addresses[0].city && (
                                <span>{company.addresses[0].city}</span>
                              )}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="addresses" className="py-4">
            {addresses && addresses.length > 0 ? (
              <div className="space-y-6">
                {addresses.map((address, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {address.type || `Adresse ${index + 1}`}
                    </h3>
                    <div className="text-sm pl-6">
                      <p>{address.street}</p>
                      {address.addressextension && (
                        <p>{address.addressextension}</p>
                      )}
                      <p>{address.zipcode} {address.city}</p>
                      <p className="uppercase">{address.country}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Keine Adressen verfügbar</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="contacts" className="py-4">
            {contactPersons && contactPersons.length > 0 ? (
              <div className="space-y-6">
                {contactPersons.map((person, index) => {
                  const personId = person.personId;
                  const isLoading = personId ? loadingContacts[personId] : false;
                  const contactDetail = personId ? contactDetails[personId] : null;
                  const error = personId ? errors[personId] : null;
                  
                  // Extrahiere Kontaktdaten
                  const firstName = person.firstName || contactDetail?.personFirstName || '';
                  const lastName = person.lastName || contactDetail?.personLastName || '';
                  const salutation = contactDetail?.personSalutation || '';
                  const role = person.role || '';
                  
                  // Erstelle formatierten Namen mit Anrede
                  const formattedName = `${salutation ? `${salutation} ` : ''}${firstName} ${lastName}${role ? ` (${role})` : ''}`;
                  
                  return (
                    <div key={index} className="border rounded-md p-4">
                      <h3 className="text-sm font-medium mb-2 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        {formattedName || `Kontaktperson ${index + 1}`}
                      </h3>
                      
                      {isLoading ? (
                        <div className="pl-6 space-y-2">
                          <div className="flex items-center">
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            <span className="text-sm text-muted-foreground">Lade Kontaktdetails...</span>
                          </div>
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      ) : error ? (
                        <Alert variant="destructive" className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      ) : (
                        <div className="text-sm pl-6 space-y-1">
                          {personId && (
                            <p>
                              <span className="font-medium">ID:</span> {personId}
                            </p>
                          )}
                          
                          {contactDetail?.contactNumber && (
                            <p>
                              <span className="font-medium">Kontaktnummer:</span> {contactDetail.contactNumber}
                            </p>
                          )}
                          
                          {/* Zeige Daten aus der Kontaktperson oder den abgerufenen Kontaktdetails */}
                          {(person.businessUnit || contactDetail?.businessUnit) && (
                            <p>
                              <span className="font-medium">Abteilung:</span> {person.businessUnit || contactDetail?.businessUnit}
                            </p>
                          )}
                          
                          {(person.position || contactDetail?.position) && (
                            <p>
                              <span className="font-medium">Position:</span> {person.position || contactDetail?.position}
                            </p>
                          )}
                          
                          {/* Kommunikationsdaten aus den Kontaktdetails */}
                          {contactDetail?.communications && contactDetail.communications.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {contactDetail.communications.map((comm, commIndex) => {
                                let icon = null;
                                let label = '';
                                let isLink = false;
                                let linkPrefix = '';
                                
                                switch (comm.typeName) {
                                  case 'email':
                                  case 'email_business':
                                  case 'email_private':
                                    icon = <Mail className="h-3 w-3 mr-1 text-muted-foreground" />;
                                    label = 'E-Mail';
                                    isLink = true;
                                    linkPrefix = 'mailto:';
                                    break;
                                  case 'phone':
                                  case 'tel_business':
                                  case 'phone_business':
                                  case 'phone_private':
                                    icon = <Phone className="h-3 w-3 mr-1 text-muted-foreground" />;
                                    label = 'Telefon';
                                    isLink = true;
                                    linkPrefix = 'tel:';
                                    break;
                                  case 'phone_mobile':
                                  case 'mobile':
                                    icon = <Phone className="h-3 w-3 mr-1 text-muted-foreground" />;
                                    label = 'Mobil';
                                    isLink = true;
                                    linkPrefix = 'tel:';
                                    break;
                                  case 'fax':
                                  case 'fax_business':
                                    icon = <Printer className="h-3 w-3 mr-1 text-muted-foreground" />;
                                    label = 'Fax';
                                    break;
                                  case 'website':
                                    icon = <Globe className="h-3 w-3 mr-1 text-muted-foreground" />;
                                    label = 'Website';
                                    isLink = true;
                                    linkPrefix = '';
                                    break;
                                  default:
                                    icon = null;
                                    label = comm.typeName;
                                }
                                
                                return (
                                  <p key={commIndex} className="flex items-center">
                                    {icon}
                                    <span className="font-medium">{label}:</span>{" "}
                                    {isLink ? (
                                      <a 
                                        href={`${linkPrefix}${comm.value}`} 
                                        className="text-blue-600 hover:underline ml-1"
                                        target={comm.typeName === 'website' ? '_blank' : undefined}
                                        rel={comm.typeName === 'website' ? 'noopener noreferrer' : undefined}
                                      >
                                        {comm.value}
                                      </a>
                                    ) : (
                                      <span className="ml-1">{comm.value}</span>
                                    )}
                                  </p>
                                );
                              })}
                            </div>
                          )}
                          
                          {/* Kontaktperson ist für folgende Unternehmen zuständig */}
                          {contactDetail?.contactFor && contactDetail.contactFor.length > 0 && (
                            <div className="mt-3">
                              <p className="font-medium mb-1">Kontakt für:</p>
                              <div className="ml-4 space-y-2">
                                {contactDetail.contactFor.map((company, companyIndex) => (
                                  <div key={companyIndex} className="border-l-2 border-gray-200 pl-2">
                                    <p className="font-medium">
                                      {decodeHtmlEntities(company.companyName || company.personFirstName || company.locationName || '')}
                                    </p>
                                    {company.customerId && (
                                      <p className="text-xs text-muted-foreground">Kundennummer: {company.customerId}</p>
                                    )}
                                    {company.addresses && company.addresses.length > 0 && (
                                      <p className="text-xs">
                                        {company.addresses[0].city && (
                                          <span>{company.addresses[0].city}</span>
                                        )}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Wenn keine Daten verfügbar sind */}
                          {!personId && !contactDetail && !person.businessUnit && !person.position && (
                            <p className="text-muted-foreground">Keine weiteren Details verfügbar</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Keine Kontaktpersonen verfügbar</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Schließen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}