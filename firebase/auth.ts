import type { NextApiRequest, NextApiResponse } from 'next';
import { auth } from './firebaseAdmin';
import { DecodedIdToken } from 'firebase-admin/auth';

export const firebaseAuth = async (req: NextApiRequest): Promise<DecodedIdToken> => {
  const token = req.headers.authorization;
  if (token === undefined) {
    throw new Error(`Invalid authorization header`);
  }

  const decodeToken = await auth.verifyIdToken(token);
  return decodeToken;
};
