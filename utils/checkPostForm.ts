import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaPromise, Prisma, User, ServiceMember } from '.prisma/client';
import { prisma } from '../database/db';

import { Resp, Tresp } from '../resp/resp';
import { setLog } from './setLog';
import { getBinarySize } from './getStringSize';
import { firebaseAuth } from '../firebase/auth';
import { genID } from './genID';
import { checkUserAndGroup, checkAuth } from './checkServiceAuth';
import { ServiceAuthCheck } from './serviceAuth';

interface postform {
  image: boolean;
  content: string | null;
  youtubeID: string | null;
  serviceId: string;
  uid: string;
}

interface returnPostform {
  error?: Tresp;
  checkauth?: ServiceAuthCheck;
  user: User | null;
  member: ServiceMember | null;
}

export const checkPostForm = async ({
  image,
  content,
  serviceId,
  youtubeID,
  uid,
}: postform): Promise<returnPostform> => {
  if (!serviceId) {
    return { error: Resp.paramInputEmpty, user: null, member: null };
  }
  if (image && youtubeID) {
    return { error: Resp.paramInputFormateError, user: null, member: null };
  }

  if (!content && !image) {
    return { error: Resp.paramInputEmpty, user: null, member: null };
  }

  const service = await prisma.service.findFirst({
    where: { id: serviceId, deletedAt: null },
    include: { Owner: { select: { account: true } } },
  });
  if (!service) {
    return { error: Resp.queryNotFound, user: null, member: null };
  }
  for (const forbid of service.forbidContents) {
    if (content && content.includes(forbid)) {
      return { error: Resp.contentForbidden, user: null, member: null };
    }
  }

  // 確認用戶service權限
  const { user, member } = await checkUserAndGroup(serviceId, uid);

  const checkauth = await checkAuth(service, uid, user, member);

  return { user, member, checkauth };
};
