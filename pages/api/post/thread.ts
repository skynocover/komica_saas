import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaPromise, Prisma } from '.prisma/client';
// import type { ThreadCreateInput } from '.prisma/client';
import { prisma } from '../../../database/db';

import { Resp, Tresp } from '../../../resp/resp';
import { setLog } from '../../../utils/setLog';
import { getBinarySize } from '../../../utils/getStringSize';
import { firebaseAuth } from '../../../firebase/auth';
import { genID } from '../../../utils/genID';

import { checkUserAndGroup, checkAuth } from '../../../utils/checkServiceAuth';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  async function postThread() {
    try {
      const { title, image, youtubeID, content, name, serviceId } = req.body;

      if (image && youtubeID) {
        res.json(Resp.paramInputFormateError);
        return;
      }

      const service = await prisma.service.findFirst({
        where: { id: serviceId, deletedAt: null },
        include: { Owner: { select: { account: true } } },
      });
      if (!service) {
        res.json(Resp.queryNotFound);
        return;
      }

      for (const forbid of service.forbidContents) {
        if (content.includes(forbid)) {
          res.json(Resp.contentForbidden);
          return;
        }
      }

      let uid = '';
      try {
        uid = (await firebaseAuth(req)).uid;
      } catch (error) {}

      // 確認用戶service權限
      const { user, member } = await checkUserAndGroup(serviceId, uid);

      const checkauth = await checkAuth(service, uid, user, member);
      if (!checkauth.thread) {
        res.json(Resp.userPermissionDenied);
        return;
      }

      if (image && getBinarySize(image) > 4096 * 1000) {
        res.json(Resp.imgLimit);
        return;
      }

      let data: Prisma.ThreadCreateInput = {
        userId: genID(req),
        title,
        name: name ? name : 'no name',
        image,
        youtubeID,
        content,
        Service: { connect: { id: serviceId } },
      };

      if (user) data.Poster = { connect: { id: user.id } };
      if (member) data.Member = { connect: { id: member.id } };

      await prisma.thread.create({ data });

      res.json(Resp.success);
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.sqlExecFail });
    }
  }

  async function delThread() {
    try {
      const decodeToken = await firebaseAuth(req);

      const { id, serviceId, reportId } = req.body;
      const service = await prisma.service.findFirst({
        where: { id: serviceId, Owner: { account: decodeToken.uid } },
        select: { id: true, Owner: { select: { account: true } } },
      });

      if (!service) {
        res.json(Resp.queryNotFound);
        return;
      }

      const thread = await prisma.thread.findFirst({
        where: { id, Service: { id: serviceId } },
        select: { id: true, Service: { select: { id: true } } },
      });

      if (!thread) {
        res.json(Resp.queryNotFound);
        return;
      }

      let train: PrismaPromise<any>[] = [];

      if (reportId) {
        const report = await prisma.report.findFirst({
          where: { id: reportId, Service: { id: service.id } },
          select: { id: true, Service: { select: { id: true } } },
        });

        if (!report) {
          res.json(Resp.queryNotFound);
          return;
        }

        train.push(prisma.report.delete({ where: { id: report.id } }));
      }
      train.push(prisma.report.deleteMany({ where: { threadId: id } }));
      train.push(prisma.reply.deleteMany({ where: { threadId: id } }));
      train.push(prisma.thread.delete({ where: { id } }));

      await prisma.$transaction(train);

      res.json(Resp.success);
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.sqlExecFail });
    }
  }

  switch (req.method) {
    case 'POST':
      return await postThread();
    case 'DELETE':
      return await delThread();
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };
