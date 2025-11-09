import React from 'react';
import { Flex as AntdFlex } from 'antd';

interface FlexProps extends React.ComponentProps<typeof AntdFlex> {}

const Flex = React.forwardRef<HTMLDivElement, FlexProps>((props, ref) => {
  return <AntdFlex ref={ref} {...props} />;
});
Flex.displayName = 'Flex';

export default Flex;
