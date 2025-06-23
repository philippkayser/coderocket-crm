import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, RefreshCw, Search, LayoutGrid, List } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface OrderFilterProps {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  onSortChange: (value: string) => void;
  onRefresh: () => void;
  totalOrders: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: () => void;
}

export function OrderFilter({ 
  sortBy, 
  sortDirection, 
  onSortChange, 
  onRefresh, 
  totalOrders,
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange
}: OrderFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center">
        <p className="text-sm font-medium mr-2">
          {totalOrders} {totalOrders === 1 ? 'Auftrag' : 'Aufträge'} gefunden
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Aufträge durchsuchen..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sortieren nach" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Datum</SelectItem>
              <SelectItem value="title">Titel</SelectItem>
              <SelectItem value="jobNumber">Auftragsnummer</SelectItem>
              <SelectItem value="customer">Kunde</SelectItem>
              <SelectItem value="price">Preis</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => onSortChange(sortBy)}
            className="h-10 w-10"
            title={sortDirection === 'asc' ? 'Absteigend sortieren' : 'Aufsteigend sortieren'}
          >
            <ArrowUpDown className={`h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
          </Button>
          
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => {
            if (value) onViewModeChange();
          }}>
            <ToggleGroupItem value="grid" aria-label="Grid View" title="Kartenansicht">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Table View" title="Tabellenansicht">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            className="h-10 w-10"
            title="Aktualisieren"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}