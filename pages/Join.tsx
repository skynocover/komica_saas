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
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import { Pages } from '../components/Pagination';
import { ListThreads } from '../components/ListThread';
import { ReportForm } from '../components/ReportForm';
import { PostForm } from '../components/PostForm';
import { Thread, Reply } from '.prisma/client';
import { MainPage } from '../components/MainPage';
import { auth } from '../firebase/firebaseClient';
import { ReDisplayname } from '../components/ReDisplayname';
import { Header } from '../components/Header';

import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const pageSize = 10;

export default function Index() {
  const appCtx = React.useContext(AppContext);
  const router = useRouter();

  const { t } = useTranslation();

  const [dataSource, setDataSource] = React.useState<any[]>([]);
  const [count, setCount] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [spin, setSpin] = React.useState<boolean>(true);
  const [serviceName, setServiceName] = React.useState<string>('');

  const pageCount = Math.ceil(count / pageSize);

  const [authUser, loading, error] = useAuthState(auth);

  React.useEffect(() => {
    if (authUser) {
      getGroup();
    } else if (!authUser) {
      router.push('/');
    }
  }, [authUser, serviceName]);

  const getGroup = async (page: number = currentPage) => {
    setCurrentPage(page);
    let url = new URLSearchParams();
    url.append('offset', (pageSize * (page - 1)).toString());
    url.append('limit', pageSize.toString());
    url.append('serviceName', serviceName);
    setSpin(true);
    const data = await appCtx.fetch('get', '/api/service/group?' + url.toString());
    if (data) {
      setDataSource(data.services);
      setCount(data.count);
    }
    setSpin(false);
  };

  const leaveGroup = async (id: string) => {
    const data = await appCtx.fetch('delete', '/api/service/group', { id });
    if (data) getGroup();
  };

  const columns: ColumnsType<any> = [
    {
      title: t('Board'),
      align: 'center',
      fixed: 'left',
      render: (item) => <>{item.Service.name}</>,
    },
    {
      title: t('DisplayName'),
      align: 'center',
      dataIndex: 'displayName',
    },
    {
      title: t('JoinTime'),
      align: 'center',
      render: (item) => <>{dayjs(item.createdAt).format('YYYY-MM-DDTHH:mm')}</>,
    },
    {
      align: 'center',
      render: (item) => (
        <antd.Button
          type="primary"
          onClick={() =>
            appCtx.setModal(
              <ReDisplayname
                serviceId={item.Service.id}
                onfinished={getGroup}
                displayName={item.displayName}
              />,
            )
          }
        >
          {t('ModifyDisplayName')}
        </antd.Button>
      ),
    },
    {
      align: 'center',
      render: (item) => (
        <antd.Button type="primary" href={`/service/${item.Service.id}`} target="_blank">
          {t('Goto')}
        </antd.Button>
      ),
    },
    {
      align: 'center',
      render: (item) => {
        return item.Service.Owner.account === item.User.account ? (
          <div></div>
        ) : (
          <DangerButton
            title={t('LeaveBoard')}
            message={t('ConfirmLeave') + '?'}
            onClick={() => leaveGroup(item.id)}
          />
        );
      },
    },
  ];

  const content = (
    <antd.Spin spinning={spin}>
      <div className="flex space-x-4 my-3 ">
        <div>
          <antd.Input
            addonBefore={t('SearchBoard')}
            onChange={(e) => setServiceName(e.target.value)}
            allowClear
            placeholder={t('PleaseInputBoardName')}
          />
        </div>
      </div>
      <antd.Table
        dataSource={dataSource}
        columns={columns}
        scroll={{ x: 800 }}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: pageCount,
          onChange: (page) => getGroup(page),
        }}
      />
    </antd.Spin>
  );

  return <MainPage title={t('JoinedBoard')} content={content} />;
}
