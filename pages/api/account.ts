import type { NextApiRequest, NextApiResponse } from 'next';
import dayjs from 'dayjs';
import { prisma } from '../../database/db';
import { Resp, Tresp } from '../../resp/resp';
import { setLog } from '../../utils/setLog';
import { getBinarySize } from '../../utils/getStringSize';
import { firebaseAuth } from '../../firebase/auth';
import Cookies from 'cookies';
import jwt from 'jsonwebtoken';

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
      res.json({ error: error.message, ...Resp.sqlExecFail });
    }
  }

  async function logout() {
    try {
      const cookies = new Cookies(req, res);
      cookies.set(process.env.COOKIE_NAME!, null);
      res.json(Resp.success);
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.sqlExecFail });
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
