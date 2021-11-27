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
import { ReDisplayname } from '../components/ReDisplayname';

import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const pageSize = 10;

export default function Index() {
  const appCtx = React.useContext(AppContext);
  const router = useRouter();

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
      title: 'Service',
      align: 'center',
      render: (item) => <>{item.Service.name}</>,
    },
    {
      title: '顯示名稱',
      align: 'center',
      dataIndex: 'displayName',
    },
    {
      title: '加入時間',
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
          修改顯示名稱
        </antd.Button>
      ),
    },
    {
      align: 'center',
      render: (item) => (
        <antd.Button type="primary" href={`/service/${item.Service.id}`} target="_blank">
          前往版面
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
            title="離開版面"
            message={'確定離開版面?'}
            onClick={() => leaveGroup(item.id)}
          />
        );
      },
    },
  ];

  const content = (
    <antd.Spin spinning={spin}>
      <div className="flex space-x-4  mb-3 ">
        <div>
          <antd.Input
            addonBefore="搜尋版面"
            onChange={(e) => setServiceName(e.target.value)}
            allowClear
            placeholder={`請輸入版面名稱`}
          />
        </div>
      </div>
      <antd.Table
        dataSource={dataSource}
        columns={columns}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: pageCount,
          onChange: (page) => getGroup(page),
        }}
      />
    </antd.Spin>
  );

  return <MainPage title="Join" content={content} />;
}
