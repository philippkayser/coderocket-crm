import { useState, useEffect } from "react";
import { Customer } from "@/types/customer";
import { CustomerCard } from "./CustomerCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { fetchCustomers } from "@/lib/api";

export function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lade Kunden beim ersten Rendern
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        const data = await fetchCustomers();
        
        // Suche nach PM2 Veranstaltungstechnik in contactFor
        let pm2Found = false;
        let pm2Data: Customer | null = null;
        
        // Durchsuche alle Kontakte nach PM2 in contactFor
        data.forEach(customer => {
          if (customer.contactFor && customer.contactFor.length > 0) {
            customer.contactFor.forEach(company => {
              if (company.companyName && company.companyName.includes("PM2 Veranstaltungstechnik") && company.id) {
                pm2Found = true;
                
                // Erstelle einen neuen Kunden aus den contactFor-Daten
                if (!pm2Data) {
                  pm2Data = {
                    id: company.id,
                    contactNumber: company.contactNumber || "KO-0282", // Fallback zur bekannten Nummer
                    companyName: company.companyName,
                    isCompany: true,
                    isCustomer: true,
                    isPerson: false,
                    customerId: company.customerId,
                    addresses: company.addresses || [],
                    communications: company.communications || [],
                    contactPersons: company.contactPersons || []
                  } as Customer;
                }
              }
            });
          }
        });
        
        // Filtere nur Kunden, die entweder Unternehmen oder Personen sind und gleichzeitig Kunden sind
        let validCustomers = data.filter(customer => {
          // Prüfe, ob es sich um einen Kunden handelt
          const isValidCustomer = customer.isCustomer === true && (customer.isCompany === true || customer.isPerson === true);
          
          // Spezielle Behandlung für PM2 Veranstaltungstechnik
          const isPM2 = customer.companyName && customer.companyName.includes("PM2 Veranstaltungstechnik");
          
          // Zeige den Kunden an, wenn es ein gültiger Kunde ist oder wenn es PM2 ist
          return isValidCustomer || isPM2;
        });
        
        // Füge PM2 hinzu, wenn es gefunden wurde und nicht bereits in der Liste ist
        if (pm2Data && !validCustomers.some(c => c.id === pm2Data?.id)) {
          validCustomers.push(pm2Data);
        }
        
        console.log(`Filtered ${validCustomers.length} valid customers from ${data.length} total`);
        
        setCustomers(validCustomers);
        setFilteredCustomers(validCustomers);
        setError(null);
      } catch (err) {
        console.error("Fehler beim Laden der Kunden:", err);
        setError("Fehler beim Laden der Kunden. Bitte versuchen Sie es später erneut.");
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  // Filtere Kunden basierend auf dem Suchbegriff
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = customers.filter((customer) => {
      // Suche in verschiedenen Feldern
      const companyName = customer.companyName || "";
      const firstName = customer.personFirstName || customer.firstName || "";
      const lastName = customer.personLastName || customer.lastName || "";
      const fullName = `${firstName} ${lastName}`.trim();
      const contactNumber = customer.contactNumber || "";
      const customerId = customer.customerId || "";
      
      // Suche in Adressen
      const hasMatchingAddress = customer.addresses && customer.addresses.some(address => {
        const street = address.street || "";
        const city = address.city || "";
        const zipcode = address.zipcode || "";
        
        return (
          street.toLowerCase().includes(searchTermLower) ||
          city.toLowerCase().includes(searchTermLower) ||
          zipcode.toLowerCase().includes(searchTermLower)
        );
      });
      
      // Suche in Kommunikationsdaten
      const hasMatchingCommunication = customer.communications && customer.communications.some(comm => {
        const value = comm.value || "";
        return value.toLowerCase().includes(searchTermLower);
      });
      
      return (
        companyName.toLowerCase().includes(searchTermLower) ||
        fullName.toLowerCase().includes(searchTermLower) ||
        contactNumber.toLowerCase().includes(searchTermLower) ||
        customerId.toLowerCase().includes(searchTermLower) ||
        hasMatchingAddress ||
        hasMatchingCommunication
      );
    });

    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Kunden suchen..."
          className="pl-8 pr-10"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-9 w-9 p-0"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Suche löschen</span>
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Lade Kunden...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-destructive">
          <p>{error}</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchTerm
              ? "Keine Kunden gefunden, die Ihren Suchkriterien entsprechen."
              : "Keine Kunden verfügbar."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => (
            <CustomerCard key={customer.id || customer.contactNumber} customer={customer} />
          ))}
        </div>
      )}
    </div>
  );
}