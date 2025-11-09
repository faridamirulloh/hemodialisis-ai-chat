import React from 'react';
import { Dropdown as AntdDropdown } from 'antd';
const { Button: AntdButton } = AntdDropdown;

interface DropdownProps extends React.ComponentProps<typeof AntdDropdown> {}
interface ButtonProps extends React.ComponentProps<typeof AntdButton> {}

const Dropdown: React.FC<DropdownProps> & { Button: React.FC<ButtonProps> } = ({ ...props }) => {
  return <AntdDropdown {...props} />;
};

const Button: React.FC<ButtonProps> = (props) => {
  return <AntdButton {...props} />;
};

Dropdown.Button = Button;

export default Dropdown;
