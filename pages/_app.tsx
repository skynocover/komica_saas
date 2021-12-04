import React from 'react';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import { AppContext, AppProvider } from '../components/AppContext';
// import '../styles/globals.css';
// import '../mainstyle.css';
import 'tailwindcss/tailwind.css';
import 'font-awesome/css/font-awesome.min.css';
import 'antd/dist/antd.css';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/firebaseClient';
import { appWithTranslation } from 'next-i18next';
import { useTranslation, initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import { en, zh_TW } from '../locales';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: { translation: en },
      zh_TW: { translation: zh_TW },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  });

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

export default appWithTranslation(MyApp);
