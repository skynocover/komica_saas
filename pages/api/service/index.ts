import type { NextApiRequest, NextApiResponse } from 'next';
import dayjs from 'dayjs';
import { prisma } from '../../../database/db';
import { Resp, Tresp } from '../../../resp/resp';
import { setLog } from '../../../utils/setLog';
import { getBinarySize } from '../../../utils/getStringSize';
import { firebaseAuth } from '../../../firebase/auth';
import { auth2Int } from '../../../utils/serviceAuth';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  async function getService() {
    try {
      const decodeToken = await firebaseAuth(req);

      if (req.query.id) {
        const service = await prisma.service.findFirst({
          where: {
            id: req.query.id as string,
            Owner: { account: decodeToken.uid },
            deletedAt: null,
          },
          include: {
            Owner: { select: { account: true } },
            ServiceMember: { where: { User: { account: decodeToken.uid } } },
          },
        });

        res.json({
          ...Resp.success,
          service: { ...service, moderatorName: service?.ServiceMember[0].displayName },
        });
      } else {
        const serviceName = req.query.serviceName ? `${req.query.serviceName}` : undefined;

        const temp_services = await prisma.service.findMany({
          where: {
            name: { contains: serviceName },
            Owner: { account: decodeToken.uid },
            deletedAt: null,
          },
          include: {
            Owner: { select: { account: true } },
            ServiceMember: { where: { User: { account: decodeToken.uid } } },
          },
        });

        const services = temp_services.map((service) => {
          return {
            ...service,
            moderatorName: service?.ServiceMember[0]?.displayName,
          };
        });

        res.json({ ...Resp.success, services });
      }
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.sqlExecFail });
    }
  }
  async function postService() {
    try {
      const decodeToken = await firebaseAuth(req);

      const user = await prisma.user.findFirst({ where: { account: decodeToken.uid } });
      if (!user) {
        res.json(Resp.userNotExist);
        return;
      }

      const {
        name,
        topLink,
        headLink,
        description,
        limitPostCount,
        limitPostMin,
        visibleAuth,
        threadAuth,
        replyAuth,
        reportAuth,
        moderatorName,
        forbidContents,
      } = req.body;

      if (
        auth2Int(visibleAuth) === -1 ||
        auth2Int(threadAuth) === -1 ||
        auth2Int(replyAuth) === -1 ||
        auth2Int(reportAuth) === -1
      ) {
        res.json(Resp.paramInputFormateError);
        return;
      }

      const service = await prisma.service.create({
        data: {
          name,
          topLink,
          headLink,
          forbidContents,
          visible: visibleAuth,
          auth: {
            visible: visibleAuth,
            thread: threadAuth,
            reply: replyAuth,
            report: reportAuth,
          },
          description,
          limitPostCount,
          limitPostMin,
          Owner: { connect: { id: user.id } },
        },
      });

      await prisma.serviceMember.create({
        data: {
          Service: { connect: { id: service.id } },
          User: { connect: { id: user.id } },
          displayName: moderatorName,
        },
      });

      res.json(Resp.success);
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.sqlExecFail });
    }
  }

  async function patchService() {
    try {
      const decodeToken = await firebaseAuth(req);
      console.log(decodeToken.uid);

      const user = await prisma.user.findFirst({ where: { account: decodeToken.uid } });
      if (!user) {
        res.json(Resp.userNotExist);
        return;
      }

      const {
        id,
        name,
        topLink,
        headLink,
        description,
        limitPostCount,
        limitPostMin,
        visibleAuth,
        threadAuth,
        replyAuth,
        reportAuth,
        moderatorName,
        forbidContents,
      } = req.body;

      const service = await prisma.service.findFirst({
        where: { id, Owner: { account: decodeToken.uid } },
        select: { id: true, Owner: { select: { account: true } } },
      });

      if (!service) {
        res.json(Resp.commandExecFail);
        return;
      }

      await prisma.service.update({
        data: {
          name,
          topLink: topLink,
          headLink: headLink,
          forbidContents,
          auth: {
            visible: visibleAuth,
            thread: threadAuth,
            reply: replyAuth,
            report: reportAuth,
          },
          description,
          limitPostCount,
          limitPostMin,
          Owner: { connect: { id: user.id } },
        },
        where: { id },
      });

      const member = await prisma.serviceMember.findFirst({
        where: { userId: user.id, serviceId: service.id },
      });

      if (!member) {
        await prisma.serviceMember.create({
          data: {
            Service: { connect: { id: service.id } },
            User: { connect: { id: user.id } },
            displayName: moderatorName,
          },
        });
      } else {
        await prisma.serviceMember.update({
          data: { displayName: moderatorName },
          where: { id: member.id },
        });
      }

      res.json(Resp.success);
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.sqlExecFail });
    }
  }

  async function delService() {
    try {
      const decodeToken = await firebaseAuth(req);
      console.log(decodeToken.uid);

      const user = await prisma.user.findFirst({ where: { account: decodeToken.uid } });
      if (!user) {
        res.json(Resp.userNotExist);
        return;
      }

      const { id } = req.body;

      const service = await prisma.service.findFirst({
        where: { id, Owner: { account: user.account } },
        include: { Owner: true },
      });
      if (!service) {
        res.json(Resp.queryNotFound);
        return;
      }

      await prisma.service.delete({ where: { id } });

      res.json(Resp.success);
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.sqlExecFail });
    }
  }

  switch (req.method) {
    case 'GET':
      return await getService();
    case 'POST':
      return await postService();
    case 'PATCH':
      return await patchService();
    case 'DELETE':
      return await delService();
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
