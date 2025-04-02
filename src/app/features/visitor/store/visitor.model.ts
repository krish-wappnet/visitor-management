export interface Visitor {
    id: string;
    name: string;
    phone: string;
    purpose: string;
    checkIn: Date;
    checkOut?: Date; // Optional for check-out time
    email?: string;
  }
  