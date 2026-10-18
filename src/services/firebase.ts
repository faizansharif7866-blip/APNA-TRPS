import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithPhoneNumber, 
  RecaptchaVerifier, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  type User,
  type ConfirmationResult
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocFromServer,
  serverTimestamp 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Configure test connection
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client appears offline. Please verify network connectivity.');
    }
  }
}

// Public User Profile in Firestore
export interface PublicUserProfile {
  uid: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  authProvider: 'phone' | 'google' | 'guest';
  createdAt: string;
  lastLoginAt: string;
}

/**
 * Sync user profile to Firestore whenever authenticated
 */
export async function syncUserProfile(user: User, providerOverride?: 'phone' | 'google'): Promise<PublicUserProfile> {
  const userRef = doc(db, 'users', user.uid);
  let existingProfile: PublicUserProfile | null = null;
  
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      existingProfile = snap.data() as PublicUserProfile;
    }
  } catch (e) {
    console.warn('Could not fetch existing profile from Firestore:', e);
  }

  const detectedProvider = providerOverride || (user.phoneNumber ? 'phone' : 'google');
  const now = new Date().toISOString();

  const profile: PublicUserProfile = {
    uid: user.uid,
    name: user.displayName || existingProfile?.name || (user.phoneNumber ? `Traveler ${user.phoneNumber.slice(-4)}` : 'Valued Traveler'),
    email: user.email || existingProfile?.email || null,
    phoneNumber: user.phoneNumber || existingProfile?.phoneNumber || null,
    photoURL: user.photoURL || existingProfile?.photoURL || null,
    authProvider: detectedProvider,
    createdAt: existingProfile?.createdAt || now,
    lastLoginAt: now,
  };

  try {
    await setDoc(userRef, {
      ...profile,
      serverSyncedAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore profile sync fallback (local caching):', err);
  }

  return profile;
}

/**
 * Real Google Account Sign-In
 */
export async function signInWithGoogle(): Promise<{ user: User; profile: PublicUserProfile }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const profile = await syncUserProfile(result.user, 'google');
    return { user: result.user, profile };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

/**
 * Setup Invisible or Visible reCAPTCHA Verifier for Phone OTP
 */
export function setupRecaptcha(containerId: string): RecaptchaVerifier {
  // Clear any existing recaptcha verifier widget on the container if needed
  if ((window as any).recaptchaVerifier) {
    try {
      (window as any).recaptchaVerifier.clear();
    } catch {
      // ignore
    }
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
    'expired-callback': () => {
      console.warn('reCAPTCHA expired. User should retry.');
    },
  });

  (window as any).recaptchaVerifier = verifier;
  return verifier;
}

/**
 * Send Phone OTP to real user phone number
 * @param rawPhoneNumber e.g. "9876543210" or "+919876543210"
 * @param verifier RecaptchaVerifier instance
 */
export async function sendPhoneOtp(
  rawPhoneNumber: string,
  verifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  let formattedNumber = rawPhoneNumber.trim();
  // Ensure international E.164 format (+91 for India default if not provided)
  if (!formattedNumber.startsWith('+')) {
    if (formattedNumber.length === 10) {
      formattedNumber = `+91${formattedNumber}`;
    } else {
      formattedNumber = `+${formattedNumber}`;
    }
  }

  try {
    const confirmationResult = await signInWithPhoneNumber(auth, formattedNumber, verifier);
    return confirmationResult;
  } catch (error: any) {
    console.error('Error sending Phone OTP:', error);
    throw error;
  }
}

/**
 * Confirm 6-digit OTP code received on Phone
 */
export async function verifyPhoneOtp(
  confirmationResult: ConfirmationResult,
  otpCode: string
): Promise<{ user: User; profile: PublicUserProfile }> {
  try {
    const credential = await confirmationResult.confirm(otpCode.trim());
    const profile = await syncUserProfile(credential.user, 'phone');
    return { user: credential.user, profile };
  } catch (error: any) {
    console.error('OTP Verification Error:', error);
    throw error;
  }
}

/**
 * Sign out user
 */
export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
  localStorage.removeItem('apnatrips_public_user');
  localStorage.removeItem('apnatrips_user');
}

/**
 * Observe real authentication state
 */
export function subscribeToAuthState(
  callback: (user: User | null, profile: PublicUserProfile | null) => void
): () => void {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const profile = await syncUserProfile(firebaseUser);
      callback(firebaseUser, profile);
    } else {
      callback(null, null);
    }
  });
}
