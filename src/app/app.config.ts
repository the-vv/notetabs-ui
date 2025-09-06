import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { routes } from './app.routes';

const firebaseConfig = {
  apiKey: "AIzaSyBqxIRR5DGUwuN4CJVnSrcN-lbFTq8b2lc",
  authDomain: "notetabs-vv.firebaseapp.com",
  projectId: "notetabs-vv",
  storageBucket: "notetabs-vv.appspot.com",
  messagingSenderId: "292633682305",
  appId: "1:292633682305:web:489118e1dbf53c022c8880"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
  ]
};
