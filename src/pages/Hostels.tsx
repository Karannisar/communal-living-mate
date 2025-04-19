
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MainNavbar } from "@/components/layout/MainNavbar";
import { useToast } from "@/hooks/use-toast";
import { 
  Building, 
  Loader2, 
  MapPin, 
  BedDouble, 
  Wifi, 
  Utensils,
  Search,
  Star
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Hostel {
  id: string;
  name: string;
  size: string;
  location_tier: string;
  address: string;
  city: string;
  description: string;
  price_range_min: number;
  price_range_max: number;
  is_verified: boolean;
  amenities: string[];
  rating: number;
  total_reviews: number;
  images: string[];
  created_at: string;
}

const HostelsPage = () => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [filteredHostels, setFilteredHostels] = useState<Hostel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [locationTier, setLocationTier] = useState<string>("all");
  
  const { toast } = useToast();

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, this would fetch from the hostels table
        // For now, we'll create some sample data
        const mockHostels: Hostel[] = [
          {
            id: "1",
            name: "University Heights Hostel",
            size: "large",
            location_tier: "tier_1",
            address: "123 University Ave",
            city: "Boston",
            description: "A premier hostel located minutes from major universities. Featuring modern amenities, study spaces, and a vibrant community.",
            price_range_min: 800,
            price_range_max: 1500,
            is_verified: true,
            amenities: ["WiFi", "Gym", "Laundry", "Study Rooms", "Cafeteria"],
            rating: 4.7,
            total_reviews: 128,
            images: ["/placeholder.svg"],
            created_at: new Date().toISOString()
          },
          {
            id: "2",
            name: "Student Square Residences",
            size: "medium",
            location_tier: "tier_2",
            address: "456 College St",
            city: "New York",
            description: "Affordable student housing with all essential amenities. Conveniently located near public transportation and shopping centers.",
            price_range_min: 600,
            price_range_max: 1100,
            is_verified: true,
            amenities: ["WiFi", "Laundry", "Common Room", "Security"],
            rating: 4.2,
            total_reviews: 95,
            images: ["/placeholder.svg"],
            created_at: new Date().toISOString()
          },
          {
            id: "3",
            name: "Campus Corner Hostel",
            size: "small",
            location_tier: "tier_3",
            address: "789 Student Lane",
            city: "Chicago",
            description: "A cozy hostel offering a homely environment for students. Close to multiple educational institutions.",
            price_range_min: 450,
            price_range_max: 800,
            is_verified: true,
            amenities: ["WiFi", "Shared Kitchen", "Parking"],
            rating: 3.9,
            total_reviews: 62,
            images: ["/placeholder.svg"],
            created_at: new Date().toISOString()
          },
          {
            id: "4",
            name: "Scholars Inn",
            size: "medium",
            location_tier: "tier_1",
            address: "101 Academic Blvd",
            city: "San Francisco",
            description: "Luxury student accommodation with premium facilities. Features private rooms, gourmet dining options, and recreational areas.",
            price_range_min: 1000,
            price_range_max: 1800,
            is_verified: true,
            amenities: ["WiFi", "Gym", "Pool", "Private Bathrooms", "Restaurant", "Study Rooms"],
            rating: 4.8,
            total_reviews: 156,
            images: ["/placeholder.svg"],
            created_at: new Date().toISOString()
          },
          {
            id: "5",
            name: "Budget Student Living",
            size: "large",
            location_tier: "tier_3",
            address: "202 Economy St",
            city: "Austin",
            description: "No-frills accommodation for students on a budget. Clean, simple, and functional living spaces.",
            price_range_min: 350,
            price_range_max: 650,
            is_verified: true,
            amenities: ["WiFi", "Shared Bathrooms", "Common Kitchen"],
            rating: 3.5,
            total_reviews: 87,
            images: ["/placeholder.svg"],
            created_at: new Date().toISOString()
          }
        ];
        
        setHostels(mockHostels);
        setFilteredHostels(mockHostels);
      } catch (error) {
        console.error("Error fetching hostels:", error);
        toast({
          title: "Error",
          description: "Failed to load hostel listings",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHostels();
  }, [toast]);

  // Apply filters
  useEffect(() => {
    let result = [...hostels];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        hostel => 
          hostel.name.toLowerCase().includes(query) ||
          hostel.city.toLowerCase().includes(query) ||
          hostel.description.toLowerCase().includes(query)
      );
    }
    
    // Apply price filter
    if (priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(Number);
      result = result.filter(
        hostel => 
          (hostel.price_range_min <= max && hostel.price_range_max >= min)
      );
    }
    
    // Apply location tier filter
    if (locationTier !== "all") {
      result = result.filter(hostel => hostel.location_tier === locationTier);
    }
    
    setFilteredHostels(result);
  }, [hostels, searchQuery, priceRange, locationTier]);

  // Function to get appropriate badge color based on location tier
  const getLocationBadgeStyle = (tier: string) => {
    switch (tier) {
      case "tier_1":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
      case "tier_2":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
      case "tier_3":
        return "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100";
      default:
        return "";
    }
  };

  // Function to get formatted location tier name
  const getLocationTierName = (tier: string) => {
    switch (tier) {
      case "tier_1":
        return "Premium Location";
      case "tier_2":
        return "Good Location";
      case "tier_3":
        return "Standard Location";
      default:
        return tier;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNavbar />
      
      <div className="container pt-24 pb-16">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Find Your Perfect Hostel</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse through our curated list of student accommodations and find a place that feels like home
          </p>
        </div>
        
        {/* Filters */}
        <div className="mb-10 rounded-lg border p-4 bg-card">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search hostels by name, city or description"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="0-500">$0 - $500</SelectItem>
                  <SelectItem value="500-1000">$500 - $1000</SelectItem>
                  <SelectItem value="1000-1500">$1000 - $1500</SelectItem>
                  <SelectItem value="1500-2000">$1500+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={locationTier} onValueChange={setLocationTier}>
                <SelectTrigger>
                  <SelectValue placeholder="Location Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="tier_1">Premium Locations</SelectItem>
                  <SelectItem value="tier_2">Good Locations</SelectItem>
                  <SelectItem value="tier_3">Standard Locations</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Results count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredHostels.length} {filteredHostels.length === 1 ? 'hostel' : 'hostels'}
          </p>
        </div>
        
        {/* Hostel listings */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading hostels...</span>
          </div>
        ) : filteredHostels.length === 0 ? (
          <div className="text-center py-20">
            <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No hostels found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHostels.map((hostel) => (
              <Card key={hostel.id} className="overflow-hidden hover-lift transition-all duration-300">
                <div className="relative h-48 bg-muted">
                  <img 
                    src={hostel.images[0]} 
                    alt={hostel.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="font-medium">
                      ${hostel.price_range_min} - ${hostel.price_range_max}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{hostel.name}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        {hostel.city}
                      </CardDescription>
                    </div>
                    <div className="flex items-center bg-primary/10 rounded-md px-2 py-1">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary mr-1" />
                      <span className="text-sm font-medium">{hostel.rating}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <Badge className={getLocationBadgeStyle(hostel.location_tier)}>
                    {getLocationTierName(hostel.location_tier)}
                  </Badge>
                  
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                    {hostel.description}
                  </p>
                  
                  <div className="mt-4 flex flex-wrap gap-1">
                    {hostel.amenities.slice(0, 3).map((amenity, index) => (
                      <Badge key={index} variant="outline" className="font-normal">
                        {amenity === "WiFi" && <Wifi className="h-3 w-3 mr-1" />}
                        {amenity === "Gym" && <Building className="h-3 w-3 mr-1" />}
                        {amenity === "Cafeteria" && <Utensils className="h-3 w-3 mr-1" />}
                        {amenity}
                      </Badge>
                    ))}
                    {hostel.amenities.length > 3 && (
                      <Badge variant="outline" className="font-normal">
                        +{hostel.amenities.length - 3} more
                      </Badge>
                    )}
                  </div>
                </CardContent>
                
                <Separator className="my-2" />
                
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link to={`/hostels/${hostel.id}`}>
                      View Details
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HostelsPage;
