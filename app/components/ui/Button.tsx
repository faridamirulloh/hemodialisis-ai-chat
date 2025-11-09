import React from 'react';
import { Button as AntdButton } from 'antd';

interface ButtonProps extends React.ComponentProps<typeof AntdButton> {}

const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>((props, ref) => {
  return <AntdButton {...props} ref={ref} />;
});
Button.displayName = 'Button';

export default Button;
