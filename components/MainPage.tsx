import React from 'react';
import * as antd from 'antd';

import { AppContext } from './AppContext';
import { useRouter } from 'next/router';
import { Header } from './Header';

export default interface Menu {
  key: string;
  title: string;
  component: JSX.Element;
  icon: string;
}
interface MainPageProps {
  title: string;
  content: JSX.Element;
}

const MainPage = ({ title, content }: MainPageProps) => {
  const router = useRouter();
  const appCtx = React.useContext(AppContext);
  const [collapsed, setCollapsed] = React.useState<boolean>(true);

  return (
    <>
      <Header title={title} />
      <div className="m-3">{content}</div>
    </>
  );
};

export { MainPage };
