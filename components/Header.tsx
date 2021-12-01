import React, { useCallback } from 'react';
import ImageViewer from 'react-simple-image-viewer';
import { useRouter } from 'next/router';
import Popover from '@mui/material/Popover';
import Button from '@mui/material/Button';
import Link from 'next/link';

import * as antd from 'antd';

import { AppContext } from './AppContext';

export const Header = ({ title }: { title?: string }) => {
  const router = useRouter();
  const appCtx = React.useContext(AppContext);

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);

  const handleClose = () => setAnchorEl(null);

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const UserMenu = () => (
    <div className="bg-white rounded overflow-hidden shadow-lg">
      <div className="text-center p-6  border-b">
        <p className="text-lg font-semibold">{appCtx.auth.currentUser?.displayName}</p>
        <div className="mt-5">
          <a href="#" className="border rounded-full py-2 px-4 text-xs font-semibold text-gray-700">
            Manage your Account
          </a>
        </div>
      </div>
      <div className="border-b">
        <Link href="/Dashboard">
          <a className="px-4 py-2 hover:bg-gray-100 flex">
            <div className="text-gray-800">
              <svg
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                viewBox="0 0 24 24"
                className="w-5 h-5"
              >
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="pl-3">
              <p className="text-sm font-medium text-gray-800 leading-none">管理討論版</p>
              <p className="text-xs text-gray-500">管理版面 &amp; 成員</p>
            </div>
          </a>
        </Link>

        <Link href="/Join">
          <a className="px-4 py-2 hover:bg-gray-100 flex">
            <div className="text-gray-800">
              <svg
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                viewBox="0 0 24 24"
                className="w-5 h-5"
              >
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="pl-3">
              <p className="text-sm font-medium text-gray-800 leading-none">管理加入的版面</p>
              <p className="text-xs text-gray-500">修改名稱 &amp; 離開版面 </p>
            </div>
          </a>
        </Link>

        {/* <a href="#" className="px-4 py-2 hover:bg-gray-100 flex">
          <div className="text-gray-800">
            <svg
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
              viewBox="0 0 24 24"
              className="w-5 h-5"
            >
              <path d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="pl-3">
            <p className="text-sm font-medium text-gray-800 leading-none">Personal settings</p>
            <p className="text-xs text-gray-500">Email, profile, notifications</p>
          </div>
        </a>
        <a href="#" className="px-4 py-2 hover:bg-gray-100 flex">
          <div className="text-green-600">
            <svg
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
              viewBox="0 0 24 24"
              className="w-5 h-5"
            >
              <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div className="pl-3">
            <p className="text-sm font-medium text-gray-800 leading-none">
              Apps &amp; integrations
            </p>
            <p className="text-xs text-gray-500">Google, slack, mail</p>
          </div>
        </a> */}
      </div>

      <div className="">
        {/* <a href="#" className="px-4 py-2 pb-4 hover:bg-gray-100 flex">
          <p className="text-sm font-medium text-gray-800 leading-none">Support FAQ</p>
        </a> */}
        <a className="px-4 py-2 pb-4 hover:bg-gray-100 flex" onClick={appCtx.logout}>
          <p className="text-sm font-medium text-gray-800 leading-none">Logout</p>
        </a>
      </div>
    </div>
  );

  return (
    <>
      <header className="text-gray-100 bg-gray-900 body-font shadow w-full">
        <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
          <nav className="flex lg:w-2/5 flex-wrap items-center text-base md:ml-auto">
            <div className="mr-5 hover:text-gray-900 cursor-pointer border-b border-transparent hover:border-indigo-600">
              <Link href="/">Home</Link>
            </div>

            <div className="mr-5 hover:text-gray-900 cursor-pointer border-b border-transparent hover:border-indigo-600">
              <Link href="https://skynocover.github.io/komica_saas_homepage/">
                <a target="_blank">About</a>
              </Link>
            </div>
          </nav>
          <a className="flex order-first lg:order-none lg:w-1/5 title-font font-medium items-center lg:items-center lg:justify-center">
            <span className="ml-3 text-xl">{title}</span>
          </a>

          <div className="lg:w-2/5 inline-flex lg:justify-end ml-5 lg:ml-0">
            {appCtx.auth.currentUser ? (
              <>
                <antd.Button
                  aria-describedby={id}
                  type="link"
                  onClick={handleClick}
                  icon={<i className="fa fa-user mr-2" />}
                >
                  {appCtx.auth.currentUser.displayName}
                </antd.Button>
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
              </>
            ) : (
              <Link href="/Login">
                <a className="bg-indigo-700 hover:bg-indigo-500 text-white ml-4 py-2 px-3 rounded-lg">
                  Login
                </a>
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
