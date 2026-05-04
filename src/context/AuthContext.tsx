import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebase';
import { collection, addDoc, doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { toast } from '../components/ui/toaster';

type User = {
  uid: string;
  email: string;
  displayName?: string;
  role: 'user' | 'admin';
  balance: number;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginEmail: (email: string, pass: string) => Promise<void>;
  signupEmail: (email: string, pass: string) => Promise<void>;
  loginGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | undefined;
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser && firebaseUser.email) {
        // Admin check
        const isOwner = firebaseUser.email === 'drubo1034@gmail.com' || firebaseUser.email === 'joydas7877@gmail.com' || firebaseUser.email === 'admin@tenbea.com';
        
        // Setup base user template
        const baseUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || undefined,
          role: isOwner ? ('admin' as const) : ('user' as const),
          balance: 0,
        };

        // Ensure user doc exists
        const userRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
             await setDoc(userRef, {
               email: firebaseUser.email,
               balance: 0,
               createdAt: new Date().toISOString()
             });
          }
        } catch (error: any) {
          console.warn("Could not fetch user document:", error.message);
        }

        // Listen for real-time wallet balance changes
        unsubscribeUserDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
             const data = docSnap.data();
             setUser({
               ...baseUser,
               balance: data.balance || 0,
             });
          } else {
             setUser(baseUser);
          }
          setLoading(false);
        }, (error) => {
          console.warn("onSnapshot error:", error);
          setUser(baseUser);
          setLoading(false);
        });

      } else {
        if (unsubscribeUserDoc) unsubscribeUserDoc();
        setUser(null);
        setLoading(false);
      }
    }, (error) => {
        console.warn("Auth error:", error);
        setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, []);

  const recordLogin = async (user: FirebaseUser, method: string) => {
    try {
      if (!user.email) return;
      await addDoc(collection(db, 'login_history'), {
        userId: user.uid,
        email: user.email,
        method: method,
        date: new Date().toISOString(),
      });
    } catch (e) {
      console.error("Failed to record login", e);
    }
  };

  const loginEmail = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    await recordLogin(cred.user, 'email_login');
  };

  const signupEmail = async (email: string, pass: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await recordLogin(cred.user, 'email_signup');
  };

  const loginGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    await recordLogin(cred.user, 'google_login');
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      loginEmail, 
      signupEmail, 
      loginGoogle, 
      logout, 
      isAdmin: user?.role === 'admin' 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


