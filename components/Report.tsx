import React from 'react';
import { GetServerSideProps, GetStaticProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import * as antd from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Notification } from './Notification';
import { prisma } from '../database/db';
import { AppContext } from './AppContext';
import { DangerButton } from './DangerButton';
import { useTranslation } from 'react-i18next';

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

export const Report = ({ setSpin }: { setSpin: any }) => {
  const appCtx = React.useContext(AppContext);
  const router = useRouter();
  const { t } = useTranslation();

  const [dataSource, setDataSource] = React.useState<any[]>([]);
  const [count, setCount] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

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
      title: t('Board'),
      align: 'center',
      fixed: 'left',
      render: (item) => <>{item.Service.name}</>,
    },
    {
      title: t('ReportReason'),
      align: 'center',
      render: (item) =>
        item.reason === 'del' ? (
          <antd.Tag color="cyan">{t('DeleteRequest')}</antd.Tag>
        ) : (
          <antd.Tag color="magenta">{t('HateSpeech')}</antd.Tag>
        ),
    },
    {
      title: t('ReportContent'),
      align: 'center',
      dataIndex: 'content',
    },
    {
      title: t('ReportTime'),
      align: 'center',
      render: (item) => <>{dayjs(item.createdAt).format('YYYY-MM-DDTHH:mm')}</>,
    },
    {
      align: 'center',
      render: (item) => (
        <antd.Button type="primary" href={getLink(item)} target="_blank">
          {t('Goto')}
        </antd.Button>
      ),
    },
    {
      align: 'center',
      render: (item) => (
        <DangerButton
          title={item.Thread ? t('Delete') + t('Thread') : t('Delete') + t('Reply')}
          message={t('Confirm') + t('Delete') + '?'}
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
          title={t('DeleteReportRecord')}
          message={t('Confirm') + t('Delete') + '?'}
          onClick={() => delReport(item.id, item.Service.id)}
        />
      ),
    },
  ];

  return (
    <antd.Table
      dataSource={dataSource}
      columns={columns}
      scroll={{ x: 800 }}
      pagination={{
        current: currentPage,
        pageSize: pageSize,
        total: pageCount,
        onChange: (page) => getReport(page),
      }}
    />
  );
};
