import React from 'react';
import { Layout as AntdLayout } from 'antd';
import type { BasicProps } from 'antd/es/layout/layout';

const { Header: AntdHeader, Footer: AntdFooter, Sider: AntdSider, Content: AntdContent } = AntdLayout;

interface LayoutProps extends React.ComponentProps<typeof AntdLayout> {}
interface SiderProps extends React.ComponentProps<typeof AntdSider> {}

interface LayoutComponent extends React.ForwardRefExoticComponent<LayoutProps & React.RefAttributes<HTMLElement>> {
  Header: typeof Header;
  Footer: typeof Footer;
  Sider: typeof Sider;
  Content: typeof Content;
}

const Layout = React.forwardRef<HTMLElement, LayoutProps>((props, ref) => {
  return <AntdLayout {...props} ref={ref} />;
}) as LayoutComponent;
Layout.displayName = 'Layout';

const Header = React.forwardRef<HTMLElement, BasicProps>((props, ref) => {
  return <AntdHeader {...props} ref={ref} />;
});
Header.displayName = 'Header';

const Footer = React.forwardRef<HTMLElement, BasicProps>((props, ref) => {
  return <AntdFooter {...props} ref={ref} />;
});
Footer.displayName = 'Footer';

const Sider = React.forwardRef<HTMLDivElement, SiderProps>((props, ref) => {
  return <AntdSider {...props} ref={ref} />;
});
Sider.displayName = 'Sider';

const Content = React.forwardRef<HTMLElement, BasicProps>((props, ref) => {
  return <AntdContent {...props} ref={ref} />;
});
Content.displayName = 'Content';

Layout.Header = Header;
Layout.Footer = Footer;
Layout.Sider = Sider;
Layout.Content = Content;

export default Layout;
