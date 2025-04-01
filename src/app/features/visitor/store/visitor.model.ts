export interface Visitor {
    id: string;
    name: string;
    phone: string;
    purpose: string;
    checkIn: string;
    checkOut?: string; // Optional for check-out time
  }
  