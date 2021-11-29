import type { NextApiRequest, NextApiResponse } from 'next';
import dayjs from 'dayjs';
import { prisma } from '../../../database/db';
import { Resp, Tresp } from '../../../resp/resp';
import { setLog } from '../../../utils/setLog';
import { getBinarySize } from '../../../utils/getStringSize';
import { firebaseAuth } from '../../../firebase/auth';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // 取得服務內所有成員
  async function getMember() {
    try {
      const decodeToken = await firebaseAuth(req);
      const id = req.query.id as string;

      const service = await prisma.service.findFirst({
        where: { id, Owner: { account: decodeToken.uid } },
        include: { Owner: { select: { account: true } } },
      });

      if (!service) {
        res.json(Resp.queryNotFound);
        return;
      }

      const members = await prisma.serviceMember.findMany({
        where: { serviceId: service.id, User: { account: { not: decodeToken.uid } } },
        include: { User: { select: { account: true } } },
      });

      res.json({ ...Resp.success, members });
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.sqlExecFail });
    }
  }
  // 為服務添加人員 (使用invate link)
  async function postMember() {
    try {
      const decodeToken = await firebaseAuth(req);

      const { serviceId, linkId, displayName } = req.body;

      if (!displayName) {
        res.json(Resp.paramInputEmpty);
        return;
      }

      const service = await prisma.service.findFirst({
        where: { id: serviceId },
        include: {
          ServiceInviteLink: {
            where: { id: linkId, OR: [{ expiredAt: { gt: new Date() } }, { expiredAt: null }] },
          },
        },
      });

      if (!service) {
        res.json(Resp.queryNotFound);
        return;
      }

      const user = await prisma.user.findFirst({ where: { account: decodeToken.uid } });
      if (!user) {
        res.json(Resp.userNotFound);
        return;
      }

      const find = await prisma.serviceMember.findFirst({
        where: { userId: user.id, serviceId: service.id },
      });

      // 有找到就傳成功,沒有則建立
      if (find) {
        res.json(Resp.success);
        return;
      }

      await prisma.serviceMember.create({
        data: {
          User: { connect: { id: user.id } },
          Service: { connect: { id: service.id } },
          displayName,
        },
      });

      res.json(Resp.success);
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.sqlExecFail });
    }
  }

  // 從服務移除人員
  async function delMember() {
    try {
      const decodeToken = await firebaseAuth(req);

      const { serviceId, id } = req.body;

      const find = await prisma.serviceMember.findFirst({
        where: { id, Service: { id: serviceId, Owner: { account: decodeToken.uid } } },
      });

      if (!find) {
        res.json(Resp.queryNotFound);
        return;
      }

      await prisma.serviceMember.delete({ where: { id } });

      res.json(Resp.success);
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.sqlExecFail });
    }
  }

  switch (req.method) {
    case 'GET':
      return await getMember();
    case 'POST':
      return await postMember();
    case 'DELETE':
      return await delMember();
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
