import React from 'react';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import * as antd from 'antd';
import { ColumnsType } from 'antd/lib/table';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import { useTranslation } from 'react-i18next';

import { AppContext, thread } from './AppContext';
import { DangerButton } from './DangerButton';

interface InviteLink {
  createdAt: string;
  expiredAt?: string;
}

export const InviteLinkList = ({ serviceId }: { serviceId: string }) => {
  const appCtx = React.useContext(AppContext);
  const router = useRouter();
  const { t } = useTranslation();

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
      title: t('Link'),
      align: 'center',
      render: (item) => (
        <antd.Typography.Paragraph copyable>
          {`${process.env.NEXT_PUBLIC_DOMAIN}/invite/${item.id}`}
        </antd.Typography.Paragraph>
      ),
    },
    {
      title: t('Expiration'),
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
          {item.expiredAt ? t('SetPostPoned') : t('SetExpiration')}
        </antd.Button>
      ),
    },

    {
      align: 'center',
      render: (item) => (
        <DangerButton
          title={t('Delete')}
          message={t('ConfirmDelete') + '?'}
          onClick={() => delLink(item.id)}
        />
      ),
    },
  ];

  return (
    <antd.Spin spinning={loading}>
      <div className="flex justify-end mb-2">
        <antd.Button type="primary" onClick={() => createLink()}>
          {t('AddLink')}
        </antd.Button>
      </div>
      <antd.Table dataSource={dataSource} columns={columns} pagination={false} />
    </antd.Spin>
  );
};
