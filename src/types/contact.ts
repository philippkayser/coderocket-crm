export interface Contact {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  position?: string;
  department?: string;
  company?: string;
  companyId?: string;
  notes?: string;
  communications?: {
    typeName: string;
    value: string;
  }[];
  address?: {
    street?: string;
    zipcode?: string;
    city?: string;
    country?: string;
  };
  // Weitere mögliche Felder
  [key: string]: any;
}