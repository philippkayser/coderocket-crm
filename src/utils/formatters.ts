// Hilfsfunktion zum Formatieren von Datumsangaben
export function formatDate(dateValue: string | number | null): string {
  if (!dateValue) return '-';
  
  // Konvertiere String oder Number zu Date
  const date = typeof dateValue === 'string' 
    ? new Date(dateValue) 
    : new Date(dateValue);
  
  // Überprüfe, ob das Datum gültig ist
  if (isNaN(date.getTime())) return '-';
  
  // Formatiere das Datum
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Hilfsfunktion zum Formatieren von Währungsbeträgen
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

// Hilfsfunktion zum Dekodieren von HTML-Entitäten
export function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}