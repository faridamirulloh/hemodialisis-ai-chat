import React from 'react';
import { MessageOutlined } from '@ant-design/icons';
import { Button, Image } from 'antd';
import { Link } from 'react-router';
import styles from './HomePage.module.scss';

const HomePage = () => {
  return (
    <div className={styles.homeContainer}>
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <Image preview={false} src="/logo.png" />
          <h1 className={styles.heroTitle}>Asisten AI Hemodialisis</h1>
          <p className={styles.heroSubtitle}>
            Memberdayakan pasien dan profesional perawatan kesehatan dengan wawasan berbasis AI untuk perawatan dialisis
            yang lebih baik.
          </p>
          <div className={styles.heroButtons}>
            <Link to="/chat">
              <Button type="primary" size="large" icon={<MessageOutlined />}>
                Mulai Chat
              </Button>
            </Link>
            {/* <Link to="/about">
              <Button size="large">Tentang Kami</Button>
            </Link> */}
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} Chatbot AI Hemodialisis — Dikembangkan untuk perawatan dan edukasi pasien.</p>
      </footer>
    </div>
  );
};

export default HomePage;
