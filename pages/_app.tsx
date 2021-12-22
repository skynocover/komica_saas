import React from 'react';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import { AppProvider } from '../components/AppContext';
import 'tailwindcss/tailwind.css';
import 'font-awesome/css/font-awesome.min.css';
import 'antd/dist/antd.css';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/firebaseClient';
import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import i18nconfig from '../locales/config.json';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: i18nconfig,
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

export default MyApp;
