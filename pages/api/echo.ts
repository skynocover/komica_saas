import type { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'cookies';
import jwt from 'jsonwebtoken';

import { prisma } from '../../database/db';
import { Resp, Tresp } from '../../resp/resp';
import { firebaseAuth } from '../../firebase/auth';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  async function echo() {
    try {
      res.send('ok');
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.systemError });
    }
  }

  switch (req.method) {
    case 'GET':
      return await echo();
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
