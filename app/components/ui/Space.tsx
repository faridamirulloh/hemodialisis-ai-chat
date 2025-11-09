import React from 'react';
import { Space as AntdSpace } from 'antd';

const { Compact: AntdCompact } = AntdSpace;

interface SpaceProps extends React.ComponentProps<typeof AntdSpace> {}
interface CompactProps extends React.ComponentProps<typeof AntdCompact> {}

interface SpaceComponent
  extends React.ForwardRefExoticComponent<React.PropsWithoutRef<SpaceProps> & React.RefAttributes<HTMLDivElement>> {
  Compact: React.FC<CompactProps>;
}

const Space = React.forwardRef<HTMLDivElement, SpaceProps>((props, ref) => {
  return <AntdSpace ref={ref} {...props} />;
}) as SpaceComponent;
Space.displayName = 'Space';

const Compact: React.FC<CompactProps> = ({ ...props }) => {
  return <AntdCompact {...props} />;
};

Space.Compact = Compact;

export default Space;
