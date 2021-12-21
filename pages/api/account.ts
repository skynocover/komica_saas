import type { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'cookies';
import jwt from 'jsonwebtoken';

import { prisma } from '../../database/db';
import { Resp, Tresp } from '../../resp/resp';
import { firebaseAuth } from '../../firebase/auth';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  async function login() {
    try {
      const decodeToken = await firebaseAuth(req);

      const user = await prisma.user.findFirst({ where: { account: decodeToken.uid } });
      if (!user) {
        await prisma.user.create({ data: { account: decodeToken.uid } });
      }

      const cookies = new Cookies(req, res);
      const token = jwt.sign({ uid: decodeToken.uid }, process.env.JWT_SECRET!, {
        expiresIn: '24h',
      });
      cookies.set(process.env.COOKIE_NAME!, token);

      res.json(Resp.success);
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.systemError });
    }
  }

  async function logout() {
    try {
      const cookies = new Cookies(req, res);
      cookies.set(process.env.COOKIE_NAME!, null);
      res.json(Resp.success);
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.systemError });
    }
  }

  switch (req.method) {
    case 'POST':
      return await login();
    case 'DELETE':
      return await logout();
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
