import React from 'react';
import { GetServerSideProps, GetStaticProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import { PrismaClient, Prisma } from '@prisma/client';
import { useAuthState } from 'react-firebase-hooks/auth';
import TextField from '@mui/material/TextField';
import * as antd from 'antd';

import { prisma } from '../../database/db';
import { auth } from '../../firebase/firebaseClient';

import { AppContext } from '../../components/AppContext';

export default function Index({}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const appCtx = React.useContext(AppContext);
  const router = useRouter();
  const [authUser, loading] = useAuthState(auth);

  const [state, setState] = React.useState<'loginJoin' | ''>('');
  const [serviceName, setServiceName] = React.useState<string>('');
  const [displayName, setDisplayName] = React.useState<string>('');
  const [serviceId, setServiceId] = React.useState<string>('');
  const [linkId, setLinkId] = React.useState<string>('');
  const [errorDisplayName, setErrorDisplayName] = React.useState<string>('');

  const init = async () => {
    const path = router.asPath.split('/');
    const linkId = path[path.length - 1];
    setLinkId(linkId);

    const data = await appCtx.fetch('get', '/api/service/invitelinks?linkId=' + linkId);
    if (data) {
      setServiceName(data.serviceName);
      setServiceId(data.serviceId);
      console.log(data.authRequire);
      if (data.authRequire === 'anonymous') {
        router.push('/service/' + data.serviceId);
      } else if (data.authRequire === 'registered') {
        router.push('/service/' + data.serviceId);
      } else if (data.authRequire === 'invited') {
        setState('loginJoin');
      }
    }
  };

  React.useEffect(() => {
    init();
  }, []);

  const loginJoin = async () => {
    if (!displayName) {
      setErrorDisplayName('請輸入名稱');
    } else {
      setErrorDisplayName('');
      await appCtx.login();
      const data = await appCtx.fetch('post', '/api/service/member', {
        serviceId,
        linkId,
        displayName,
      });
      if (data) {
        router.push('/service/' + serviceId);
      }
    }
  };

  return (
    <>
      {state === 'loginJoin' && (
        <div className="grid gird-cols-1  h-screen ">
          <div className="flex items-end justify-center">
            <p className="font-bold text-3xl">{`您已獲邀加入${serviceName}`}</p>
          </div>
          <div>
            <div className="flex justify-center mb-2">
              <TextField
                error={!!errorDisplayName}
                helperText={errorDisplayName}
                onChange={(e) => setDisplayName(e.target.value)}
                label="幫自己取個帥氣的名字吧"
                variant="outlined"
              />
            </div>
            <div className="flex justify-center">
              <antd.Button type="primary" shape="round" onClick={() => loginJoin()}>
                Join
              </antd.Button>
            </div>
          </div>
        </div>
      )}
    </>
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
