import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';
import { Visitor } from '../app/features/visitor/store/visitor.model';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  async addVisitor(visitor: Visitor): Promise<void> {
    const { error } = await this.supabase
      .from('visitors')
      .insert({
        id: visitor.id,
        name: visitor.name,
        phone: visitor.phone,
        purpose: visitor.purpose,
        email: visitor.email,
        check_in: visitor.checkIn.toISOString(),
      });

    if (error) {
      throw new Error(error.message);
    }
  }

  async getVisitorsByEmail(email: string): Promise<Visitor[]> {
    const { data, error } = await this.supabase
      .from('visitors')
      .select('*')
      .eq('email', email);

    if (error) {
      throw new Error(error.message);
    }

    return data.map((v: any) => ({
      id: v.id,
      name: v.name,
      phone: v.phone,
      purpose: v.purpose,
      email: v.email,
      checkIn: new Date(v.check_in),
      checkOut: v.check_out ? new Date(v.check_out) : undefined,
    }));
  }
}