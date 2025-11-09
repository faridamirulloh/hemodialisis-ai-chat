import React from 'react';
import { Col as AntdCol } from 'antd';

interface ColProps extends React.ComponentProps<typeof AntdCol> {}

const Col = React.forwardRef<HTMLDivElement, ColProps>((props, ref) => {
  return <AntdCol ref={ref} {...props} />;
});
Col.displayName = 'Col';

export default Col;
