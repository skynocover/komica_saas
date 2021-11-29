import React from 'react';
import { GetServerSideProps, GetStaticProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import { Divider, LinkTypeMap } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Typography from '@material-ui/core/Typography';
import dayjs from 'dayjs';
import * as antd from 'antd';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';

import { Notification } from '../components/Notification';
import { prisma } from '../database/db';
import { AppContext } from '../components/AppContext';

import { makeStyles } from '@material-ui/core/styles';
import { Pages } from '../components/Pagination';
import { ListThreads } from '../components/ListThread';
import { ReportForm } from '../components/ReportForm';
import { PostForm } from '../components/PostForm';
import { Thread, Reply } from '.prisma/client';
import { auth } from '../firebase/firebaseClient';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function Index({
  subdomain,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const appCtx = React.useContext(AppContext);
  const router = useRouter();

  const [authUser, loading, error] = useAuthState(auth);

  const init = async () => {
    if (authUser) {
      const authToken = await authUser.getIdToken();
      await axios.post('/api/account', {}, { headers: { Authorization: authToken } });
      router.push('/');
    } else {
      console.log('no user');
    }
  };

  React.useEffect(() => {
    init();
  }, [authUser]);

  const emailLogin = async () => {
    await signInWithEmailAndPassword(auth, 'user@gmail.com', '123456');
  };

  if (loading) {
    return <></>;
  }

  return (
    <section className="flex flex-col md:flex-row h-screen items-center">
      <div className="bg-indigo-600 hidden lg:block w-full md:w-1/2 xl:w-2/3 h-screen">
        <img
          src="https://source.unsplash.com/random"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      <div
        className="bg-white w-full md:max-w-md lg:max-w-full md:mx-0 md:w-1/2 xl:w-1/3 h-screen px-6 lg:px-16 xl:px-12
        flex items-center justify-center"
      >
        <div className="w-full h-100">
          <h1 className="text-xl md:text-2xl font-bold leading-tight mt-12">Kraft</h1>

          <div className="mt-6">
            <button
              className="w-full block bg-indigo-500 hover:bg-indigo-400 focus:bg-indigo-400 text-white font-semibold rounded-lg
              px-4 py-3 mt-6"
              onClick={() => emailLogin()}
            >
              TRY DEMO?
            </button>
          </div>

          <hr className="my-6 border-gray-300 w-full" />

          <button
            type="button"
            className="w-full block bg-white hover:bg-gray-100 focus:bg-gray-100 text-gray-900 font-semibold rounded-lg px-4 py-3 border border-gray-300"
            onClick={() => appCtx.login()}
          >
            <div className="flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                className="w-6 h-6"
                viewBox="0 0 48 48"
              >
                <defs>
                  <path
                    id="a"
                    d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
                  />
                </defs>
                <clipPath id="b">
                  <use xlinkHref="#a" overflow="visible" />
                </clipPath>
                <path clipPath="url(#b)" fill="#FBBC05" d="M0 37V11l17 13z" />
                <path clipPath="url(#b)" fill="#EA4335" d="M0 11l17 13 7-6.1L48 14V0H0z" />
                <path clipPath="url(#b)" fill="#34A853" d="M0 37l30-23 7.9 1L48 0v48H0z" />
                <path clipPath="url(#b)" fill="#4285F4" d="M48 48L17 24l-4-3 35-10z" />
              </svg>
              <span className="ml-4">Log in with Google</span>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  try {
    // 設定subdomain用
    // let host = req.headers['x-forwarded-host'] || req.headers['host'];

    // if (Array.isArray(host)) host = host[0];
    // const subdomain = host?.split('.')[0];
    return { props: {} };
  } catch (error: any) {
    console.log(error.message);
    return { props: { error: error.message } };
  }
};
