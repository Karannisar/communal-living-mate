
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Logo } from "../Logo";
import { ThemeSwitcher } from "../ThemeSwitcher";
import { Button } from "../ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "../ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Building, Home, LogIn, Search, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function MainNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const location = useLocation();

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check auth status
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        setIsLoggedIn(true);
        
        // Get user role
        const { data: userData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.session.user.id)
          .single();
          
        if (userData && !error) {
          setUserRole(userData.role);
        }
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, _) => {
        if (event === 'SIGNED_IN') {
          checkAuth();
        } else if (event === 'SIGNED_OUT') {
          setIsLoggedIn(false);
          setUserRole(null);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Get dashboard URL based on user role
  const getDashboardUrl = () => {
    switch (userRole) {
      case "admin":
        return "/admin";
      case "student":
        return "/student";
      case "hostel":
        return "/hostel";
      default:
        return "/auth";
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 py-3",
        isScrolled 
          ? "bg-background/95 backdrop-blur-sm border-b shadow-sm" 
          : "bg-transparent"
      )}
    >
      <div className="container flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Logo size={32} />
          <span className="font-bold text-xl">DormMate</span>
        </Link>

        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/">
                <NavigationMenuLink 
                  className={navigationMenuTriggerStyle()}
                  active={location.pathname === "/"}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <Link to="/hostels">
                <NavigationMenuLink 
                  className={navigationMenuTriggerStyle()}
                  active={location.pathname === "/hostels"}
                >
                  <Building className="mr-2 h-4 w-4" />
                  Hostels
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                <Search className="mr-2 h-4 w-4" />
                Explore
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[300px] gap-2 p-4">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link 
                        to="/hostels?filter=near-university"
                        className="block p-2 hover:bg-accent rounded-md"
                      >
                        Near Universities
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link 
                        to="/hostels?filter=budget-friendly"
                        className="block p-2 hover:bg-accent rounded-md"
                      >
                        Budget Friendly
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link 
                        to="/hostels?filter=premium"
                        className="block p-2 hover:bg-accent rounded-md"
                      >
                        Premium
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          
          {isLoggedIn ? (
            <>
              {userRole === "hostel" && (
                <Button variant="outline" className="hidden sm:flex">
                  <Link to="/hostel/register" className="flex items-center gap-1">
                    <Building className="h-4 w-4 mr-1" />
                    Manage Hostel
                  </Link>
                </Button>
              )}
              
              <Button>
                <Link to={getDashboardUrl()} className="flex items-center gap-1">
                  <User className="h-4 w-4 mr-1" />
                  Dashboard
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="hidden sm:flex">
                <Link to="/hostel/register" className="flex items-center gap-1">
                  <Building className="h-4 w-4 mr-1" />
                  Register Hostel
                </Link>
              </Button>
              
              <Button>
                <Link to="/auth" className="flex items-center gap-1">
                  <LogIn className="h-4 w-4 mr-1" />
                  Login
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
