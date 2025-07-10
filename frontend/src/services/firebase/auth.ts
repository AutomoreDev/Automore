import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    User as FirebaseUser,
    updateProfile,
  } from 'firebase/auth';
  import { auth } from './config';
  
  export const authService = {
    // Sign in with email and password
    signIn: async (email: string, password: string) => {
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return { user: result.user, error: null };
      } catch (error: any) {
        return { user: null, error: error.message };
      }
    },
  
    // Create new user account
    signUp: async (email: string, password: string, firstName: string, lastName: string) => {
      try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update display name
        await updateProfile(result.user, {
          displayName: `${firstName} ${lastName}`
        });
  
        return { user: result.user, error: null };
      } catch (error: any) {
        return { user: null, error: error.message };
      }
    },
  
    // Sign out
    signOut: async () => {
      try {
        await signOut(auth);
        return { error: null };
      } catch (error: any) {
        return { error: error.message };
      }
    },
  
    // Get current user
    getCurrentUser: (): FirebaseUser | null => {
      return auth.currentUser;
    },
  };