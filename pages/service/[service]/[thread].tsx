import React from 'react';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { useAuthState } from 'react-firebase-hooks/auth';
import { PrismaClient, Prisma } from '@prisma/client';
import * as antd from 'antd';
import { useTranslation } from 'react-i18next';

import { prisma } from '../../../database/db';
import { AppContext } from '../../../components/AppContext';
import { checkUserAndGroup, checkAuth as fCheckAuth } from '../../../utils/checkServiceAuth';
import { auth } from '../../../firebase/firebaseClient';
import { getUIDfromCookie } from '../../../utils/getUIDfromCookie';
import { ListThreads } from '../../../components/ListThread';
import { TopLink, Header, BottomLink } from '../../../components/ServiceLink';

export default function Index({
  service,
  threads,
  checkAuth,
  displayName,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const appCtx = React.useContext(AppContext);
  const router = useRouter();
  const [authUser, loading] = useAuthState(auth);
  const { t } = useTranslation();

  const login = async () => {
    await appCtx.login();
    router.reload();
  };

  if (error) {
    if (error.startsWith('jwt')) {
      if (authUser) {
        appCtx.fetch('post', '/api/account').then(() => router.reload());
      } else {
        appCtx.fetch('delete', '/api/account');
        router.push('/');
      }
    } else if (error === 'registered') {
      return (
        <>
          <div className="grid h-screen gird-cols-1 ">
            <div className="flex items-end justify-center">
              <p className="text-3xl font-bold">{t('BoardLoginRequired')}</p>
            </div>
            <div>
              <div className="flex justify-center">
                <antd.Button type="primary" shape="round" onClick={() => login()}>
                  Login with Google
                </antd.Button>
              </div>
            </div>
          </div>
        </>
      );
    } else if (error === 'invited') {
      return <>{t('BoardInvitedRequired')}</>;
    }
    return <>{error}</>;
  }

  return (
    <>
      <TopLink service={service} />
      <Header service={service} />
      <ListThreads
        onePage={true}
        serviceId={service.id}
        threads={threads}
        auth={checkAuth}
        displayName={displayName}
      />
      <BottomLink service={service} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  try {
    const serviceId = query.service as string;

    const temp_service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { Owner: { select: { account: true } } },
    });
    if (!temp_service) throw new Error(`Service not found`);

    const thread = await prisma.thread.findFirst({
      where: { id: query.thread as string, serviceId, deletedAt: null },
      include: {
        Member: { select: { displayName: true } },
        Reply: {
          include: { Member: { select: { displayName: true } } },
          where: { deletedAt: null },
        },
      },
    });

    if (!thread) throw new Error(`Thread not found`);

    // 取得用戶uid
    const uid = getUIDfromCookie(req, res);

    // 確認用戶進入service權限
    const { user, member } = await checkUserAndGroup(serviceId, uid);

    const checkAuth = await fCheckAuth(temp_service, uid, user, member);
    if (!checkAuth.visible) {
      const serviceAuth = temp_service.auth as Prisma.JsonObject;
      if (serviceAuth.visible === 'invited') {
        return { props: { error: 'invited' } };
      }
      if (serviceAuth.visible === 'registered') {
        return { props: { error: 'registered' } };
      }
      return { props: { error: 'Auth required' } };
    }

    const threads = [
      {
        ...thread,
        createdAt: dayjs(thread.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        replyAt: dayjs(thread.replyAt).format('YYYY-MM-DD HH:mm:ss'),
        Reply: thread.Reply.map((reply) => {
          return {
            ...reply,
            createdAt: dayjs(reply.createdAt).format('YYYY-MM-DD HH:mm:ss'),
            updatedAt: dayjs(reply.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
          };
        }),
      },
    ];

    const service = {
      ...temp_service,
      createdAt: dayjs(temp_service.createdAt).format('YYYY-MM-DD HH:mm:ss'),
    };

    return {
      props: { service, threads, checkAuth, displayName: member ? member.displayName : null },
    };
  } catch (error: any) {
    console.log(error.message);
    return { props: { error: error.message } };
  }
};
