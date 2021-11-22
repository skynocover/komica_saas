import React from 'react';
import { GetServerSideProps, GetStaticProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import { Divider, LinkTypeMap } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Typography from '@material-ui/core/Typography';
import dayjs from 'dayjs';
import * as antd from 'antd';
import { ColumnsType } from 'antd/lib/table';
import Badge from '@mui/material/Badge';
import { makeStyles } from '@material-ui/core/styles';
import utc from 'dayjs/plugin/utc';
import ReportIcon from '@mui/icons-material/Report';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, Auth, User } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';

import { Notification } from '../components/Notification';
import { prisma } from '../database/db';
import { AppContext } from '../components/AppContext';
import { Pages } from '../components/Pagination';
import { ListThreads } from '../components/ListThread';
import { ReportForm } from '../components/ReportForm';
import { PostForm } from '../components/PostForm';
import { Thread, Reply } from '.prisma/client';
import { MainPage } from '../components/MainPage';
import { Service, service } from '../components/Service';
import { DangerButton } from '../components/DangerButton';
// import { initFirebase } from '../firebase/firebaseAdmin';
import { auth } from '../firebase/firebaseClient';
import { InviteLinkList } from '../components/InviteLinkList';
import { MemberList } from '../components/MemberList';

dayjs.extend(utc);

export default function Index({}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const appCtx = React.useContext(AppContext);
  const router = useRouter();

  const [folder, setFolder] = React.useState<boolean>(true);
  const [services, setServices] = React.useState<service[]>([]);
  const [spin, setSpin] = React.useState<boolean>(true);
  const [serviceName, setServiceName] = React.useState<string>('');

  const [authUser, loading, error] = useAuthState(auth);

  const getService = async () => {
    setSpin(true);
    const data = await appCtx.fetch('get', '/api/service?serviceName=' + serviceName);
    if (data) {
      setServices(
        data.services.map((item: any, index: number) => {
          return { ...item, key: index };
        }),
      );
    }
    setSpin(false);
  };

  const delService = async (id: string) => {
    const data = await appCtx.fetch('delete', '/api/service', { id });
    if (data) {
      getService();
    }
  };

  React.useEffect(() => {
    if (authUser) {
      getService();
    } else if (!authUser) {
      router.push('/');
    }
  }, [authUser, serviceName]);

  const finish = () => {
    getService();
    setFolder(true);
  };

  const columns: ColumnsType<service> = [
    {
      title: 'name',
      align: 'center',
      dataIndex: 'name',
    },
    {
      title: '建立時間',
      align: 'center',
      render: (item) => <>{dayjs(item.createdAt).format('YYYY-MM-DDTHH:mm')}</>,
    },
    {
      align: 'center',
      render: (item) => (
        <antd.Button type="primary" href={router.basePath + '/service/' + item.id} target="_blank">
          前往
        </antd.Button>
      ),
    },
    {
      align: 'center',
      render: (item) => (
        <antd.Popover
          content={
            item.auth.visible === 'moderator' ? '討論版僅版主可見時無法邀請' : '建立或刪除連結'
          }
        >
          <antd.Button
            type="primary"
            disabled={item.auth.visible === 'moderator'}
            onClick={() => appCtx.setModal(<InviteLinkList serviceId={item.id} />, 1000)}
          >
            邀請連結列表
          </antd.Button>
        </antd.Popover>
      ),
    },
    {
      align: 'center',
      render: (item) => (
        <antd.Button
          type="primary"
          disabled={item.auth.visible === 'moderator'}
          onClick={() => appCtx.setModal(<MemberList serviceId={item.id} />)}
        >
          成員列表
        </antd.Button>
      ),
    },
    {
      align: 'center',
      render: (item) => (
        <DangerButton title="刪除服務" message={'確認刪除?'} onClick={() => delService(item.id)} />
      ),
    },
  ];

  const content = (
    <antd.Spin spinning={spin}>
      <div className="flex justify-end mb-2">
        <div>
          <antd.Input
            addonBefore="搜尋版面"
            onChange={(e) => setServiceName(e.target.value)}
            allowClear
            placeholder={`請輸入版面名稱`}
          />
        </div>
        <div className="flex-1" />
        <antd.Button type="primary" onClick={() => setFolder(!folder)}>
          {folder ? '新增留言板' : '取消新增'}
        </antd.Button>
      </div>
      {folder || <Service finish={finish} />}
      <antd.Table
        dataSource={services}
        columns={columns}
        pagination={false}
        expandable={{
          expandedRowRender: (record) => <Service service={record} finish={finish} />,
        }}
      />
    </antd.Spin>
  );

  return <MainPage title={'Home'} content={content} />;
}

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  try {
    return { props: {} };
  } catch (error: any) {
    console.log(error.message);
    return { props: { error: error.message } };
  }
};
