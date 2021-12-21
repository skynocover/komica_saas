import { Service, User, ServiceMember } from '.prisma/client';
import { PrismaClient, Prisma } from '@prisma/client';

import { prisma } from '../database/db';
import { ServiceAuthCheck } from './serviceAuth';

export const checkUserAndGroup = async (
  serviceId: string,
  uid: string,
): Promise<{ user: User | null; member: ServiceMember | null }> => {
  const user = uid === '' ? null : await prisma.user.findFirst({ where: { account: uid } });
  const member = user
    ? await prisma.serviceMember.findFirst({
        where: { userId: user.id, serviceId },
      })
    : null;

  return { user, member };
};

export const checkAuth = async (
  service: Service & { Owner: { account: string } },
  uid: string,
  user: User | null,
  member: ServiceMember | null,
): Promise<ServiceAuthCheck> => {
  const serviceAuth = service.auth as Prisma.JsonObject;

  let visible = false;
  let thread = true;
  let reply = true;
  let report = true;
  let del = false;

  if (service.Owner.account === uid) {
    return { visible: true, thread: true, reply: true, report: true, del: true };
  }

  switch (serviceAuth.visible) {
    case 'moderator':
      return { visible, thread, reply, report, del };
    case 'invited':
      if (!member) return { visible, thread, reply, report, del };
      break;
    case 'registered':
      if (!user) return { visible, thread, reply, report, del };
      break;
  }
  visible = true;

  switch (serviceAuth.thread) {
    case 'moderator':
      thread = false;
      break;
    case 'invited':
      if (!member) thread = false;
      break;
    case 'registered':
      if (!user) thread = false;
      break;
  }

  switch (serviceAuth.reply) {
    case 'moderator':
      reply = false;
      break;
    case 'invited':
      if (!member) reply = false;
      break;
    case 'registered':
      if (!user) reply = false;
      break;
  }

  switch (serviceAuth.report) {
    case 'moderator':
      report = false;
      break;
    case 'invited':
      if (!member) report = false;
      break;
    case 'registered':
      if (!user) report = false;
      break;
  }

  return { visible, thread, reply, report, del };
};
