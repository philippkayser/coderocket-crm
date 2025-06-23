import { Order } from '@/types/order';
import { Customer } from '@/types/customer';
import { Contact } from '@/types/contact';

// Authentication token
const AUTH_TOKEN = 'WUGKwcFuayAaAPAuFfNqTvSsyeYVHymotrA';

// Function to fetch orders from the API
export async function fetchOrders(): Promise<Order | Order[]> {
  try {
    // Für n8n-URLs benötigen wir nur den AUTH_TOKEN im Authorization-Header
    const response = await fetch('https://n8n.lsz-vt.de/webhook/cf84fbc5-4df1-40f2-b2f7-feb55bec1e0b', {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Wenn die Antwort nicht OK ist
    if (!response.ok) {
      console.warn(`API-Anfrage fehlgeschlagen mit Status ${response.status}`);
      
      // Versuche, den Fehlertext zu lesen
      try {
        const errorText = await response.text();
        console.warn('API-Fehlerantwort:', errorText);
      } catch (e) {
        console.warn('Konnte Fehlerantwort nicht lesen');
      }
      
      // Gib leere Liste zurück
      return [];
    }
    
    // Prüfe zuerst, ob die Antwort leer ist
    const text = await response.text();
    
    if (!text || text.trim() === '') {
      console.warn('API hat eine leere Antwort zurückgegeben');
      return [];
    }
    
    // Versuche, den Text als JSON zu parsen
    try {
      const data = JSON.parse(text);
      return data;
    } catch (parseError) {
      console.error('Fehler beim Parsen der Antwort:', parseError);
      console.warn('Antworttext:', text);
      return [];
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    // Gib leere Liste zurück, anstatt den Fehler weiterzugeben
    return [];
  }
}

// Function to fetch customers from the API
export async function fetchCustomers(): Promise<Customer[]> {
  try {
    console.log('Fetching customers...');
    
    // Für n8n-URLs benötigen wir nur den AUTH_TOKEN im Authorization-Header
    const response = await fetch('https://n8n.lsz-vt.de/webhook/541e6c92-b41f-42e8-8b14-c567651629dd', {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Wenn die Antwort nicht OK ist
    if (!response.ok) {
      console.warn(`API-Anfrage fehlgeschlagen mit Status ${response.status}`);
      
      // Versuche, den Fehlertext zu lesen
      try {
        const errorText = await response.text();
        console.warn('API-Fehlerantwort:', errorText);
      } catch (e) {
        console.warn('Konnte Fehlerantwort nicht lesen');
      }
      
      // Gib leere Liste zurück
      return [];
    }
    
    // Prüfe zuerst, ob die Antwort leer ist
    const text = await response.text();
    
    if (!text || text.trim() === '') {
      console.warn('API hat eine leere Antwort zurückgegeben');
      return [];
    }
    
    // Versuche, den Text als JSON zu parsen
    try {
      const responseData = JSON.parse(text);
      
      // Protokolliere die vollständige API-Antwort
      console.log('Complete API response:');
      console.log(JSON.stringify(responseData, null, 2));
      
      // Prüfe, ob die Antwort ein Array ist
      if (Array.isArray(responseData)) {
        console.log(`Successfully parsed ${responseData.length} customers`);
        
        // Transformiere die Daten in das erwartete Format
        const customers = responseData.map((customer: any) => {
          // Erstelle eine Kopie des Kunden, um Änderungen vorzunehmen
          const processedCustomer = { ...customer };
          
          // Extrahiere Kontaktinformationen
          const communications = customer.communications || [];
          
          // Extrahiere Adressinformationen aus contactFor, falls vorhanden
          let addresses = customer.addresses || [];
          
          if (customer.contactFor && customer.contactFor.length > 0) {
            const primaryCompany = customer.contactFor[0];
            
            // Wenn der Kontakt selbst keine Adressen hat, aber contactFor hat Adressen
            if (addresses.length === 0 && primaryCompany.addresses && primaryCompany.addresses.length > 0) {
              addresses = primaryCompany.addresses;
            }
            
            // Extrahiere Unternehmensinformationen, wenn sie im Hauptobjekt fehlen oder leer sind
            if ((!processedCustomer.companyName || processedCustomer.companyName.trim() === '') && primaryCompany.companyName) {
              processedCustomer.companyName = primaryCompany.companyName.trim();
            }
            
            // Wenn der Kontakt ein Kunde ist, aber keine Flags gesetzt sind, übernehme die Flags vom primären Unternehmen
            if (processedCustomer.isCustomer && !processedCustomer.isCompany && !processedCustomer.isPerson) {
              if (primaryCompany.isCompany) {
                processedCustomer.isCompany = true;
              }
              if (primaryCompany.isPerson) {
                processedCustomer.isPerson = true;
              }
            }
            
            // Wenn der Kontakt selbst keine Kommunikationsdaten hat, aber contactFor hat welche
            if (communications.length === 0 && primaryCompany.communications && primaryCompany.communications.length > 0) {
              processedCustomer.communications = [...primaryCompany.communications];
            } else {
              processedCustomer.communications = communications;
            }
            
            // Setze die Adressen
            processedCustomer.addresses = addresses;
          } else {
            // Wenn kein contactFor vorhanden ist, behalte die ursprünglichen Daten
            processedCustomer.communications = communications;
            processedCustomer.addresses = addresses;
          }
          
          return processedCustomer;
        });
        
        return customers;
      } else {
        console.warn('API-Antwort ist kein Array:', responseData);
        return [];
      }
    } catch (parseError) {
      console.error('Fehler beim Parsen der Antwort:', parseError);
      console.warn('Antworttext:', text);
      return [];
    }
  } catch (error) {
    console.error('Error fetching customers:', error);
    // Gib leere Liste zurück, anstatt den Fehler weiterzugeben
    return [];
  }
}

// Function to fetch contact details from the API
export async function fetchContactDetails(contactId: string): Promise<Contact> {
  try {
    console.log(`Fetching contact details for ID: ${contactId}`);
    
    // Korrigierte URL: webhook statt webhook-test
    const response = await fetch(`https://n8n.lsz-vt.de/webhook/eventworx/get-contact/?id=${encodeURIComponent(contactId)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Wenn die Antwort nicht OK ist
    if (!response.ok) {
      console.warn(`API-Anfrage für Kontaktdetails fehlgeschlagen mit Status ${response.status}`);
      
      // Versuche, den Fehlertext zu lesen
      try {
        const errorText = await response.text();
        console.warn('API-Fehlerantwort:', errorText);
      } catch (e) {
        console.warn('Konnte Fehlerantwort nicht lesen');
      }
      
      throw new Error(`API-Anfrage fehlgeschlagen mit Status ${response.status}`);
    }
    
    // Prüfe zuerst, ob die Antwort leer ist
    const text = await response.text();
    
    if (!text || text.trim() === '') {
      console.warn('API hat eine leere Antwort zurückgegeben');
      throw new Error('API hat eine leere Antwort zurückgegeben');
    }
    
    // Versuche, den Text als JSON zu parsen
    try {
      const data = JSON.parse(text);
      
      // Protokolliere die vollständige API-Antwort
      console.log(`Complete API response for contact ID ${contactId}:`);
      console.log(JSON.stringify(data, null, 2));
      
      // Prüfe, ob die Antwort die erwartete Struktur hat
      if (data.success && data.data) {
        console.log(`Successfully parsed contact data for ID ${contactId}`);
        return data.data; // Gib nur die eigentlichen Kontaktdaten zurück
      } else {
        console.warn('API-Antwort hat nicht die erwartete Struktur:', data);
        throw new Error('API-Antwort hat nicht die erwartete Struktur');
      }
    } catch (parseError) {
      console.error('Fehler beim Parsen der Antwort:', parseError);
      console.warn('Antworttext:', text);
      throw parseError;
    }
  } catch (error) {
    console.error(`Error fetching contact details for ID ${contactId}:`, error);
    throw error;
  }
}

// Hilfsfunktion zum Testen der API-Verbindung
export async function testApiConnection(): Promise<boolean> {
  try {
    // Sende eine GET-Anfrage, um die Verbindung zu testen
    const response = await fetch('https://n8n.lsz-vt.de/webhook/cf84fbc5-4df1-40f2-b2f7-feb55bec1e0b', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    
    console.log('API-Verbindungstest:', response.status, response.statusText);
    
    // Versuche, den Antworttext zu lesen
    try {
      const text = await response.text();
      console.log('API-Antworttext:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
    } catch (e) {
      console.warn('Konnte Antworttext nicht lesen');
    }
    
    return response.ok;
  } catch (error) {
    console.error('API-Verbindungstest fehlgeschlagen:', error);
    return false;
  }
}