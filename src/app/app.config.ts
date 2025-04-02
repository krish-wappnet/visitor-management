import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { visitorReducer } from './features/visitor/store/visitor.reducer';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';
import { provideAuth } from '@angular/fire/auth';
import { getAuth } from 'firebase/auth';
import { provideAnimations } from '@angular/platform-browser/animations'; // Import this
import { provideToastr } from 'ngx-toastr'; // Import Toastr
import { authReducer } from './features/auth/store/auth.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideStore({ visitors: visitorReducer }),
    provideEffects(),
    provideStore({ auth: authReducer }),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideAuth(() => getAuth()),
    provideAnimations(), // Add this to enable animations
    provideToastr(), // Configure Toastr
  ],
};