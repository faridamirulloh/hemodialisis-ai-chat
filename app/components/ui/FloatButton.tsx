import React from 'react';
import { FloatButton as AntdFloatButton } from 'antd';

interface FloatButtonProps extends React.ComponentProps<typeof AntdFloatButton> {}

const FloatButton = React.forwardRef<any, FloatButtonProps>((props, ref) => {
  return <AntdFloatButton ref={ref} {...props} />;
});
FloatButton.displayName = 'FloatButton';

export default FloatButton;
