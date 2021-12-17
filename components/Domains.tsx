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
import useSWR from 'swr';
import { AddDomain, service, domain } from '../components/AddDomain';

import { auth } from '../firebase/firebaseClient';

import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const pageSize = 10;

export const Domains = ({ setSpin }: { setSpin: any }) => {
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
      //   getReport();
    } else if (!authUser) {
      router.push('/');
    }
  }, [authUser]);

  const makeURL = () => {
    let params = new URLSearchParams();
    // params.append('offset', (pageSize * (currentPage - 1)).toString());
    // params.append('limit', pageSize.toString());
    return `/api/service/domain?${params.toString()}`;
  };

  const { data, error: swrErr, mutate } = useSWR(makeURL, (url) => appCtx.fetch('get', url));

  let domains: domain[] = [];
  if (data) {
    for (const item of data?.services) {
      for (const d of item.Domain) {
        domains.push({
          id: d.id,
          cfDNSID: d.cfDNSID,
          serviceName: item.name,
          name: d.name,
          createdAt: d.createdAt,
        });
      }
    }
  }

  const services: service[] = data?.services.map((item: any) => {
    return {
      id: item.id,
      name: item.name,
    };
  });

  const deleteDomain = async (id: string) => {
    const { data } = await appCtx.fetch('delete', '/api/service/domain', { id });
  };

  const columns: ColumnsType<domain> = [
    {
      title: t('Board'),
      align: 'center',
      fixed: 'left',
      render: (item) => <>{item.serviceName}</>,
    },
    {
      title: t('Domain'),
      align: 'center',
      render: (item) => (
        <antd.Typography.Paragraph className="flex items-center justify-center" copyable>{`${
          item.name
        }.${new URL(process.env.NEXT_PUBLIC_DOMAIN!).host}`}</antd.Typography.Paragraph>
      ),
    },
    {
      title: t('CreateTime'),
      align: 'center',
      render: (item) => <>{dayjs(item.createdAt).format('YYYY-MM-DDTHH:mm')}</>,
    },
    {
      align: 'center',
      render: (item) => (
        <DangerButton
          title={t('Delete') + t('Domain')}
          message={t('Confirm') + t('Delete') + t('Domain') + '?'}
          onClick={() => deleteDomain(item.id)}
        />
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-end mb-2">
        <antd.Button
          type="primary"
          disabled={data?.doRemain ? data.doRemain <= 0 : true}
          onClick={() =>
            appCtx.setModal(
              <AddDomain services={services} onSuccess={mutate} doRemain={data?.doRemain} />,
            )
          }
        >
          {data?.doRemain <= 0 ? t('wait_for_quota') : t('Add')}
        </antd.Button>
      </div>
      <antd.Spin spinning={!data}>
        <antd.Table scroll={{ x: 800 }} dataSource={domains} columns={columns} pagination={false} />
      </antd.Spin>
    </>
  );
};
