import type { NextApiRequest, NextApiResponse } from 'next';
import * as cfImage from 'cf_images_sdk';
import { PrismaPromise, Prisma } from '.prisma/client';
import { prisma } from '../../../database/db';

import { Resp, Tresp } from '../../../resp/resp';
import { firebaseAuth } from '../../../firebase/auth';
import { genID } from '../../../utils/genID';
import { checkPostForm } from '../../../utils/checkPostForm';

cfImage.Init(process.env.CF_IMAGE_ACCOUNT_ID!, process.env.CF_IMAGE_TOKEN!);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  async function postThread() {
    try {
      const { title, image, youtubeID, content, name, serviceId } = req.body;

      if (!title) {
        res.json(Resp.paramInputEmpty);
        return;
      }

      let uid = '';
      try {
        uid = (await firebaseAuth(req)).uid;
      } catch (error) {}

      const { error, checkauth, user, member } = await checkPostForm({
        image,
        content,
        serviceId,
        youtubeID,
        uid,
      });

      if (error) {
        res.json(error);
        return;
      }

      if (!checkauth!.thread) {
        res.json(Resp.userPermissionDenied);
        return;
      }

      let imageToken = '';
      let uploadUrl = '';
      if (image) {
        const { id, uploadURL, errorMessages } = await cfImage.GetUploadURL();
        if (errorMessages) {
          throw new Error(errorMessages);
        }
        imageToken = id;
        uploadUrl = uploadURL;
      }

      let data: Prisma.ThreadCreateInput = {
        userId: genID(req),
        title,
        name: name ? name : 'no name',
        imageToken,
        youtubeID,
        content,
        Service: { connect: { id: serviceId } },
      };

      if (user) data.Poster = { connect: { id: user.id } };
      if (member) data.Member = { connect: { id: member.id } };

      const thread = await prisma.thread.create({ data });

      res.json({ ...Resp.success, threadId: thread.id, uploadUrl, imageToken });
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.systemError });
    }
  }

  async function patchThread() {
    try {
      const { postId, imageToken, image } = req.body;

      if (!postId || !imageToken || !image) {
        res.json(Resp.paramInputEmpty);
        return;
      }

      const thread = await prisma.thread.findFirst({ where: { id: postId, imageToken } });
      if (!thread) {
        res.json(Resp.queryNotFound);
        return;
      }

      await prisma.thread.update({ data: { imageToken: '', image }, where: { id: postId } });

      res.json({ ...Resp.success });
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.systemError });
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
      res.json({ error: error.message, ...Resp.systemError });
    }
  }

  switch (req.method) {
    case 'POST':
      return await postThread();
    case 'PATCH':
      return await patchThread();
    case 'DELETE':
      return await delThread();
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };
