import React from 'react';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import { AppContext, AppProvider } from '../components/AppContext';
// import '../styles/globals.css';
import 'tailwindcss/tailwind.css';
import 'font-awesome/css/font-awesome.min.css';
import 'antd/dist/antd.css';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/firebaseClient';

// import '../mainstyle.css';

const MyApp = ({ Component, pageProps }: AppProps) => {
  React.useEffect(() => {}, []);
  const [authUser, loading, error] = useAuthState(auth);
  if (loading) {
    return <></>;
  }
  return (
    <>
      <Head>
        <title>Akraft</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <AppProvider>
        <Component {...pageProps} />
      </AppProvider>
    </>
  );
};

export default MyApp;
