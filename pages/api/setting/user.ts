import type { NextApiRequest, NextApiResponse } from 'next';
import dayjs from 'dayjs';
import { prisma } from '../../../database/db';
import { Resp, Tresp } from '../../../resp/resp';
import { setLog } from '../../../utils/setLog';
import { getBinarySize } from '../../../utils/getStringSize';
import { firebaseAuth } from '../../../firebase/auth';
import { auth } from '../../../firebase/firebaseAdmin';
import Cookies from 'cookies';
import jwt from 'jsonwebtoken';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  async function getProfile() {
    try {
      const decodeToken = await firebaseAuth(req);

      const user = await prisma.user.findFirst({ where: { account: decodeToken.uid } });
      if (!user) {
        res.json(Resp.queryNotFound);
        return;
      }

      res.json(Resp.success);
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.systemError });
    }
  }

  async function patchProfile() {
    try {
      const decodeToken = await firebaseAuth(req);

      const user = await prisma.user.findFirst({ where: { account: decodeToken.uid } });
      if (!user) {
        res.json(Resp.queryNotFound);
        return;
      }

      const { displayName } = req.body;

      await auth.updateUser(decodeToken.uid, { displayName });

      res.json(Resp.success);
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.systemError });
    }
  }

  switch (req.method) {
    case 'GET':
      return await getProfile();
    case 'PATCH':
      return await patchProfile();
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
