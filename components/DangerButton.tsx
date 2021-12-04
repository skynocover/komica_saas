import React from 'react';
import * as antd from 'antd';
import { useTranslation } from 'react-i18next';

interface DangerButtonProps {
  title: string;
  message: string;
  onClick?: () => void;
  disabled?: boolean;
}

const DangerButton = ({ title, message, onClick, disabled }: DangerButtonProps) => {
  const { t } = useTranslation();

  const showDialog = () => {
    antd.Modal.confirm({
      title: t('Confirm'),
      icon: <i />,
      content: message,
      okText: t('Confirm'),
      cancelText: t('Cancel'),
      onOk: onClick,
    });
  };

  return (
    <antd.Button type="primary" danger disabled={disabled} onClick={showDialog}>
      {title}
    </antd.Button>
  );
};

export { DangerButton };
