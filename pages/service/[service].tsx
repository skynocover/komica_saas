import React from 'react';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import { Divider } from '@material-ui/core';
import dayjs from 'dayjs';
import { PrismaClient, Prisma } from '@prisma/client';
import { useAuthState } from 'react-firebase-hooks/auth';
import ReactMarkdown from 'react-markdown';
import * as antd from 'antd';
import { useTranslation } from 'react-i18next';

import { prisma } from '../../database/db';
import { auth } from '../../firebase/firebaseClient';
import { checkUserAndGroup, checkAuth as fCheckAuth } from '../../utils/checkServiceAuth';
import { getUIDfromCookie } from '../../utils/getUIDfromCookie';

import { AppContext } from '../../components/AppContext';
import { Pages } from '../../components/Pagination';
import { ListThreads } from '../../components/ListThread';
import { PostForm } from '../../components/PostForm';
import { TopLink, Header, BottomLink } from '../../components/ServiceLink';

const pageSize = 8;

export default function Index({
  service,
  count,
  checkAuth,
  displayName,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const appCtx = React.useContext(AppContext);
  const router = useRouter();
  const [authUser, loading] = useAuthState(auth);

  const { t } = useTranslation();

  const page = router.query.page ? +router.query.page : 1;
  const pageCount = Math.ceil(count / pageSize);

  React.useEffect(() => {}, []);

  const Description = () => (
    <div className="flex justify-center">
      <div className="grid w-full grid-cols-1 lg:w-4/12 sm:w-8/12 md:w-1/2">
        {service?.description && <ReactMarkdown children={service.description} />}
      </div>
    </div>
  );

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
      {checkAuth.thread && <PostForm key="postForm" displayName={displayName} />}
      <Description />
      <Pages page={page} pageCount={pageCount} />
      <Divider />
      <ListThreads
        onePage={false}
        serviceId={service.id}
        threads={service.Thread}
        auth={checkAuth}
        displayName={displayName}
      />
      <Pages page={page} pageCount={pageCount} />
      <BottomLink service={service} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  try {
    const page = query.page ? +query.page : 1;
    const serviceId = query.service as string;

    const temp_service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        Thread: {
          where: { deletedAt: null },
          orderBy: [{ replyAt: 'desc' }],
          include: {
            Member: { select: { displayName: true } },
            Reply: {
              where: { deletedAt: null },
              include: { Member: { select: { displayName: true } } },
            },
          },
          skip: pageSize * (page - 1),
          take: pageSize,
        },
        Owner: { select: { account: true } },
      },
    });
    if (!temp_service) throw new Error(`Service not found`);

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

    // 整理thread
    const Thread = temp_service.Thread.map((thread) => {
      return {
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
      };
    });
    const count = await prisma.thread.count({ where: { serviceId, deletedAt: null } });

    const service = {
      ...temp_service,
      createdAt: dayjs(temp_service.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      Thread,
    };

    return {
      props: { service, count, checkAuth, displayName: member ? member.displayName : null },
    };
  } catch (error: any) {
    console.log(error.message);
    return { props: { error: error.message } };
  }
};
