import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, from, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, User as FirebaseUser } from 'firebase/auth';
import { firebaseConfig } from '../../../environments/firebase.config';

import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = `${environment.backendUrl}/auth`;
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;
  private auth: any;

  constructor(private http: HttpClient) {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    this.auth = getAuth(app);

    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser') || 'null'));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<any> {
    // 1. Login with Firebase
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(async (userCredential) => {
        // 2. Get ID Token
        const token = await userCredential.user.getIdToken();
        return token;
      }),
      switchMap((idToken) => {
        // 3. Send Token to Backend to get User Data & Session
        return this.http.post<any>(`${this.api}/firebase-login`, { token: idToken });
      }),
      map(user => {
        // 4. Store User Details (from Backend)
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        return user;
      }),
      catchError(error => {
        console.error('Login failed:', error);
        throw error;
      })
    );
  }

  loginWithGoogle(): Observable<any> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.auth, provider)).pipe(
      switchMap(async (userCredential) => {
        const token = await userCredential.user.getIdToken();
        return token;
      }),
      switchMap((idToken) => {
        return this.http.post<any>(`${this.api}/firebase-login`, { token: idToken });
      }),
      map(user => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        return user;
      }),
      catchError(error => {
        console.error('Google Login failed:', error);
        throw error;
      })
    );
  }

  register(payload: any): Observable<any> {
    // For now, keep using the backend register, or switch to Firebase createUserWithEmailAndPassword
    // The user wants "Admin to create users", so this public register might be disabled or restricted.
    // For now, let's keep it as is, but we might need to update it later.
    return this.http.post<any>(`${this.api}/register`, payload);
  }

  logout() {
    // Sign out from Firebase
    signOut(this.auth).then(() => {
      // Remove user from local storage
      localStorage.removeItem('currentUser');
      this.currentUserSubject.next(null);
    });
  }
}
