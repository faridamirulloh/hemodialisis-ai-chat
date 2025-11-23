import React, { useState } from 'react';
import { ArrowLeftOutlined, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Form, Input, Button, Typography } from 'antd';
import { Link, useActionData, Form as RRForm } from 'react-router';
import styles from './AuthPage.module.scss';
import type { AuthFormData } from '~/types/auth';
const { Title, Text } = Typography;

const AuthPage: React.FC = () => {
  const actionData = useActionData<{ error?: string }>();
  const [mode, setMode] = useState<AuthFormData['mode']>('login');

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <Link to="/" className={styles.backButton}>
          <Button type="text" size="large" icon={<ArrowLeftOutlined style={{ fontSize: 24 }} />} />
        </Link>

        <Title level={2} className={styles.authTitle}>
          {mode === 'signup' ? 'Buat Akun' : 'Login'}
        </Title>

        {actionData?.error && <Typography.Text type="danger">{actionData.error}</Typography.Text>}

        <RRForm id="rr-auth-form" method="post" className={styles.authForm}>
          <Form component={false} name="authForm" layout="vertical">
            <Input type="hidden" name="mode" value={mode} />

            {mode === 'signup' && (
              <Form.Item name="name" label="Nama" rules={[{ required: true, message: 'Masukkan nama' }]}>
                <Input
                  name="name"
                  variant="borderless"
                  prefix={<UserOutlined style={{ paddingRight: 4 }} />}
                  placeholder="Nama Lengkap"
                />
              </Form.Item>
            )}

            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, type: 'email', message: 'Masukkan alamat email yang valid' }]}>
              <Input
                name="email"
                variant="borderless"
                prefix={<MailOutlined style={{ paddingRight: 4 }} />}
                placeholder="Alamat Email"
              />
            </Form.Item>

            <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Masukkan password' }]}>
              <Input.Password
                name="password"
                variant="borderless"
                prefix={<LockOutlined style={{ paddingRight: 4 }} />}
                placeholder="Password"
              />
            </Form.Item>

            <Button type="primary" htmlType="submit" block>
              {mode === 'signup' ? 'Daftar' : 'Login'}
            </Button>

            <div className={styles.altLink}>
              {mode === 'signup' ? (
                <Text>
                  Sudah memiliki akun?{' '}
                  <Link to="#" onClick={() => setMode('login')}>
                    Login
                  </Link>
                </Text>
              ) : (
                <Text>
                  Belum memiliki akun?{' '}
                  <Link to="#" onClick={() => setMode('signup')}>
                    Daftar
                  </Link>
                </Text>
              )}
            </div>
          </Form>
        </RRForm>
      </div>
    </div>
  );
};

export default AuthPage;
