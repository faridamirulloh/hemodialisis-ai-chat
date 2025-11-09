import React from 'react';
import { Divider as AntdDivider } from 'antd';

interface DividerProps extends React.ComponentProps<typeof AntdDivider> {}

const Divider: React.FC<DividerProps> = ({ ...props }) => {
  return <AntdDivider {...props} />;
};

export default Divider;
