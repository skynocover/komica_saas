import type { NextApiRequest, NextApiResponse } from 'next';

import { prisma } from '../../../database/db';
import { Resp, Tresp } from '../../../resp/resp';
import { firebaseAuth } from '../../../firebase/auth';

const limitdefault = 10;

export default async (req: NextApiRequest, res: NextApiResponse) => {
  async function getReport() {
    try {
      const decodeToken = await firebaseAuth(req);

      let offset = req.query.offset ? +req.query.offset : undefined;
      let limit = req.query.limit ? +req.query.limit : undefined;

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
      const { postId, reason, content } = req.body;

      const thread = await prisma.thread.findUnique({ where: { id: postId } });
      const reply = await prisma.reply.findUnique({
        where: { id: postId },
        include: { Thread: true },
      });

      if (!(thread || reply)) {
        res.json(Resp.queryNotFound);
        return;
      }

      if (thread) {
        await prisma.report.create({
          data: {
            reason,
            content,
            Thread: { connect: { id: postId } },
            Service: { connect: { id: thread.serviceId } },
          },
        });
      } else if (reply) {
        await prisma.report.create({
          data: {
            reason,
            content,
            Reply: { connect: { id: postId } },
            Service: { connect: { id: reply.Thread.serviceId } },
          },
        });
      }

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
