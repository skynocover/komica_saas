import React from 'react';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import * as antd from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useTranslation } from 'react-i18next';

import { AppContext, thread } from './AppContext';
import { DangerButton } from './DangerButton';

interface Member {
  createdAt: string;
  expiredAt?: string;
}

export const MemberList = ({ serviceId }: { serviceId: string }) => {
  const appCtx = React.useContext(AppContext);
  const router = useRouter();
  const { t } = useTranslation();

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
      title: t('DisplayName'),
      align: 'center',
      render: (item) => <>{item.displayName}</>,
    },
    {
      title: t('JoinTime'),
      align: 'center',
      render: (item) => <>{dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}</>,
    },
    {
      align: 'center',
      render: (item) => (
        <DangerButton
          title={t('Remove') + t('Member')}
          message={t('Remove') + t('Member')}
          onClick={() => removeMember(item.id)}
        />
      ),
    },
  ];

  return (
    <antd.Spin spinning={loading}>
      <antd.Table dataSource={dataSource} columns={columns} pagination={false} />
    </antd.Spin>
  );
};
