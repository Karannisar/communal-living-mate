import { z } from "zod";
import { PaymentStatus, PaymentStatusType, paymentStatusSchema } from "./booking";

// Valid meal types
export const MealType = {
  BREAKFAST: "breakfast",
  LUNCH: "lunch",
  DINNER: "dinner",
} as const;

// Zod schema for meal type validation
export const mealTypeSchema = z.enum([
  MealType.BREAKFAST,
  MealType.LUNCH,
  MealType.DINNER,
]);

// Type definition
export type MealTypeType = z.infer<typeof mealTypeSchema>;

// Utility functions
export const isValidMealType = (type: string): type is MealTypeType => {
  return mealTypeSchema.safeParse(type).success;
};

// Helper function to validate mess booking data
export const validateMessBooking = (
  mealType: string,
  bookingDate: Date,
  paymentStatus: string
): {
  isValid: boolean;
  mealType?: MealTypeType;
  bookingDate?: Date;
  paymentStatus?: PaymentStatusType;
  errors?: string[];
} => {
  const errors: string[] = [];
  const mealTypeResult = mealTypeSchema.safeParse(mealType);
  const paymentResult = paymentStatusSchema.safeParse(paymentStatus);

  if (!mealTypeResult.success) {
    errors.push(`Invalid meal type: ${mealType}. Must be one of: ${Object.values(MealType).join(", ")}`);
  }

  if (!bookingDate || isNaN(bookingDate.getTime())) {
    errors.push("Invalid booking date");
  }

  if (!paymentResult.success) {
    errors.push(`Invalid payment status: ${paymentStatus}. Must be one of: ${Object.values(PaymentStatus).join(", ")}`);
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    mealType: mealTypeResult.data,
    bookingDate,
    paymentStatus: paymentResult.data,
  };
};

// Helper function to check if a booking time is valid for a meal type
export const isValidBookingTime = (mealType: MealTypeType, bookingDate: Date): boolean => {
  const currentDate = new Date();
  const bookingTime = bookingDate.getTime();
  const currentTime = currentDate.getTime();

  // Don't allow bookings for past dates
  if (bookingTime < currentTime) {
    return false;
  }

  const hours = bookingDate.getHours();
  
  switch (mealType) {
    case MealType.BREAKFAST:
      // Allow booking breakfast until 8 PM the previous day
      return hours <= 20;
    case MealType.LUNCH:
      // Allow booking lunch until 9 AM the same day
      return hours <= 9;
    case MealType.DINNER:
      // Allow booking dinner until 3 PM the same day
      return hours <= 15;
    default:
      return false;
  }
}; 