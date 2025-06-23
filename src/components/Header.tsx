import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";
import { Bell, Plus, Users, ClipboardList, LogOut, User as UserIcon } from "lucide-react";
import { User } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: User | null;
  onLogout: () => void;
}

export function Header({ activeTab, onTabChange, user, onLogout }: HeaderProps) {
  const handleLogout = () => {
    onLogout();
  };

  // Initialen für Avatar erstellen
  const getInitials = () => {
    if (!user?.name) return user?.sub?.substring(0, 2).toUpperCase() || 'U';
    
    const nameParts = user.name.split(' ');
    if (nameParts.length === 1) return nameParts[0].substring(0, 2).toUpperCase();
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <h2 className="text-xl font-bold">Auftragsverwaltung</h2>
          <nav className="hidden md:flex items-center gap-6">
            <a 
              href="#" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                activeTab === "orders" ? "text-primary" : "text-muted-foreground"
              }`}
              onClick={(e) => {
                e.preventDefault();
                onTabChange("orders");
              }}
            >
              <span className="flex items-center gap-1">
                <ClipboardList className="h-4 w-4" />
                Aufträge
              </span>
            </a>
            <a 
              href="#" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                activeTab === "customers" ? "text-primary" : "text-muted-foreground"
              }`}
              onClick={(e) => {
                e.preventDefault();
                onTabChange("customers");
              }}
            >
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Kunden
              </span>
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              3
            </span>
          </Button>
          
          <Button className="hidden sm:flex items-center gap-1">
            <Plus className="h-4 w-4" />
            {activeTab === "customers" ? "Neuer Kunde" : "Neuer Auftrag"}
          </Button>
          
          <ModeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || user?.sub}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Abmelden</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}