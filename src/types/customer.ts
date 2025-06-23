export interface Customer {
  id?: string;
  contactNumber?: string;
  customerId?: string;
  customerNumber?: string;
  customerDebitorId?: string;
  
  // Flags
  isCompany?: boolean;
  isPerson?: boolean;
  isLocation?: boolean;
  isCustomer?: boolean;
  isSupplier?: boolean;
  
  // Persönliche Daten
  personSalutation?: string;
  personTitle?: string;
  personFirstName?: string;
  personLastName?: string;
  personDepartment?: string;
  personPosition?: string;
  firstName?: string;
  lastName?: string;
  
  // Unternehmensdaten
  companyName?: string;
  locationName?: string;
  customerUstId?: string;
  
  // Finanzinformationen
  customerPriceType?: string;
  customerPriceListIdentifier?: string;
  customerTaxType?: string;
  discountRent?: number | null;
  discountSale?: number | null;
  
  // Status
  activation?: string;
  
  // Notizen
  notes?: string;
  salutationLetterText?: string;
  
  // Beziehungen
  contactPersons?: ContactPerson[];
  contactFor?: ContactForCompany[];
  
  // Kontaktdaten
  addresses?: Address[];
  communications?: Communication[];
  
  // Metadaten
  version?: number;
  creationUser?: string;
  creationDate?: number;
  modificationUser?: string;
  modificationDate?: number;
}

export interface ContactPerson {
  index?: number;
  role?: string;
  businessUnit?: string;
  personId?: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  'sub-id'?: string;
  id?: string;
  version?: number;
  contactId?: string;
}

export interface ContactForCompany {
  id?: string;
  isCustomer?: boolean;
  personFirstName?: string;
  companyName?: string;
  locationName?: string;
  addresses?: Address[];
  communications?: Communication[];
  customerId?: string;
  customerDebitorId?: string;
  discountRent?: number;
  customerGroups?: string[];
  isPerson?: boolean;
  isCompany?: boolean;
  contactPersons?: ContactPerson[];
  'sub-id-gen-contactPersons'?: number;
  contactNumber?: string;
  isSupplier?: boolean;
  supplierId?: string;
  supplierKreditorId?: string;
  version?: number;
  creationUser?: string;
  creationDate?: number;
  modificationUser?: string;
  modificationDate?: number;
  contactId?: string;
}

export interface Address {
  type?: string;
  country?: string;
  addressextension?: string;
  street?: string;
  zipcode?: string;
  city?: string;
  'sub-id'?: string;
  id?: string;
  version?: number;
  contactId?: string;
}

export interface Communication {
  typeName?: string;
  value?: string;
  'sub-id'?: string;
  id?: string;
  version?: number;
  contactId?: string;
}