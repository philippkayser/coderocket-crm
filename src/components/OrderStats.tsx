import { Order } from '@/types/order';

interface OrderStatsProps {
  orders: Order[];
}

export function OrderStats({ orders }: OrderStatsProps) {
  // Aktuelle Zeit für Vergleiche
  const now = Date.now();
  
  // Hilfsfunktion zum Konvertieren von Datumswerten in Timestamps
  const toTimestamp = (dateValue: string | number | null): number => {
    if (dateValue === null) return 0;
    if (typeof dateValue === 'number') return dateValue;
    return new Date(dateValue).getTime();
  };

  // Zähle aktive Aufträge (Status ist nicht 'completed' oder 'cancelled')
  const activeOrders = orders.filter(order => 
    !['completed', 'cancelled'].includes(order.status)
  );
  
  // Zähle überfällige Aufträge (Enddatum ist in der Vergangenheit und Status ist nicht 'completed' oder 'cancelled')
  const overdueOrders = orders.filter(order => 
    toTimestamp(order.endDate) < now && 
    !['completed', 'cancelled'].includes(order.status)
  );
  
  // Zähle bevorstehende Aufträge (Startdatum ist in der Zukunft)
  const upcomingOrders = orders.filter(order => 
    toTimestamp(order.startDate) > now && 
    (order.status === 'new' || order.status === 'open')
  );
  
  // Zähle abgeschlossene Aufträge
  const completedOrders = orders.filter(order => 
    order.status === 'completed'
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard title="Aktive Aufträge" value={activeOrders.length} />
      <StatCard title="Überfällige Aufträge" value={overdueOrders.length} variant="warning" />
      <StatCard title="Bevorstehende Aufträge" value={upcomingOrders.length} variant="info" />
      <StatCard title="Abgeschlossene Aufträge" value={completedOrders.length} variant="success" />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  variant?: 'default' | 'warning' | 'success' | 'info';
}

function StatCard({ title, value, variant = 'default' }: StatCardProps) {
  const getVariantClass = () => {
    switch (variant) {
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return 'bg-white border-gray-200 text-gray-700';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getVariantClass()}`}>
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}