import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '.prisma/client';

import { prisma } from '../../../database/db';
import { Resp, Tresp } from '../../../resp/resp';
import { firebaseAuth } from '../../../firebase/auth';
import { checkUserAndGroup, checkAuth } from '../../../utils/checkServiceAuth';

const limitdefault = 10;

export default async (req: NextApiRequest, res: NextApiResponse) => {
  async function getReport() {
    try {
      const decodeToken = await firebaseAuth(req);

      const offset = req.query.offset ? +req.query.offset : undefined;
      const limit = req.query.limit ? +req.query.limit : undefined;

      const reports = await prisma.report.findMany({
        where: {
          Service: { deletedAt: null, Owner: { account: decodeToken.uid } },
          OR: [
            { AND: [{ Reply: null }, { Thread: { deletedAt: null } }] },
            { AND: [{ Thread: null }, { Reply: { deletedAt: null } }] },
          ],
        },
        include: {
          Service: { select: { id: true, name: true, Owner: { select: { account: true } } } },
          Thread: { select: { id: true, deletedAt: true } },
          Reply: { select: { id: true, deletedAt: true, Thread: { select: { id: true } } } },
        },
        skip: offset,
        take: limit || limitdefault,
      });

      const count = await prisma.report.count({
        where: {
          Service: { deletedAt: null, Owner: { account: decodeToken.uid } },
          OR: [
            { AND: [{ Reply: null }, { Thread: { deletedAt: null } }] },
            { AND: [{ Thread: null }, { Reply: { deletedAt: null } }] },
          ],
        },
      });

      res.json({ ...Resp.success, reports, count });
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.sqlExecFail });
    }
  }
  async function postReport() {
    try {
      const { postId, reason, content, serviceId } = req.body;

      const service = await prisma.service.findFirst({
        where: { id: serviceId, deletedAt: null },
        include: { Owner: { select: { account: true } } },
      });
      if (!service) {
        res.json(Resp.queryNotFound);
        return;
      }

      let uid = '';
      try {
        uid = (await firebaseAuth(req)).uid;
      } catch (error) {}

      // 確認用戶service權限
      const { user, member } = await checkUserAndGroup(serviceId, uid);

      const checkauth = await checkAuth(service, uid, user, member);
      if (!checkauth.report) {
        res.json(Resp.userPermissionDenied);
        return;
      }

      const thread = await prisma.thread.findFirst({
        where: { id: postId, deletedAt: null, serviceId: service.id },
      });
      const reply = await prisma.reply.findFirst({
        where: { id: postId, deletedAt: null, Thread: { serviceId: service.id } },
        include: { Thread: { select: { serviceId: true } } },
      });

      //必須要是thread或是reply
      if (!(thread || reply)) {
        res.json(Resp.queryNotFound);
        return;
      }

      let data: Prisma.ReportCreateInput = {
        reason,
        content,
        Service: { connect: { id: service.id } },
      };
      if (user) data.Poster = { connect: { id: user.id } };

      if (thread) {
        data.Thread = { connect: { id: postId } };
      } else if (reply) {
        data.Reply = { connect: { id: postId } };
      }
      await prisma.report.create({ data });

      res.json(Resp.success);
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.sqlExecFail });
    }
  }

  async function delReport() {
    try {
      const { id, serviceId } = req.body;
      const service = await prisma.service.findFirst({
        where: { id: serviceId, Owner: { account: 'admin' } },
        select: { Owner: { select: { account: true } } },
      });

      if (!service) {
        res.json(Resp.queryNotFound);
        return;
      }

      const report = await prisma.report.findFirst({
        where: { id, Service: { id: serviceId } },
        select: { id: true, Service: { select: { id: true } } },
      });

      if (!report) {
        res.json(Resp.queryNotFound);
        return;
      }

      await prisma.report.delete({ where: { id } });

      res.json(Resp.success);
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.sqlExecFail });
    }
  }

  switch (req.method) {
    case 'GET':
      return await getReport();
    case 'POST':
      return await postReport();
    case 'DELETE':
      return await delReport();
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
