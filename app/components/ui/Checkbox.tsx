import React from 'react';
import { Checkbox as AntdCheckbox, type CheckboxRef } from 'antd';

interface CheckboxProps extends React.ComponentProps<typeof AntdCheckbox> {}

interface CheckboxComponent extends React.ForwardRefExoticComponent<CheckboxProps & React.RefAttributes<CheckboxRef>> {
  Group: typeof AntdCheckbox.Group;
}

const Checkbox = React.forwardRef<CheckboxRef, CheckboxProps>((props, ref) => {
  return <AntdCheckbox ref={ref} {...props} />;
}) as CheckboxComponent;
Checkbox.displayName = 'Checkbox';

Checkbox.Group = AntdCheckbox.Group;

export default Checkbox;
