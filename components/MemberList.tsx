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

interface Member {
  createdAt: string;
  expiredAt?: string;
}

export const MemberList = ({ serviceId }: { serviceId: string }) => {
  const appCtx = React.useContext(AppContext);
  const router = useRouter();

  const [loading, setLoading] = React.useState<boolean>(true);

  const [dataSource, setDataSource] = React.useState<Member[]>([]);

  const init = async () => {
    const data = await appCtx.fetch('get', '/api/service/member?id=' + serviceId);
    if (data) setDataSource(data.members);
    setLoading(false);
  };

  React.useEffect(() => {
    init();
  }, []);

  const removeMember = async (id: string) => {
    setLoading(true);
    await appCtx.fetch('delete', '/api/service/member', { id, serviceId });
    await init();
  };

  const columns: ColumnsType<Member> = [
    {
      title: '名稱',
      align: 'center',
      render: (item) => <>{item.displayName}</>,
    },
    {
      align: 'center',
      render: (item) => (
        <DangerButton title="移除用戶" message={'移除用戶'} onClick={() => removeMember(item.id)} />
      ),
    },
  ];

  return (
    <antd.Spin spinning={loading}>
      <antd.Table dataSource={dataSource} columns={columns} pagination={false} />
    </antd.Spin>
  );
};
