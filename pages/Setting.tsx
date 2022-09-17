import React from 'react';
import { GetServerSideProps, GetStaticProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useTranslation, initReactI18next } from 'react-i18next';

import { AppContext } from '../components/AppContext';
import { auth } from '../firebase/firebaseClient';

dayjs.extend(utc);

export default function Index({}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const appCtx = React.useContext(AppContext);
  const router = useRouter();

  const [authUser, loading, error] = useAuthState(auth);
  const { t } = useTranslation();

  const [displayName, setDisplayName] = React.useState<string>(authUser?.displayName || '');

  const init = async () => {
    const { data } = await appCtx.fetch('get', '/api/setting/user');
  };

  React.useEffect(() => {
    if (authUser) {
      // init();
    } else if (!authUser) {
      router.push('/');
    }
  }, [authUser]);

  const update = async () => {
    if (!displayName) {
      appCtx.snackBar(t('NameRequired'), 'error');
      return;
    }
    const data = await appCtx.fetch('patch', '/api/setting/user', { displayName });
    if (data) {
      appCtx.snackBar('update success', 'success');
    }
  };

  return (
    <section className="py-1 bg-blueGray-50">
      <div className="w-full px-4 mx-auto mt-6 lg:w-8/12">
        <div className="relative flex flex-col w-full min-w-0 mb-6 break-words border-0 rounded-lg shadow-lg bg-blueGray-100">
          <div className="px-6 py-6 mb-0 bg-white rounded-t">
            <div className="flex justify-between text-center">
              <h6 className="text-xl font-bold text-blueGray-700">Account</h6>
              <button
                className="px-4 py-2 mr-1 text-xs font-bold text-white uppercase transition-all duration-150 ease-linear bg-pink-500 rounded shadow outline-none active:bg-pink-600 hover:shadow-md focus:outline-none"
                type="button"
                onClick={update}
              >
                Update
              </button>
            </div>
          </div>
          <div className="flex-auto px-4 py-10 pt-0 lg:px-10">
            <form>
              <h6 className="mt-3 mb-6 text-sm font-bold uppercase text-blueGray-400">
                User Information
              </h6>
              <div className="flex flex-wrap">
                <div className="w-full px-4 lg:w-6/12">
                  <div className="relative w-full mb-3">
                    <label
                      className="block mb-2 text-xs font-bold uppercase text-blueGray-600"
                      htmlFor="grid-password"
                    >
                      {t('Name')}
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-3 text-sm transition-all duration-150 ease-linear bg-white border-0 rounded shadow placeholder-blueGray-300 text-blueGray-600 focus:outline-none focus:ring"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="w-full px-4 lg:w-6/12">
                  <div className="relative w-full mb-3">
                    <label
                      className="block mb-2 text-xs font-bold uppercase text-blueGray-600"
                      htmlFor="grid-password"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      disabled
                      className="w-full px-3 py-3 text-sm transition-all duration-150 ease-linear bg-white border-0 rounded shadow placeholder-blueGray-300 text-blueGray-600 focus:outline-none focus:ring"
                      value={authUser?.email || ''}
                    />
                  </div>
                </div>
              </div>

              <hr className="mt-6 border-b-1 border-blueGray-300" />

              <h6 className="mt-3 mb-6 text-sm font-bold uppercase text-blueGray-400">Billing</h6>
              <div className="flex flex-wrap">
                <div className="w-full px-4 lg:w-12/12">
                  <div className="relative w-full mb-3">
                    <label
                      className="block mb-2 text-xs font-bold uppercase text-blueGray-600"
                      htmlFor="grid-password"
                    >
                      Plan
                    </label>
                    <input
                      disabled
                      type="text"
                      className="w-full px-3 py-3 text-sm transition-all duration-150 ease-linear bg-white border-0 rounded shadow placeholder-blueGray-300 text-blueGray-600 focus:outline-none focus:ring"
                      value="Free Always"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
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
