import React from 'react';
import { GetServerSideProps, GetStaticProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useAuthState } from 'react-firebase-hooks/auth';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import SwiperCore, { Navigation, Swiper } from 'swiper';
import { Swiper as SwiperFC, SwiperSlide } from 'swiper/react';
import { useWindowSize } from 'react-use';

import { prisma } from '../database/db';
import { AppContext } from '../components/AppContext';
import { auth } from '../firebase/firebaseClient';
import { Image } from '../components/Image';
import { Header } from '../components/Header';

dayjs.extend(utc);

SwiperCore.use([Navigation]);

interface thread {
  id: string;
  title: string;
  content: string;
  image?: string;
  youtubeID?: string;
  Service: { id: string };
}

export default function Index({
  exThreads,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const appCtx = React.useContext(AppContext);
  const router = useRouter();
  const { t } = useTranslation();
  const { width } = useWindowSize();

  const [threads, setThreads] = React.useState<thread[]>([]);
  const [joinThreads, setJoinThreads] = React.useState<thread[]>([]);
  const [authUser, loading, error] = useAuthState(auth);

  const init = async () => {
    authUser?.getIdToken().then((token) => {
      axios.get('/api/threads', { headers: { Authorization: token } }).then((response) => {
        const { data } = response;
        const { threads } = data;
        setJoinThreads(threads);
      });
    });
  };

  React.useEffect(() => {
    exThreads && setThreads(exThreads);
    init();
  }, []);

  const ThreadContent = ({ item }: { item: thread }) => (
    <div className="bg-gray-100 p-1 rounded-lg h-96 overflow-hidden">
      {item.image ? (
        <div className="rounded w-full object-cover object-center mb-4 h-1/2 overflow-hidden">
          <Image image={item.image} />
        </div>
      ) : item.youtubeID ? (
        <div className="relative" style={{ paddingTop: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${item.youtubeID}`}
            frameBorder="0"
            allowFullScreen
          />
        </div>
      ) : (
        <></>
      )}

      <h2 className="text-lg text-gray-900 font-medium title-font mb-4">
        <Link href={`/service/${item.Service.id}/${item.id}`}>
          <a target="_blank">{item.title}</a>
        </Link>
      </h2>
      <p className="leading-relaxed text-base">
        <ReactMarkdown children={item.content} />
      </p>
    </div>
  );

  const Threads = ({ title, threads }: { title: string; threads: thread[] }) => (
    <>
      <div className="text-center max-w-xl mx-auto my-8 ">
        <h3 className="text-xl font-light">{title}</h3>
        <div className="text-center">
          <span className="inline-block w-1 h-1 rounded-full bg-indigo-500 ml-1"></span>
          <span className="inline-block w-3 h-1 rounded-full bg-indigo-500 ml-1"></span>
          <span className="inline-block w-40 h-1 rounded-full bg-indigo-500 ml-1"></span>
          <span className="inline-block w-3 h-1 rounded-full bg-indigo-500 ml-1"></span>
          <span className="inline-block w-1 h-1 rounded-full bg-indigo-500 ml-1"></span>
        </div>
      </div>

      <SwiperFC
        slidesPerView={width > 1024 ? 4 : width > 768 ? 3 : width > 640 ? 2 : 1}
        slidesPerGroup={width > 1024 ? 4 : width > 768 ? 3 : width > 640 ? 2 : 1}
        spaceBetween={10}
        navigation={true}
      >
        {threads.map((thread, index) => (
          <SwiperSlide key={index} virtualIndex={index}>
            <ThreadContent key={index} item={thread} />
          </SwiperSlide>
        ))}
      </SwiperFC>
    </>
  );

  return (
    <>
      <Header />
      <div className="min-w-screen min-h-screen bg-gray-50 flex items-center justify-center ">
        <div className="w-full bg-white border-t border-b border-gray-200 px-5 py-14 text-gray-800">
          <div className="w-full max-w-6xl mx-auto">
            <div className="text-center max-w-xl mx-auto">
              <h1 className="text-6xl md:text-7xl font-bold  text-gray-600">Akraft</h1>
            </div>

            {/* 活躍的公開討論串 */}
            <Threads title={t('ActivePublicThread')} threads={threads} />

            {/* 您已加入版面的最新討論串 */}
            {joinThreads.length > 0 && (
              <Threads title={t('JoinedBoardThread')} threads={joinThreads} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  try {
    if (req.headers.host) {
      const host = req.headers.host.split('.');

      if (host.length > 2) {
        const subdomain = host[0];
        const domain = await prisma.domain.findFirst({
          where: { name: subdomain },
          select: { Service: true },
        });

        if (domain) {
          return {
            redirect: {
              permanent: false,
              destination: process.env.NEXT_PUBLIC_DOMAIN! + '/service/' + domain.Service.id,
            },
            props: {},
          };
        }
      }
    }

    const exThreads = await prisma.thread.findMany({
      take: 12,
      orderBy: { replyAt: 'desc' },
      where: { Service: { visible: 'allowAnonymous' } },
      select: {
        id: true,
        title: true,
        content: true,
        image: true,
        youtubeID: true,
        Service: { select: { id: true } },
      },
    });

    return { props: { exThreads } };
  } catch (error: any) {
    console.log(error.message);
    return { props: { error: error.message } };
  }
};
