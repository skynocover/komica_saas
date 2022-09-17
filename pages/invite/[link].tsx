import React from 'react';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import { useAuthState } from 'react-firebase-hooks/auth';
import TextField from '@mui/material/TextField';
import * as antd from 'antd';
import { useTranslation } from 'react-i18next';

import { auth } from '../../firebase/firebaseClient';

import { AppContext } from '../../components/AppContext';

export default function Index({}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const appCtx = React.useContext(AppContext);
  const router = useRouter();
  const [authUser, loading] = useAuthState(auth);
  const { t } = useTranslation();

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
      if (data.redirect) {
        router.push('/service/' + data.serviceId);
        return;
      }
      setServiceName(data.serviceName);
      setServiceId(data.serviceId);
    }
  };

  React.useEffect(() => {
    init();
  }, []);

  const loginJoin = async () => {
    if (!displayName) {
      setErrorDisplayName(t('NameRequired'));
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
      {serviceName && (
        <div className="grid h-screen gird-cols-1 ">
          <div className="flex items-end justify-center">
            <p className="text-3xl font-bold">{t('InviteTo') + serviceName}</p>
          </div>
          <div>
            <div className="flex justify-center mb-2">
              <TextField
                error={!!errorDisplayName}
                helperText={errorDisplayName}
                onChange={(e) => setDisplayName(e.target.value)}
                label={t('NameYourself')}
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
