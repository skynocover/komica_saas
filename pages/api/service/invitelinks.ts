import type { NextApiRequest, NextApiResponse } from 'next';
import dayjs from 'dayjs';
import { PrismaClient, Prisma } from '@prisma/client';

import { prisma } from '../../../database/db';
import { Resp, Tresp } from '../../../resp/resp';
import { setLog } from '../../../utils/setLog';
import { getBinarySize } from '../../../utils/getStringSize';
import { firebaseAuth } from '../../../firebase/auth';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  async function getInviteLink() {
    try {
      const decodeToken = await firebaseAuth(req);

      const { linkId, id } = req.query;
      if (!id && !linkId) {
        res.json(Resp.paramInputEmpty);
        return;
      }

      if (typeof id === 'string') {
        // 後台取得某服務的邀請連結
        const service = await prisma.service.findFirst({
          where: { id, Owner: { account: decodeToken.uid } },
          select: { Owner: { select: { account: true } } },
        });

        if (!service) {
          res.json(Resp.queryNotFound);
          return;
        }

        const Links = await prisma.serviceInviteLink.findMany({
          where: { serviceId: id, OR: [{ expiredAt: { gt: new Date() } }, { expiredAt: null }] },
        });

        res.json({ ...Resp.success, Links });
        return;
      } else if (typeof linkId === 'string') {
        // 取得邀請連結的資訊
        const link = await prisma.serviceInviteLink.findFirst({
          where: { id: linkId, OR: [{ expiredAt: { gt: new Date() } }, { expiredAt: null }] },
          include: { Service: true },
        });

        if (!link) throw new Error(`link not found`);

        const auth = link.Service.auth as Prisma.JsonObject;

        if (auth.visible === 'moderator') throw new Error(`討論版未開放使用連結`);

        const find = await prisma.serviceMember.findFirst({
          where: { serviceId: link.Service.id, User: { account: decodeToken.uid } },
        });

        console.log(find);

        res.json({
          ...Resp.success,
          redirect: !!find,
          serviceId: link.Service.id,
          serviceName: link.Service.name,
        });
        return;
      }
      res.json(Resp.paramInputFormateError);
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message });
    }
  }
  async function postInviteLink() {
    try {
      const decodeToken = await firebaseAuth(req);

      const { id } = req.body;

      const service = await prisma.service.findFirst({
        where: { id, Owner: { account: decodeToken.uid } },
        select: { Owner: { select: { account: true } } },
      });

      if (!service) {
        res.json(Resp.queryNotFound);
        return;
      }

      await prisma.serviceInviteLink.create({ data: { Service: { connect: { id } } } });

      res.json(Resp.success);
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.systemError });
    }
  }

  async function patchInviteLink() {
    try {
      const decodeToken = await firebaseAuth(req);

      const { id, serviceId } = req.body;

      const service = await prisma.service.findFirst({
        where: { id: serviceId, Owner: { account: decodeToken.uid } },
        select: { Owner: { select: { account: true } } },
      });

      if (!service) {
        res.json(Resp.queryNotFound);
        return;
      }

      const link = await prisma.serviceInviteLink.findFirst({ where: { id, serviceId } });
      if (!link) {
        res.json(Resp.queryNotFound);
        return;
      }

      await prisma.serviceInviteLink.update({
        where: { id },
        data: {
          expiredAt: link.expiredAt
            ? dayjs(link.expiredAt).add(7, 'day').toDate()
            : dayjs().add(7, 'day').toDate(),
        },
      });

      res.json(Resp.success);
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.systemError });
    }
  }

  async function delInviteLink() {
    try {
      const decodeToken = await firebaseAuth(req);

      const { id, serviceId } = req.body;

      const service = await prisma.service.findFirst({
        where: { id: serviceId, Owner: { account: decodeToken.uid } },
        select: { Owner: { select: { account: true } } },
      });

      if (!service) {
        res.json(Resp.queryNotFound);
        return;
      }
      const link = await prisma.serviceInviteLink.findFirst({ where: { id, serviceId } });
      if (!link) {
        res.json(Resp.queryNotFound);
        return;
      }

      await prisma.serviceInviteLink.delete({ where: { id } });

      res.json(Resp.success);
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.systemError });
    }
  }

  switch (req.method) {
    case 'GET':
      return await getInviteLink();
    case 'POST':
      return await postInviteLink();
    case 'PATCH':
      return await patchInviteLink();
    case 'DELETE':
      return await delInviteLink();
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
