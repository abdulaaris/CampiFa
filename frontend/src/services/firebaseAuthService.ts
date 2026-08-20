import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../config/firebase';
import { User } from '../types';

export const firebaseAuthService = {
  isConfigured: () => isFirebaseConfigured(),

  // Google 1-Click Login
  loginWithGoogle: async (): Promise<User> => {
    if (!auth) throw new Error('Firebase Auth is not configured. Please add your Firebase credentials.');
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    
    const user: User = {
      id: fbUser.uid,
      email: fbUser.email || '',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        id: `prof_${fbUser.uid}`,
        userId: fbUser.uid,
        fullName: fbUser.displayName || 'CampiFa User',
        businessName: fbUser.displayName ? `${fbUser.displayName}'s Studio` : 'My Campaign Studio',
        logoUrl: fbUser.photoURL || null,
        brandColor: '#7B2525',
      },
    };

    const token = await fbUser.getIdToken();
    localStorage.setItem('campifa_token', token);
    localStorage.setItem('campifa_user', JSON.stringify(user));
    return user;
  },

  // Email & Password Login
  loginWithEmail: async (email: string, password: string): Promise<User> => {
    if (!auth) throw new Error('Firebase Auth is not configured. Please add your Firebase credentials.');
    const result = await signInWithEmailAndPassword(auth, email, password);
    const fbUser = result.user;

    const user: User = {
      id: fbUser.uid,
      email: fbUser.email || email,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        id: `prof_${fbUser.uid}`,
        userId: fbUser.uid,
        fullName: fbUser.displayName || email.split('@')[0],
        businessName: `${email.split('@')[0]}'s Studio`,
        logoUrl: fbUser.photoURL || null,
        brandColor: '#7B2525',
      },
    };

    const token = await fbUser.getIdToken();
    localStorage.setItem('campifa_token', token);
    localStorage.setItem('campifa_user', JSON.stringify(user));
    return user;
  },

  // Email & Password Register
  registerWithEmail: async (
    email: string,
    password: string,
    fullName: string,
    businessName: string
  ): Promise<User> => {
    if (!auth) throw new Error('Firebase Auth is not configured. Please add your Firebase credentials.');
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const fbUser = result.user;

    await updateProfile(fbUser, { displayName: fullName });

    const user: User = {
      id: fbUser.uid,
      email: fbUser.email || email,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        id: `prof_${fbUser.uid}`,
        userId: fbUser.uid,
        fullName: fullName,
        businessName: businessName,
        logoUrl: null,
        brandColor: '#7B2525',
      },
    };

    const token = await fbUser.getIdToken();
    localStorage.setItem('campifa_token', token);
    localStorage.setItem('campifa_user', JSON.stringify(user));
    return user;
  },

  // Logout
  logout: async (): Promise<void> => {
    if (auth) {
      await signOut(auth);
    }
    localStorage.removeItem('campifa_token');
    localStorage.removeItem('campifa_user');
  },
};
