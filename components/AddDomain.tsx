import React, { useContext } from 'react';

import TextField from '@material-ui/core/TextField';
import Fab from '@material-ui/core/Fab';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import NavigationIcon from '@material-ui/icons/Navigation';
import FormControl from '@material-ui/core/FormControl';
// import Select from '@material-ui/core/Select';
import { Formik, useFormik } from 'formik';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import * as antd from 'antd';
import useSWR from 'swr';

import { AppContext } from './AppContext';

export interface service {
  id: string;
  name: string;
}

export interface domain {
  id: string;
  cfDNSID: string;
  serviceName: string;
  name: string;
  createdAt: string;
}

export const AddDomain = ({
  services,
  onSuccess,
  doRemain,
}: {
  services: service[];
  onSuccess: any;
  doRemain: number;
}) => {
  const appCtx = useContext(AppContext);
  const router = useRouter();
  const { t } = useTranslation();

  const onFinish = async (values: any) => {
    const data = await appCtx.fetch('post', '/api/service/domain', {
      serviceId: values.service,
      domainName: values.domain,
    });

    if (data) {
      appCtx.setModal(null);
      onSuccess();
    }
    // appCtx.setModal(null);
  };

  return (
    <antd.Form onFinish={onFinish}>
      <h5 className="font-weight-bold mb-4">
        新增網址 ({t('service_in_beta') + ', ' + t('term_might_change')})
      </h5>

      <antd.Form.Item
        label="服務"
        name="service"
        rules={[{ required: true, message: 'Please select servce' }]}
      >
        <antd.Select style={{ width: 120 }} onChange={() => {}}>
          {services?.map((item: any) => (
            <antd.Select.Option value={item.id}>{item.name}</antd.Select.Option>
          ))}
        </antd.Select>
      </antd.Form.Item>

      <antd.Form.Item
        label="網址"
        name="domain"
        rules={[{ required: true, message: '請輸入網址!' }]}
      >
        <antd.Input
          addonAfter={`.${new URL(process.env.NEXT_PUBLIC_DOMAIN!).host}`}
          placeholder="請輸入網址"
        />
      </antd.Form.Item>

      <antd.Form.Item className="text-center">
        <antd.Button htmlType="submit" type="primary">
          新增
        </antd.Button>
      </antd.Form.Item>
    </antd.Form>
  );
};
