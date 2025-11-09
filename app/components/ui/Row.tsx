import React from 'react';
import { Row as AntdRow } from 'antd';

interface RowProps extends React.ComponentProps<typeof AntdRow> {}

const Row = React.forwardRef<HTMLDivElement, RowProps>((props, ref) => {
  return <AntdRow ref={ref} {...props} />;
});
Row.displayName = 'Row';

export default Row;
