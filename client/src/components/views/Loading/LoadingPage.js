import React from 'react';
import { Spin } from 'antd';
// import { Loading } from 'react-loading-dot';

export default function LoadingPage() {
  return (
    <Spin tip="Đang tải..." size="large" style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      minHeight: '100vh',
    }}></Spin>
    // <Loading />
  )
}
