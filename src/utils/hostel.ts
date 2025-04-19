
import { z } from "zod";

// Valid hostel size options
export const HostelSize = {
  SMALL: "small", // Up to 50 rooms
  MEDIUM: "medium", // 51-100 rooms
  LARGE: "large", // 101+ rooms
} as const;

// Valid location tiers (affecting pricing)
export const LocationTier = {
  TIER_1: "tier_1", // Premium locations (city center, near universities)
  TIER_2: "tier_2", // Good locations (good transport links)
  TIER_3: "tier_3", // Standard locations
} as const;

// Zod schemas for validation
export const hostelSizeSchema = z.enum([
  HostelSize.SMALL,
  HostelSize.MEDIUM,
  HostelSize.LARGE,
]);

export const locationTierSchema = z.enum([
  LocationTier.TIER_1,
  LocationTier.TIER_2,
  LocationTier.TIER_3,
]);

export const hostelSchema = z.object({
  name: z.string().min(3, "Hostel name must be at least 3 characters"),
  size: hostelSizeSchema,
  location: locationTierSchema,
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  description: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
});

// Type definitions
export type HostelSizeType = z.infer<typeof hostelSizeSchema>;
export type LocationTierType = z.infer<typeof locationTierSchema>;
export type HostelType = z.infer<typeof hostelSchema>;

// Commission rates based on hostel size and location
export const getCommissionRate = (size: HostelSizeType, location: LocationTierType): number => {
  const baseRate = 0.1; // 10% base commission
  
  // Size adjustments
  const sizeAdjustment = 
    size === HostelSize.SMALL ? 0.02 :  // Small hostels pay 2% more
    size === HostelSize.MEDIUM ? 0 :    // Medium hostels pay base rate
    -0.01;                              // Large hostels get 1% discount
  
  // Location adjustments
  const locationAdjustment = 
    location === LocationTier.TIER_1 ? 0.02 :  // Tier 1 locations pay 2% more
    location === LocationTier.TIER_2 ? 0 :     // Tier 2 locations pay base rate
    -0.01;                                    // Tier 3 locations get 1% discount
  
  return Math.max(0.05, baseRate + sizeAdjustment + locationAdjustment); // Minimum 5% commission
};

// Student discount
export const STUDENT_DISCOUNT = 0.05; // 5% discount for students
