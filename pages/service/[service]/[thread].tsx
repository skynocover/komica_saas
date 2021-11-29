import React from 'react';
import { GetServerSideProps, GetStaticProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import Cookies from 'cookies';
import jwt from 'jsonwebtoken';
import { useAuthState } from 'react-firebase-hooks/auth';
import { PrismaClient, Prisma } from '@prisma/client';
import * as antd from 'antd';

import { prisma } from '../../../database/db';
import { AppContext } from '../../../components/AppContext';
import { checkUserAndGroup, checkAuth } from '../../../utils/checkServiceAuth';
import { auth } from '../../../firebase/firebaseClient';

import { Pages } from '../../../components/Pagination';
import { ListThreads } from '../../../components/ListThread';
import { ReportForm } from '../../../components/ReportForm';
import { PostForm } from '../../../components/PostForm';
import { TopLink, Header, BottomLink } from '../../../components/ServiceLink';

export default function Index({
  service,
  threads,
  checkauth,
  displayName,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const appCtx = React.useContext(AppContext);
  const router = useRouter();
  const [authUser, loading] = useAuthState(auth);

  React.useEffect(() => {
    console.log(threads);
    // console.log(error);
  }, []);

  const login = async () => {
    await appCtx.login();
    router.reload();
  };

  if (error) {
    if (error.startsWith('jwt')) {
      if (authUser) {
        appCtx.fetch('post', '/api/account').then(() => router.reload());
      } else {
        router.push('/');
      }
    } else if (error === 'registered') {
      return (
        <>
          <div className="grid gird-cols-1  h-screen ">
            <div className="flex items-end justify-center">
              <p className="font-bold text-3xl">此版面需要登入才能進入</p>
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
      return <>此版面需要通過邀請連結加入</>;
    }
    return <>{error}</>;
  }

  return (
    <>
      <TopLink service={service} />
      <Header service={service} />
      <ListThreads
        onepage={true}
        serviceId={service.id}
        threads={threads}
        auth={checkauth}
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
    const cookie = new Cookies(req, res).get(process.env.COOKIE_NAME!);
    let uid = '';
    if (cookie) {
      const decoded = jwt.verify(cookie, process.env.JWT_SECRET || '');
      if (typeof decoded === 'string') throw new Error(`jwt decode fail`);
      uid = decoded.uid;
    }

    // 確認用戶進入service權限
    const { user, member } = await checkUserAndGroup(serviceId, uid);

    const checkauth = await checkAuth(temp_service, uid, user, member);
    if (!checkauth.visible) {
      const serviceAuth = temp_service.auth as Prisma.JsonObject;
      if (serviceAuth.visible === 'invited') {
        return { props: { error: 'invited' } };
      }
      if (serviceAuth.visible === 'registered') {
        return { props: { error: 'registered' } };
      }
      return { props: { error: '無權限進入' } };
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
      props: { service, threads, checkauth, displayName: member ? member.displayName : null },
    };
  } catch (error: any) {
    console.log(error.message);
    return { props: { error: error.message } };
  }
};
