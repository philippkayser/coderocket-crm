import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Search, LayoutGrid, List } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface CustomerFilterProps {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  onSortChange: (value: string) => void;
  totalCustomers: number;
  onRefresh: () => void;
  searchTerm: string;
  onSearchChange: Dispatch<SetStateAction<string>>;
  viewMode: 'grid' | 'table';
  onViewModeChange: () => void;
}

export function CustomerFilter({ 
  sortBy, 
  sortDirection, 
  onSortChange, 
  totalCustomers, 
  onRefresh,
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange
}: CustomerFilterProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Kunden suchen..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sortieren nach" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="customerNumber">Kundennummer</SelectItem>
            <SelectItem value="city">Stadt</SelectItem>
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => onSortChange(sortBy)}
          title={sortDirection === 'asc' ? 'Absteigend sortieren' : 'Aufsteigend sortieren'}
        >
          {sortDirection === 'asc' ? '↑' : '↓'}
        </Button>
      </div>
      
      <div className="flex items-center gap-2 justify-between sm:justify-end">
        <div className="text-sm text-muted-foreground">
          {totalCustomers} {totalCustomers === 1 ? 'Kunde' : 'Kunden'}
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={onViewModeChange}
          title={viewMode === 'grid' ? 'Tabellenansicht' : 'Kachelansicht'}
        >
          {viewMode === 'grid' ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          title="Aktualisieren"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}