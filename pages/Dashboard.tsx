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
import utc from 'dayjs/plugin/utc';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Domains } from '../components/Domains';
import { useTranslation } from 'react-i18next';

import { AppContext } from '../components/AppContext';
import { MainPage } from '../components/MainPage';
import { Service, service } from '../components/Service';
import { DangerButton } from '../components/DangerButton';

import { auth } from '../firebase/firebaseClient';
import { InviteLinkList } from '../components/InviteLinkList';
import { MemberList } from '../components/MemberList';
import { Report } from '../components/Report';

dayjs.extend(utc);

export default function Index({}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const appCtx = React.useContext(AppContext);
  const router = useRouter();

  const [folder, setFolder] = React.useState<boolean>(true);
  const [services, setServices] = React.useState<service[]>([]);
  const [spin, setSpin] = React.useState<boolean>(true);
  const [serviceName, setServiceName] = React.useState<string>('');

  const [authUser, loading, error] = useAuthState(auth);
  const { t } = useTranslation();

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
  }, [authUser]);

  const finish = () => {
    getService();
    setFolder(true);
  };

  const columns: ColumnsType<service> = [
    {
      title: t('Name'),
      align: 'center',
      dataIndex: 'name',
      fixed: 'left',
    },
    {
      title: t('CreateTime'),
      align: 'center',
      render: (item) => <>{dayjs(item.createdAt).format('YYYY-MM-DDTHH:mm')}</>,
    },
    {
      align: 'center',
      render: (item) => (
        <antd.Button type="primary" href={'/service/' + item.id} target="_blank">
          {t('Goto')}
        </antd.Button>
      ),
    },
    {
      align: 'center',
      render: (item) => (
        <antd.Popover
          content={
            item.auth.visible === 'moderator'
              ? t('CouldInviteIfOnlyModeratorVis')
              : t('InviteYourFriendJoin')
          }
        >
          <antd.Button
            type="primary"
            disabled={item.auth.visible === 'moderator'}
            onClick={() => appCtx.setModal(<InviteLinkList serviceId={item.id} />, 1000)}
          >
            {t('InviteLinkList')}
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
          {t('MemberList')}
        </antd.Button>
      ),
    },
    {
      align: 'center',
      render: (item) => (
        <DangerButton
          title={t('DeleteBaord')}
          message={t('ConfirmDelete') + '?'}
          onClick={() => delService(item.id)}
        />
      ),
    },
  ];

  const Services = (
    <>
      <div className="flex justify-end mb-2">
        <div className="flex">
          <antd.Input
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            allowClear
            placeholder={t('PleaseInputBoardName')}
          />
          <antd.Button type="primary" onClick={() => getService()}>
            {t('SearchBoard')}
          </antd.Button>
        </div>
        <div className="flex-1" />
        <antd.Button type="primary" onClick={() => setFolder(!folder)}>
          {folder ? t('AddBoard') : t('CancelAdd')}
        </antd.Button>
      </div>
      <antd.Spin spinning={spin}>
        {folder || <Service finish={finish} />}
        <antd.Table
          scroll={{ x: 800 }}
          dataSource={services}
          columns={columns}
          pagination={false}
          expandable={{
            expandedRowRender: (record) => <Service service={record} finish={finish} />,
          }}
        />
      </antd.Spin>
    </>
  );

  const content = (
    <antd.Tabs defaultActiveKey="1">
      <antd.Tabs.TabPane tab={t('CreatedBoard')} key="1">
        {Services}
      </antd.Tabs.TabPane>
      <antd.Tabs.TabPane tab={t('ReportBoard')} key="2">
        <Report setSpin={setSpin} />
      </antd.Tabs.TabPane>
    </antd.Tabs>
  );

  return <MainPage title={t('Dashboard')} content={content} />;
}

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  try {
    return { props: {} };
  } catch (error: any) {
    console.log(error.message);
    return { props: { error: error.message } };
  }
};
