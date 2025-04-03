// src/app/features/visitor/visitor.model.ts
export interface Visitor {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  checkIn: Date;
  stayDuration: number; // Duration in hours
  checkOutTime?: Date;  // Expected checkout time (renamed from checkOut for clarity)
  checkOut?: Date;      // Actual checkout time (keep this for manual checkout if needed)
  email?: string;
  isCheckedIn: boolean; // Tracks active status
}