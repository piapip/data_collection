import React from 'react';
import { Spin } from 'antd';

export default function LoadingPage() {
  return (
    <Spin tip="Đang tải..." size="large" style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      minHeight: 'calc(100vh - 80px)',
    }}></Spin>
    // <Loading />
  )
}
