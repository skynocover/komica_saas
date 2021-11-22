import React from 'react';
import * as antd from 'antd';

import { AppContext } from './AppContext';
import { useRouter } from 'next/router';

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

  const menus = [
    {
      key: '/Home',
      title: '留言板列表',
      icon: 'fa fa-users',
    },
    {
      key: '/Report',
      title: '版面回報',
      icon: 'fa fa-user-secret',
    },
    {
      key: '/Join',
      title: '已加入的版面',
      icon: 'fa fa-sign-in',
    },
  ];

  const renderHeader = () => {
    return (
      <antd.Layout.Header className="flex items-center px-3 !bg-white shadow-sm z-10">
        <div>
          <span className="ml-2">{title}</span>
        </div>

        <div className="flex-1" />
        <antd.Popover
          placement="bottom"
          content={
            <div className="flex">
              <antd.Button
                type="link"
                danger
                onClick={() => {
                  appCtx.logout();
                  router.push('/');
                }}
              >
                Log Out
              </antd.Button>
            </div>
          }
        >
          <antd.Button type="link" icon={<i className="fa fa-user mr-2" />}>
            {`User : ${appCtx.auth.currentUser?.displayName}`}
          </antd.Button>
        </antd.Popover>
      </antd.Layout.Header>
    );
  };

  const renderContent = () => {
    return (
      <antd.Layout.Content className="overflow-auto">
        <div className="m-3">{content}</div>
      </antd.Layout.Content>
    );
  };

  const renderMenu = () => {
    return (
      <antd.Layout.Sider collapsible trigger={null} className="overflow-auto">
        <antd.Menu
          theme="dark"
          mode="inline"
          selectedKeys={[router.route]}
          defaultOpenKeys={[router.route]}
          onClick={({ item, key }) => {
            router.push(key);
          }}
        >
          {menus.map((menu) => {
            return (
              <antd.Menu.Item key={menu.key}>
                <span className="d-flex align-items-center">
                  <div className="anticon">
                    <i className={menu.icon} />
                  </div>
                  <span>{menu.title}</span>
                </span>
              </antd.Menu.Item>
            );
          })}
        </antd.Menu>
      </antd.Layout.Sider>
    );
  };

  return (
    <antd.Layout className="h-screen">
      {renderMenu()}

      <antd.Layout className="bg-white">
        {renderHeader()}
        {renderContent()}
      </antd.Layout>
    </antd.Layout>
  );
};

export { MainPage };
