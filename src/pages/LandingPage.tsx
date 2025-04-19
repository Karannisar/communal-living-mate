
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MainNavbar } from "@/components/layout/MainNavbar";
import {
  Building,
  CheckCircle,
  ChevronRight,
  MapPin,
  Search,
  Shield,
  Star,
  User,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const LandingPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  
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
  }, []);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggered = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const testimonials = [
    {
      name: "Alex Johnson",
      role: "Computer Science Student",
      image: "/placeholder.svg",
      text: "DormMate made it incredibly easy to find a hostel close to my university. The transparent pricing and ratings helped me make an informed decision."
    },
    {
      name: "Sarah Chen",
      role: "Business Major",
      image: "/placeholder.svg",
      text: "As an international student, I was worried about finding accommodation. DormMate simplified the entire process and I found a great place within my budget."
    },
    {
      name: "Michael Torres",
      role: "Engineering Student",
      image: "/placeholder.svg",
      text: "The detailed hostel descriptions and amenity lists helped me find exactly what I needed. I'm now in a hostel with a great study environment."
    }
  ];

  const features = [
    {
      icon: <Search className="h-6 w-6" />,
      title: "Easy Search",
      description: "Find hostels based on location, budget, and amenities"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Verified Listings",
      description: "All hostels are verified for safety and quality standards"
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Real Reviews",
      description: "Authentic reviews from students who've stayed there"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Community",
      description: "Connect with potential roommates before booking"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <MainNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="text-center lg:text-left"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <Badge variant="outline" className="mb-4 py-1.5 px-4 text-sm">
                <Star className="h-3.5 w-3.5 mr-2 fill-primary text-primary" />
                The #1 platform for student accommodation
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Find Your Perfect <span className="text-primary">Student Hostel</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
                Browse through thousands of verified hostels near colleges and universities across the country. Find safe, affordable accommodation that feels like home.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" asChild>
                  <Link to="/hostels" className="gap-2">
                    Browse Hostels
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
                
                {isLoggedIn ? (
                  <Button size="lg" variant="outline" asChild>
                    <Link to={userRole === "student" ? "/student" : "/auth"} className="gap-2">
                      {userRole === "student" ? "My Dashboard" : "Sign In"}
                      <User className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/auth" className="gap-2">
                      Sign Up Free
                      <User className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
              
              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6">
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-primary mr-2" />
                  <span>1,000+ Verified Hostels</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-primary mr-2" />
                  <span>50,000+ Happy Students</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-primary mr-2" />
                  <span>100+ Cities Covered</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="bg-gradient-to-tr from-primary/20 to-transparent rounded-2xl p-1">
                <div className="bg-card rounded-xl overflow-hidden shadow-xl">
                  <img 
                    src="/placeholder.svg" 
                    alt="Student Hostel" 
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold">University Heights Hostel</h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          Boston, MA
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                        Premium
                      </Badge>
                    </div>
                    
                    <div className="flex items-center mb-4">
                      <div className="flex items-center mr-4">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </div>
                      <span className="text-sm font-medium">5.0 (128 reviews)</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <div>
                        <span className="text-lg font-bold">$800 - $1500</span>
                        <span className="text-sm text-muted-foreground"> / month</span>
                      </div>
                      <Button size="sm">View Details</Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating card decoration */}
              <div className="absolute -bottom-10 -left-10 w-48 h-24 bg-card rounded-lg shadow-lg p-3 hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Building className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Student Discount</div>
                    <div className="font-bold">Save 5%</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Search Bar */}
      <section className="py-8">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="bg-card shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-center">Find Your Ideal Hostel</h2>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="City, college or university"
                    className="pl-10"
                  />
                </div>
                <Button className="md:w-auto">Search</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-accent/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose DormMate?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We simplify your hostel search with verified listings, real reviews, and transparent pricing
            </p>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggered}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeIn}>
                <Card className="h-full hover-lift">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <div className="text-primary">{feature.icon}</div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* For Hostels Section */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <img 
                src="/placeholder.svg" 
                alt="Hostel Management" 
                className="rounded-lg shadow-lg"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <Badge variant="outline" className="mb-4">FOR HOSTEL OWNERS</Badge>
              <h2 className="text-3xl font-bold mb-6">
                Grow Your Business With Our Platform
              </h2>
              <p className="text-muted-foreground mb-6">
                Join our network of hostels and reach thousands of potential residents. Our platform offers easy management, increased visibility, and a steady stream of bookings.
              </p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <span className="font-medium">Easy Registration</span>
                    <p className="text-sm text-muted-foreground">
                      Simple onboarding process with custom admin panel
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <span className="font-medium">Increased Visibility</span>
                    <p className="text-sm text-muted-foreground">
                      Get your hostel in front of thousands of students
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <span className="font-medium">Booking Management</span>
                    <p className="text-sm text-muted-foreground">
                      Streamlined booking process and resident management
                    </p>
                  </div>
                </li>
              </ul>
              
              <Button asChild>
                <Link to="/hostel/register">Register Your Hostel</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16 bg-accent/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Students Say About Us</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hear from students who found their perfect accommodation through DormMate
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <Card className="h-full hover-lift">
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                        <img 
                          src={testimonial.image} 
                          alt={testimonial.name}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <h4 className="font-bold">{testimonial.name}</h4>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="italic">"{testimonial.text}"</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Find Your Perfect Hostel?
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Join thousands of students who have found their ideal accommodation through DormMate
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/hostels">Browse Hostels</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth">
                  {isLoggedIn ? "Go to Dashboard" : "Sign Up Free"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-md flex items-center justify-center font-bold">
                  DM
                </div>
                <span className="font-bold text-lg">DormMate</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                The leading platform for student accommodation
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">For Students</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/hostels" className="text-muted-foreground hover:text-foreground">Browse Hostels</Link></li>
                <li><Link to="/auth" className="text-muted-foreground hover:text-foreground">Student Login</Link></li>
                <li><Link to="/faq" className="text-muted-foreground hover:text-foreground">FAQs</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">For Hostels</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/hostel/register" className="text-muted-foreground hover:text-foreground">Register Hostel</Link></li>
                <li><Link to="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link></li>
                <li><Link to="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="text-muted-foreground">support@dormmate.com</li>
                <li className="text-muted-foreground">+1 (555) 123-4567</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} DormMate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
