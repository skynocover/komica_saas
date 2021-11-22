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
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';

import { AppContext, thread } from './AppContext';
import { DangerButton } from './DangerButton';

interface InviteLink {
  createdAt: string;
  expiredAt?: string;
}

export const InviteLinkList = ({ serviceId }: { serviceId: string }) => {
  const appCtx = React.useContext(AppContext);
  const router = useRouter();

  const [loading, setLoading] = React.useState<boolean>(true);
  const [dataSource, setDataSource] = React.useState<InviteLink[]>([]);

  const init = async () => {
    const data = await appCtx.fetch('get', '/api/service/invitelinks?id=' + serviceId);
    if (data) setDataSource(data.Links);
    setLoading(false);
  };

  React.useEffect(() => {
    init();
  }, []);

  const createLink = async () => {
    setLoading(true);
    await appCtx.fetch('post', '/api/service/invitelinks', { id: serviceId });
    await init();
  };
  const postponeLink = async (id: string) => {
    setLoading(true);
    await appCtx.fetch('patch', '/api/service/invitelinks', { id, serviceId });
    await init();
  };
  const delLink = async (id: string) => {
    setLoading(true);
    await appCtx.fetch('delete', '/api/service/invitelinks', { id, serviceId });
    await init();
  };

  const columns: ColumnsType<InviteLink> = [
    {
      title: '連結',
      align: 'center',
      render: (item) => (
        <antd.Typography.Paragraph copyable>
          {`${router.basePath}/invite/${item.id}`}
        </antd.Typography.Paragraph>
      ),
    },
    {
      title: '過期時間',
      align: 'center',
      render: (item) => (
        <>
          {item.expiredAt ? dayjs(item.expiredAt).format('YYYY-MM-DD HH:mm') : <AllInclusiveIcon />}
        </>
      ),
    },
    {
      align: 'center',
      render: (item) => (
        <antd.Button type="primary" onClick={() => postponeLink(item.id)}>
          {item.expiredAt ? '延期七天過期' : '設定七天後過期'}
        </antd.Button>
      ),
    },

    {
      align: 'center',
      render: (item) => (
        <DangerButton title="刪除連結" message={'確認刪除?'} onClick={() => delLink(item.id)} />
      ),
    },
  ];

  return (
    <antd.Spin spinning={loading}>
      <div className="flex justify-end mb-2">
        <antd.Button type="primary" onClick={() => createLink()}>
          新增連結
        </antd.Button>
      </div>
      <antd.Table dataSource={dataSource} columns={columns} pagination={false} />
    </antd.Spin>
  );
};
