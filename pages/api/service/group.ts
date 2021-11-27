import type { NextApiRequest, NextApiResponse } from 'next';
import dayjs from 'dayjs';
import { prisma } from '../../../database/db';
import { Resp, Tresp } from '../../../resp/resp';
import { setLog } from '../../../utils/setLog';
import { getBinarySize } from '../../../utils/getStringSize';
import { firebaseAuth } from '../../../firebase/auth';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  async function getGroup() {
    try {
      const decodeToken = await firebaseAuth(req);
      const offset = req.query.offset ? +req.query.offset : undefined;
      const limit = req.query.limit ? +req.query.limit : undefined;
      const serviceName = req.query.serviceName ? `${req.query.serviceName}` : undefined;

      const user = await prisma.user.findFirst({ where: { account: decodeToken.uid } });
      if (!user) {
        res.json(Resp.queryNotFound);
        return;
      }

      const services = await prisma.serviceMember.findMany({
        where: {
          Service: { name: { contains: serviceName }, deletedAt: null },
          User: { account: decodeToken.uid },
        },
        include: {
          User: { select: { account: true } },
          Service: { select: { id: true, name: true, Owner: { select: { account: true } } } },
        },
        take: limit,
        skip: offset,
      });

      const count = await prisma.serviceMember.count({
        where: {
          Service: { name: { contains: serviceName }, deletedAt: null },
          User: { account: { not: decodeToken.uid } },
        },
      });

      res.json({ ...Resp.success, services, count });
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.sqlExecFail });
    }
  }

  async function patchGroup() {
    try {
      const decodeToken = await firebaseAuth(req);

      const { serviceId, displayName } = req.body;

      if (!displayName || !serviceId) {
        res.json(Resp.paramInputEmpty);
        return;
      }

      const find = await prisma.serviceMember.findFirst({
        where: { User: { account: decodeToken.uid }, serviceId },
      });

      if (!find) {
        res.json(Resp.queryNotFound);
        return;
      }

      await prisma.serviceMember.update({ data: { displayName }, where: { id: find.id } });

      // console.log(find);

      res.json(Resp.success);
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.sqlExecFail });
    }
  }

  async function delGroup() {
    try {
      const decodeToken = await firebaseAuth(req);

      const { id } = req.body;
      const user = await prisma.user.findFirst({ where: { account: decodeToken.uid } });
      if (!user) {
        res.json(Resp.queryNotFound);
        return;
      }

      const group = await prisma.serviceMember.findUnique({ where: { id } });
      if (group?.userId !== user.id) {
        res.json(Resp.queryNotFound);
        return;
      }

      await prisma.serviceMember.delete({ where: { id: group.id } });

      res.json(Resp.success);
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.sqlExecFail });
    }
  }

  switch (req.method) {
    case 'GET':
      return await getGroup();
    case 'PATCH':
      return await patchGroup();
    case 'DELETE':
      return await delGroup();
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
