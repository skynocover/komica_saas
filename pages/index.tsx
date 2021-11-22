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

export default function Index({}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const appCtx = React.useContext(AppContext);
  const router = useRouter();

  const [authUser, loading, error] = useAuthState(auth);

  const init = async () => {
    if (authUser) {
      const data = await appCtx.fetch('post', '/api/account');
      if (data) router.push('/Home');
    } else {
      console.log('no user');
    }
  };

  React.useEffect(() => {
    init();
  }, [authUser]);

  const login = async (account: string, password: string) => {
    await signInWithEmailAndPassword(auth, account, password);
  };

  const LoginForm = () => {
    return (
      <antd.Form
        initialValues={{ account: 'user@gmail.com', password: '123456' }}
        onFinish={(values) => login(values.account, values.password)}
      >
        <antd.Form.Item
          name="account"
          rules={[{ required: true, message: 'E-mail could not be empty!' }]}
        >
          <antd.Input prefix={<i className="fa fa-user" />} placeholder="Please Input E-mail" />
        </antd.Form.Item>

        <antd.Form.Item
          name="password"
          rules={[{ required: true, message: 'Password could not be empty!' }]}
        >
          <antd.Input.Password
            prefix={<i className="fa fa-lock" />}
            placeholder="Please Input Password"
          />
        </antd.Form.Item>

        <antd.Form.Item>
          <antd.Button type="primary" shape="round" htmlType="submit">
            Login
          </antd.Button>
        </antd.Form.Item>

        {/* <antd.Form.Item className="text-center">
          <antd.Button
            type="primary"
            shape="round"
            onClick={() => {
              window.location.href = '/#/regist';
            }}
          >
            Regist
          </antd.Button>
        </antd.Form.Item> */}
        <antd.Button type="primary" shape="round" onClick={() => appCtx.login()}>
          Login with Google
        </antd.Button>
      </antd.Form>
    );
  };

  if (loading) {
    return <></>;
  }

  return (
    <div className="grid gird-cols-1  h-screen ">
      <div className="flex items-end justify-center">
        <p className="font-bold text-4xl">Komica Craft</p>
      </div>

      <div className="flex justify-center">
        <LoginForm />
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  try {
    return { props: {} };
  } catch (error: any) {
    console.log(error.message);
    return { props: { error: error.message } };
  }
};
