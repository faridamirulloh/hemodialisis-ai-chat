import React from 'react';
import { Typography as AntdTypography } from 'antd';

const { Text: AntdText, Link: AntdLink, Paragraph: AntdParagraph, Title: AntdTitle } = AntdTypography;

interface TypographyProps extends React.ComponentProps<typeof AntdTypography> {}
interface TextProps extends React.ComponentProps<typeof AntdText> {}
interface LinkProps extends React.ComponentProps<typeof AntdLink> {}
interface ParagraphProps extends React.ComponentProps<typeof AntdParagraph> {}
interface TitleProps extends React.ComponentProps<typeof AntdTitle> {}

interface TypographyComponent
  extends React.ForwardRefExoticComponent<TypographyProps & React.RefAttributes<HTMLElement>> {
  Text: typeof Text;
  Link: typeof Link;
  Paragraph: typeof Paragraph;
  Title: typeof Title;
}

const Typography = React.forwardRef<HTMLDivElement, TypographyProps>((props, ref) => {
  return <AntdTypography {...props} ref={ref} />;
}) as TypographyComponent;
Typography.displayName = 'Typography';

const Text = React.forwardRef<HTMLElement, TextProps>((props, ref) => {
  return <AntdText {...props} ref={ref} />;
});
Text.displayName = 'Text';

const Link = React.forwardRef<HTMLElement, LinkProps>((props, ref) => {
  return <AntdLink {...props} ref={ref} />;
});
Link.displayName = 'Link';

const Paragraph = React.forwardRef<HTMLDivElement, ParagraphProps>((props, ref) => {
  return <AntdParagraph {...props} ref={ref} />;
});
Paragraph.displayName = 'Paragraph';

const Title = React.forwardRef<HTMLElement, TitleProps>((props, ref) => {
  return <AntdTitle {...props} ref={ref} />;
});
Title.displayName = 'Title';

Typography.Text = Text;
Typography.Link = Link;
Typography.Paragraph = Paragraph;
Typography.Title = Title;

export default Typography;
