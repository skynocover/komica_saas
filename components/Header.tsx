import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import Popover from '@mui/material/Popover';
import Link from 'next/link';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import * as antd from 'antd';
import Cookies from 'universal-cookie';

import { AppContext } from './AppContext';

const cookies = new Cookies();

export const Header = ({ title }: { title?: string }) => {
  const router = useRouter();
  const appCtx = React.useContext(AppContext);
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);

  const handleClose = () => setAnchorEl(null);

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const UserMenu = () => (
    <div className="overflow-hidden bg-white rounded shadow-lg">
      <div className="p-6 text-center border-b">
        <p className="text-lg font-semibold">{appCtx.auth.currentUser?.displayName}</p>
        <div className="mt-5">
          <Link href="/Setting">
            <a
              target="_blank"
              className="px-4 py-2 text-xs font-semibold text-gray-700 border rounded-full"
            >
              {t('ManageAccount')}
            </a>
          </Link>
        </div>
      </div>

      <a className="flex justify-center px-4 py-2 hover:bg-gray-100" onClick={appCtx.logout}>
        <p className="flex text-sm font-medium leading-none text-justify text-gray-800">Logout</p>
      </a>
    </div>
  );

  const handleChange = (e: any) => {
    i18n.changeLanguage(e.target.value);
    cookies.set('AkraftLanguage', e.target.value);
  };

  return (
    <>
      <header className="w-full text-gray-100 bg-gray-900 shadow body-font">
        <div className="container flex flex-col flex-wrap items-center p-5 mx-auto md:flex-row">
          <nav className="flex flex-wrap items-center text-base lg:w-2/5 md:ml-auto">
            <div className="mr-5 border-b border-transparent cursor-pointer hover:text-gray-900 hover:border-indigo-600">
              <Link href="/">Home</Link>
            </div>

            {appCtx.auth.currentUser && (
              <>
                <Link href="/Dashboard">{t('Dashboard')}</Link>
                <div className="ml-2">
                  <Link href="/Join">{t('JoinedBoard')}</Link>
                </div>
              </>
            )}

            {/* <div className="mr-5 border-b border-transparent cursor-pointer hover:text-gray-900 hover:border-indigo-600">
              <Link href="https://skynocover.github.io/komica_saas_homepage/">
                <a target="_blank">About</a>
              </Link>
            </div> */}
          </nav>
          <a className="flex items-center order-first font-medium lg:order-none lg:w-1/5 title-font lg:items-center lg:justify-center">
            <span className="ml-3 text-xl">{title}</span>
          </a>

          <div className="inline-flex ml-5 lg:w-2/5 lg:justify-end lg:ml-0">
            {appCtx.auth.currentUser ? (
              <div className="flex items-center">
                <button
                  className="h-10 pl-5 pr-5 text-blue-400 bg-gray-900 border rounded-full appearance-none hover:bg-blue-400 hover:text-gray-900 focus:outline-none"
                  onClick={handleClick}
                >
                  {appCtx.auth.currentUser.displayName}
                </button>
                <Popover
                  id={id}
                  open={open}
                  anchorEl={anchorEl}
                  onClose={handleClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                  }}
                >
                  <UserMenu />
                </Popover>
              </div>
            ) : (
              <Link href="/Login">
                <a className="px-3 py-2 ml-4 text-white bg-indigo-700 rounded-lg hover:bg-indigo-500">
                  {t('Login')}
                </a>
              </Link>
            )}
            <>
              <div className="relative inline-flex ml-2">
                <svg
                  className="absolute top-0 right-0 w-2 h-2 m-4 pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 412 232"
                >
                  <path
                    d="M206 171.144L42.678 7.822c-9.763-9.763-25.592-9.763-35.355 0-9.763 9.764-9.763 25.592 0 35.355l181 181c4.88 4.882 11.279 7.323 17.677 7.323s12.796-2.441 17.678-7.322l181-181c9.763-9.764 9.763-25.592 0-35.355-9.763-9.763-25.592-9.763-35.355 0L206 171.144z"
                    fill="#648299"
                    fillRule="nonzero"
                  />
                </svg>
                <select
                  onChange={(e) => handleChange(e)}
                  value={i18n.language}
                  className="h-10 pl-5 pr-10 text-blue-400 bg-gray-900 border rounded-full appearance-none hover:bg-blue-400 hover:text-gray-900 focus:outline-none"
                >
                  <option value="zh_TW">Chinese</option>
                  <option value="en">English</option>
                </select>
              </div>
            </>
          </div>
        </div>
      </header>
    </>
  );
};
