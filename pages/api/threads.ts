import type { NextApiRequest, NextApiResponse } from 'next';
import dayjs from 'dayjs';
import { prisma } from '../../database/db';
import { Resp, Tresp } from '../../resp/resp';
import { setLog } from '../../utils/setLog';
import { getBinarySize } from '../../utils/getStringSize';
import { firebaseAuth } from '../../firebase/auth';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // 取得自己加入的群組
  async function getNewestThread() {
    try {
      const decodeToken = await firebaseAuth(req);

      const user = await prisma.user.findFirst({ where: { account: decodeToken.uid } });
      if (!user) {
        res.json(Resp.queryNotFound);
        return;
      }

      const services = await prisma.serviceMember.findMany({
        where: { userId: user.id, Service: { deletedAt: null } },
      });

      const serviceIds = services.map((item) => item.serviceId);

      const threads = await prisma.thread.findMany({
        take: 12,
        orderBy: { replyAt: 'desc' },
        where: { serviceId: { in: serviceIds } },
        select: {
          id: true,
          title: true,
          content: true,
          image: true,
          youtubeID: true,
          Service: { select: { id: true } },
        },
      });

      res.json({ ...Resp.success, threads });
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.sqlExecFail });
    }
  }

  switch (req.method) {
    case 'GET':
      return await getNewestThread();

    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
