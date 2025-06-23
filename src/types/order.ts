// Aktualisierte Order-Schnittstelle mit allen benötigten Eigenschaften
export interface Order {
  id: string;
  customer: {
    id: string;
    companyName?: string;
    firstName?: string;
    lastName?: string;
  };
  title: string;
  description?: string;
  status: 'new' | 'in_progress' | 'completed' | 'cancelled' | 'open';
  priority: 'low' | 'medium' | 'high';
  jobNumber: string;
  startDate: number | string | null; // Kann ein Timestamp (number) oder ein Datumsstring sein
  endDate: number | string | null;
  rentStartDate: number | string | null;
  rentEndDate: number | string | null;
  location: string;
  assignedTo: string[];
  tags: string[];
  attachments: string[];
  stockConflict?: boolean;
  overallPriceValue?: number;
  deliveryNotes?: string;
  invoiceStatus?: string;
  notes?: string;
  // Weitere Eigenschaften nach Bedarf
}