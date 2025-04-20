import { z } from "zod";

// Valid status enums
export const PaymentStatus = {
  pending: "pending",
  paid: "paid",
  failed: "failed",
} as const;

export const BookingStatus = {
  ACTIVE: "active",
  PENDING: "pending",
  CANCELLED: "cancelled",
} as const;

// Zod schemas for validation
export const paymentStatusSchema = z.enum([
  PaymentStatus.pending,
  PaymentStatus.paid,
  PaymentStatus.failed,
]);

export const bookingStatusSchema = z.enum([
  BookingStatus.ACTIVE,
  BookingStatus.PENDING,
  BookingStatus.CANCELLED,
]);

// Type definitions
export type PaymentStatusType = z.infer<typeof paymentStatusSchema>;
export type BookingStatusType = z.infer<typeof bookingStatusSchema>;

// Utility functions
export const isValidPaymentStatus = (status: string): status is PaymentStatusType => {
  return paymentStatusSchema.safeParse(status).success;
};

export const isValidBookingStatus = (status: string): status is BookingStatusType => {
  return bookingStatusSchema.safeParse(status).success;
};

export const getDefaultPaymentStatus = (): PaymentStatusType => {
  return PaymentStatus.pending;
};

export const getDefaultBookingStatus = (): BookingStatusType => {
  return BookingStatus.PENDING;
};

// Helper function to validate both statuses at once
export const validateBookingStatuses = (
  paymentStatus: string,
  bookingStatus: string
): {
  isValid: boolean;
  paymentStatus?: PaymentStatusType;
  bookingStatus?: BookingStatusType;
  errors?: string[];
} => {
  const errors: string[] = [];
  const paymentResult = paymentStatusSchema.safeParse(paymentStatus);
  const bookingResult = bookingStatusSchema.safeParse(bookingStatus);

  if (!paymentResult.success) {
    errors.push(`Invalid payment status: ${paymentStatus}. Must be one of: ${Object.values(PaymentStatus).join(", ")}`);
  }

  if (!bookingResult.success) {
    errors.push(`Invalid booking status: ${bookingStatus}. Must be one of: ${Object.values(BookingStatus).join(", ")}`);
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    paymentStatus: paymentResult.data,
    bookingStatus: bookingResult.data,
  };
}; 