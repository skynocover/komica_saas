import React from 'react';
import { useRouter } from 'next/router';
import * as antd from 'antd';
import { useTranslation } from 'react-i18next';

import { AppContext, thread } from './AppContext';

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
  const { t } = useTranslation();

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
      <h5 className="font-weight-bold mb-4">{t('modify') + t('DisplayName')}</h5>

      <antd.Form.Item
        label={t('DisplayName')}
        name="displayName"
        rules={[{ required: true, message: t('PleaseInput') + t('DisplayName') }]}
      >
        <antd.Input
          prefix={<i className="fa fa-user" />}
          placeholder={t('PleaseInput') + t('DisplayName')}
        />
      </antd.Form.Item>

      <antd.Form.Item className="text-center">
        <antd.Button type="primary" htmlType="submit">
          {t('Modify')}
        </antd.Button>
      </antd.Form.Item>
    </antd.Form>
  );
};
