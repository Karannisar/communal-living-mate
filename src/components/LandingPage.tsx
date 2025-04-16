
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BedDouble, CheckCircle, ChevronRight, Clock, MapPin, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 -z-10"></div>
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="flex flex-col space-y-4 animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
                Your Perfect Student Home Awaits
              </h1>
              <p className="text-xl text-muted-foreground md:max-w-[500px]">
                Safe, comfortable, and affordable dormitory living for students with all the amenities you need.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Link to="/auth">
                  <Button size="lg" className="gap-2">
                    Book Now <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden shadow-xl animate-slide-up">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-accent/20 mix-blend-overlay z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80" 
                alt="Dormitory Exterior" 
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="container px-4 md:px-6 mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Dormitory?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover-scale">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <BedDouble className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Comfortable Rooms</h3>
                  <p className="text-muted-foreground">
                    Well-furnished rooms with all essential amenities for a comfortable stay.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="hover-scale">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">24/7 Security</h3>
                  <p className="text-muted-foreground">
                    Round-the-clock security measures to ensure your safety.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="hover-scale">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <MapPin className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Prime Location</h3>
                  <p className="text-muted-foreground">
                    Conveniently located near universities, shops, and transportation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="py-16">
        <div className="container px-4 md:px-6 mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Amenities & Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              "High-Speed WiFi", "AC Rooms", "Clean Bathrooms", "Study Areas",
              "Laundry Service", "Mess Facility", "Gym Access", "Recreation Room"
            ].map((amenity, index) => (
              <div key={index} className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent hover:border-accent transition-colors">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary/5">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Ready to Book Your Stay?</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Sign up now to book your room and join our community of students.
            </p>
            <Link to="/auth">
              <Button size="lg" className="mt-4">
                Sign Up & Book Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © 2025 DormMate. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">Terms</Button>
              <Button variant="ghost" size="sm">Privacy</Button>
              <Button variant="ghost" size="sm">Contact</Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
