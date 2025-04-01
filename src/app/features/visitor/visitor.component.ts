import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store'; // Remove unused 'select' import
import { Observable } from 'rxjs';
import { Visitor } from './store/visitor.model';
import { VisitorService } from './store/visitor.service';
import { checkInVisitor, checkOutVisitor } from './store/visitor.actions'; // Use correct actions
import { selectAllVisitors } from './store/visitor.selectors'; // Correct selector
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-visitor',
  standalone: true, // Add this since imports are specified
  imports: [CommonModule],
  templateUrl: './visitor.component.html',
  styleUrls: ['./visitor.component.css'],
})
export class VisitorComponent implements OnInit {
  visitors$: Observable<Visitor[]>;

  constructor(private visitorService: VisitorService, private store: Store) {
    // Use the selector to get visitors from the store
    this.visitors$ = this.store.pipe(select(selectAllVisitors));
  }

  ngOnInit(): void {
    this.visitorService.getVisitors().subscribe(); // Fetch visitors from Firebase
  }

  addVisitor() {
    const newVisitor: Visitor = {
      id: Date.now().toString(),
      name: 'John Doe',
      phone: '1234567890',
      purpose: 'Meeting',
      checkIn: new Date(), // Use Date object to match your model
    };

    this.visitorService.addVisitor(newVisitor); // Add visitor to Firestore (service will dispatch checkInVisitor)
  }

  removeVisitor(visitorId: string) {
    this.visitorService.removeVisitor(visitorId); // Remove visitor from Firestore (service will dispatch checkOutVisitor)
  }
}