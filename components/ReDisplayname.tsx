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
import TextField from '@material-ui/core/TextField';
import Fab from '@material-ui/core/Fab';
import NavigationIcon from '@material-ui/icons/Navigation';

import { AppContext, thread } from './AppContext';
import { DangerButton } from './DangerButton';

interface Member {
  createdAt: string;
  expiredAt?: string;
}

export const ReDisplayname = ({
  serviceId,
  onfinished,
  displayName,
}: {
  serviceId: string;
  displayName: string;
  onfinished: any;
}) => {
  const appCtx = React.useContext(AppContext);
  const router = useRouter();

  const changeName = async (values: any) => {
    appCtx.setModal(null);
    const data = await appCtx.fetch('patch', '/api/service/group', {
      serviceId,
      displayName: values.displayName,
    });
    if (data) onfinished();
  };

  return (
    <antd.Form onFinish={changeName} initialValues={{ displayName }}>
      <h5 className="font-weight-bold mb-4">修改顯示名稱</h5>

      <antd.Form.Item
        label="顯示名稱"
        name="displayName"
        rules={[{ required: true, message: '請輸入顯示名稱' }]}
      >
        <antd.Input prefix={<i className="fa fa-user" />} placeholder="請輸入顯示名稱" />
      </antd.Form.Item>

      <antd.Form.Item className="text-center">
        <antd.Button type="primary" htmlType="submit">
          修改
        </antd.Button>
      </antd.Form.Item>
    </antd.Form>
  );
};
