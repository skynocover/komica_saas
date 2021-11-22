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
import { useAuthState } from 'react-firebase-hooks/auth';
import { Notification } from '../components/Notification';
import { prisma } from '../database/db';
import { AppContext } from '../components/AppContext';
import { DangerButton } from '../components/DangerButton';

import { makeStyles } from '@material-ui/core/styles';
import { Pages } from '../components/Pagination';
import { ListThreads } from '../components/ListThread';
import { ReportForm } from '../components/ReportForm';
import { PostForm } from '../components/PostForm';
import { Thread, Reply } from '.prisma/client';
import { MainPage } from '../components/MainPage';
import { auth } from '../firebase/firebaseClient';

import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const pageSize = 10;

interface report {
  reason: string;
  content: string;
  createdAt: string;
  thread?: thread;
  reply?: reply;
}

interface thread {
  id: string;
  service: service;
}

interface service {
  name: string;
}

interface reply {
  id: string;
  thread: thread;
}

export default function Index({}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const appCtx = React.useContext(AppContext);
  const router = useRouter();

  const [dataSource, setDataSource] = React.useState<any[]>([]);
  const [count, setCount] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [spin, setSpin] = React.useState<boolean>(true);

  const pageCount = Math.ceil(count / pageSize);

  const [authUser, loading, error] = useAuthState(auth);

  React.useEffect(() => {
    if (authUser) {
      getReport();
    } else if (!authUser) {
      router.push('/');
    }
  }, [authUser]);

  const getReport = async (page: number = currentPage) => {
    setCurrentPage(page);
    let url = new URLSearchParams();
    url.append('offset', (pageSize * (page - 1)).toString());
    url.append('limit', pageSize.toString());
    setSpin(true);
    const data = await appCtx.fetch('get', '/api/post/report?' + url.toString());
    if (data) {
      setDataSource(data.reports);
      setCount(data.count);
    }
    setSpin(false);
  };

  const delReport = async (id: string, serviceId: string) => {
    await appCtx.fetch('delete', '/api/post/report', { id, serviceId });
    getReport();
  };

  const delThread = async (id: string, serviceId: string, reportId: string) => {
    await appCtx.fetch('delete', '/api/post/thread', { id, serviceId, reportId });
    getReport();
  };

  const delReply = async (id: string, serviceId: string, reportId: string) => {
    await appCtx.fetch('delete', '/api/post/reply', { id, serviceId, reportId });
    getReport();
  };

  const getLink = (item: any) => {
    return (
      `/service/${item.Service.id}/` +
      (item.Thread ? item.Thread.id : `${item.Reply.Thread.id}#${item.Reply.id}`)
    );
  };

  const columns: ColumnsType<report> = [
    {
      title: 'Service',
      align: 'center',
      render: (item) => <>{item.Service.name}</>,
    },
    {
      title: '回報原因',
      align: 'center',
      render: (item) =>
        item.reason === 'del' ? (
          <antd.Tag color="cyan">刪文請求</antd.Tag>
        ) : (
          <antd.Tag color="magenta">引戰</antd.Tag>
        ),
    },
    {
      title: '回報內容',
      align: 'center',
      dataIndex: 'content',
    },
    {
      title: '回報時間',
      align: 'center',
      render: (item) => <>{dayjs(item.createdAt).format('YYYY-MM-DDTHH:mm')}</>,
    },
    {
      align: 'center',
      render: (item) => (
        <antd.Button type="primary" href={router.basePath + getLink(item)} target="_blank">
          前往此文
        </antd.Button>
      ),
    },
    {
      align: 'center',
      render: (item) => (
        <DangerButton
          title={item.Thread ? '刪除討論串' : '刪除回覆'}
          message={'確認刪除?'}
          onClick={() =>
            item.Thread
              ? delThread(item.Thread.id, item.Service.id, item.id)
              : delReply(item.Reply.id, item.Service.id, item.id)
          }
        />
      ),
    },
    {
      align: 'center',
      render: (item) => (
        <DangerButton
          title="刪除回報紀錄"
          message={'確認刪除?'}
          onClick={() => delReport(item.id, item.Service.id)}
        />
      ),
    },
  ];

  const content = (
    <antd.Spin spinning={spin}>
      <antd.Table
        dataSource={dataSource}
        columns={columns}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: pageCount,
          onChange: (page) => getReport(page),
        }}
      />
    </antd.Spin>
  );

  return <MainPage title="Report" content={content} />;
}

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  try {
    return { props: {} };
  } catch (error: any) {
    console.log(error.message);
    return { props: { error: error.message } };
  }
};
