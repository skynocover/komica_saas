import type { NextApiRequest, NextApiResponse } from 'next';
import dayjs from 'dayjs';
import * as cfImage from 'cf_images_sdk';
import { PrismaPromise, Prisma } from '.prisma/client';

import { prisma } from '../../../database/db';
import { Resp } from '../../../resp/resp';
import { firebaseAuth } from '../../../firebase/auth';
import { genID } from '../../../utils/genID';
import { checkPostForm } from '../../../utils/checkPostForm';

cfImage.Init(process.env.CF_IMAGE_ACCOUNT_ID!, process.env.CF_IMAGE_TOKEN!);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  async function postReply() {
    try {
      const { image, youtubeID, content, name, sage, parentId, serviceId } = req.body;

      if (!parentId) {
        res.json(Resp.paramInputEmpty);
        return;
      }

      let uid = '';
      try {
        uid = (await firebaseAuth(req)).uid;
      } catch (error) {}

      const { error, user, member, checkauth } = await checkPostForm({
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

      if (!checkauth!.reply) {
        return { error: Resp.userPermissionDenied, user: null, member: null };
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

      let data: Prisma.ReplyCreateInput = {
        userId: genID(req),
        name: name ? name : 'no name',
        imageToken,
        youtubeID,
        content,
        sage,
        Thread: { connect: { id: parentId } },
      };

      if (user) data.Poster = { connect: { id: user.id } };
      if (member) data.Member = { connect: { id: member.id } };

      const reply = await prisma.reply.create({ data });

      if (!sage) {
        await prisma.thread.update({
          data: { replyAt: dayjs().toDate() },
          where: { id: parentId },
        });
      }

      res.json({ ...Resp.success, replyId: reply.id, uploadUrl, imageToken });
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.systemError });
    }
  }

  async function patchReply() {
    try {
      const { postId, imageToken, image } = req.body;

      if (!postId || !imageToken || !image) {
        res.json(Resp.paramInputEmpty);
        return;
      }

      const thread = await prisma.reply.findFirst({ where: { id: postId, imageToken } });
      if (!thread) {
        res.json(Resp.queryNotFound);
        return;
      }

      await prisma.reply.update({ data: { imageToken: '', image }, where: { id: postId } });

      res.json({ ...Resp.success });
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.systemError });
    }
  }

  async function delReply() {
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

      const reply = await prisma.reply.findFirst({
        where: { id, Thread: { Service: { id: serviceId } } },
        select: { id: true, Thread: { select: { Service: { select: { id: true } } } } },
      });

      if (!reply) {
        res.json(Resp.queryNotFound);
        return;
      }

      if (reportId) {
        const report = await prisma.report.findFirst({
          where: { id: reportId, Service: { id: service.id } },
          select: { id: true, Service: { select: { id: true } } },
        });

        if (!report) {
          res.json(Resp.queryNotFound);
          return;
        }
      }
      await prisma.$transaction([
        prisma.report.deleteMany({ where: { replyId: reply.id } }),
        prisma.reply.delete({ where: { id: reply.id } }),
      ]);

      res.json(Resp.success);
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.systemError });
    }
  }

  switch (req.method) {
    case 'POST':
      return await postReply();
    case 'PATCH':
      return await patchReply();
    case 'DELETE':
      return await delReply();
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };
