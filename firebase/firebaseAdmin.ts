import * as admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';

const _serviceAccount: admin.ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PROJECT_KEY,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(_serviceAccount),
  });
}

const auth = getAuth();

export { auth };
