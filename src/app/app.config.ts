import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { visitorReducer } from './features/visitor/store/visitor.reducer';


import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), 
  provideRouter(routes), 
  provideStore({ visitor: visitorReducer }), 
  provideEffects(), 
  provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
  provideStore(() => getFirestore()),
  provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() })]
};
function provideFirebaseApp(arg0: () => any): import("@angular/core").Provider | import("@angular/core").EnvironmentProviders {
  throw new Error('Function not implemented.');
}

function initializeApp(firebaseConfig: any) {
  throw new Error('Function not implemented.');
}

function getFirestore() {
  throw new Error('Function not implemented.');
}

