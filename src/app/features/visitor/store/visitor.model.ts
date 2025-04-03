// src/app/features/visitor/store/visitor.model.ts
export interface Visitor {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  checkIn: Date;
  stayDuration: number; // Duration in hours
  checkOutTime?: Date;  // Expected checkout time
  checkOut?: Date;      // Actual checkout time
  email?: string;
  isCheckedIn: boolean; // Tracks active status
  paymentId?: string;   // Stripe/Razorpay payment ID
  paymentStatus: 'pending' | 'completed' | 'failed'; // Payment state
}