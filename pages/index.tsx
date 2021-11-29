import React from 'react';
import { GetServerSideProps, GetStaticProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import { Divider, LinkTypeMap } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Typography from '@material-ui/core/Typography';
import dayjs from 'dayjs';
import * as antd from 'antd';
import { ColumnsType } from 'antd/lib/table';
import Badge from '@mui/material/Badge';
import { makeStyles } from '@material-ui/core/styles';
import utc from 'dayjs/plugin/utc';
import ReportIcon from '@mui/icons-material/Report';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, Auth, User } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { PrismaClient, Prisma } from '@prisma/client';
import ReactMarkdown from 'react-markdown';

import { Notification } from '../components/Notification';
import { prisma } from '../database/db';
import { AppContext } from '../components/AppContext';
import { Pages } from '../components/Pagination';
import { ListThreads } from '../components/ListThread';
import { ReportForm } from '../components/ReportForm';
import { PostForm } from '../components/PostForm';
import { Thread, Reply } from '.prisma/client';
import { MainPage } from '../components/MainPage';
import { Service, service } from '../components/Service';
import { DangerButton } from '../components/DangerButton';
// import { initFirebase } from '../firebase/firebaseAdmin';
import { auth } from '../firebase/firebaseClient';
import { InviteLinkList } from '../components/InviteLinkList';
import { MemberList } from '../components/MemberList';
import { Image } from '../components/Image';
import { Header } from '../components/Header';

dayjs.extend(utc);

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

  const [threads, setThreads] = React.useState<thread[]>([]);
  const [joinThreads, setJoinThreads] = React.useState<thread[]>([]);

  const init = async () => {
    appCtx
      .fetch('get', '/api/threads')
      .then((data) => {
        if (data) {
          const { threads } = data;
          setJoinThreads(threads);
          // console.log(threads);
        }
      })
      .catch();
  };

  React.useEffect(() => {
    exThreads && setThreads(exThreads);
    init();
  }, []);

  const ThreadContent = ({ item }: { item: thread }) => (
    <div className="bg-white rounded-lg">
      {item.image ? (
        <div className="rounded w-full object-cover object-center mb-5 h-60 overflow-hidden">
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
        <div className="flex items-center justify-center h-60 mb-5">
          <svg className="svg-icon " viewBox="0,0,20,20">
            <path
              fill="#808080"
              d="M6.523,7.683c0.96,0,1.738-0.778,1.738-1.738c0-0.96-0.778-1.738-1.738-1.738c-0.96,0-1.738,0.778-1.738,1.738
								C4.785,6.904,5.563,7.683,6.523,7.683z M5.944,5.365h1.159v1.159H5.944V5.365z M18.113,0.729H1.888
								c-0.64,0-1.159,0.519-1.159,1.159v16.224c0,0.64,0.519,1.159,1.159,1.159h16.225c0.639,0,1.158-0.52,1.158-1.159V1.889
								C19.271,1.249,18.752,0.729,18.113,0.729z M18.113,17.532c0,0.321-0.262,0.58-0.58,0.58H2.467c-0.32,0-0.579-0.259-0.579-0.58
								V2.468c0-0.32,0.259-0.579,0.579-0.579h15.066c0.318,0,0.58,0.259,0.58,0.579V17.532z M15.91,7.85l-4.842,5.385l-3.502-2.488
								c-0.127-0.127-0.296-0.18-0.463-0.17c-0.167-0.009-0.336,0.043-0.463,0.17l-3.425,4.584c-0.237,0.236-0.237,0.619,0,0.856
								c0.236,0.236,0.62,0.236,0.856,0l3.152-4.22l3.491,2.481c0.123,0.123,0.284,0.179,0.446,0.174c0.16,0.005,0.32-0.051,0.443-0.174
								l5.162-5.743c0.238-0.236,0.238-0.619,0-0.856C16.529,7.614,16.146,7.614,15.91,7.85z"
            ></path>
          </svg>
        </div>
      )}

      <h2 className="text-lg text-gray-900 font-medium title-font mb-4">
        <a href={`/service/${item.Service.id}/${item.id}`} target="_blank">
          {item.title}
        </a>
      </h2>
      <p className="leading-relaxed text-base">
        <ReactMarkdown children={item.content} />
      </p>
    </div>
  );

  const Divider = () => (
    <div className="text-center mb-10">
      <span className="inline-block w-1 h-1 rounded-full bg-indigo-500 ml-1"></span>
      <span className="inline-block w-3 h-1 rounded-full bg-indigo-500 ml-1"></span>
      <span className="inline-block w-40 h-1 rounded-full bg-indigo-500 ml-1"></span>
      <span className="inline-block w-3 h-1 rounded-full bg-indigo-500 ml-1"></span>
      <span className="inline-block w-1 h-1 rounded-full bg-indigo-500 ml-1"></span>
    </div>
  );

  return (
    <>
      <Header />
      <div className="min-w-screen min-h-screen bg-gray-50 flex items-center justify-center ">
        <div className="w-full bg-white border-t border-b border-gray-200 px-5 py-16 md:py-24 text-gray-800">
          <div className="w-full max-w-6xl mx-auto">
            <div className="text-center max-w-xl mx-auto">
              <h1 className="text-6xl md:text-7xl font-bold mb-5 text-gray-600">Akraft</h1>
              <h3 className="text-xl mb-5 font-light">活躍的公開討論串</h3>
              <Divider />
            </div>

            {/* 活躍的公開討論串 */}
            <div className="-mx-3 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grid-cols-1 gap-4  ">
              {threads.map((thread, index) => (
                <ThreadContent item={thread} />
              ))}
            </div>

            {joinThreads.length > 0 && (
              <>
                <div className="text-center max-w-xl mx-auto">
                  <h3 className="text-xl mb-5 font-light">您已加入版面的最新討論串</h3>
                  <Divider />
                </div>
                <div className="-mx-3 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grid-cols-1 gap-4  ">
                  {joinThreads.map((thread, index) => (
                    <ThreadContent item={thread} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  try {
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
