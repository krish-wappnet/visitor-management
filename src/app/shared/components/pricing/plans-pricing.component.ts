import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-plans-pricing',
  standalone: false,
  templateUrl: './plans-pricing.component.html',
  styleUrls: ['./plans-pricing.component.css'],
})
export class PlansPricingComponent {
  constructor(private router: Router) {}

  contactUs() {
    // Navigate to a contact page or open an email client
    // For now, we'll just log it; replace with your preferred action
    console.log('Contact Us clicked for Corporate tier');
    // Example: this.router.navigate(['/contact']);
    // Or open email: window.location.href = 'mailto:sales@yourdomain.com?subject=Corporate Plan Inquiry';
  }
}