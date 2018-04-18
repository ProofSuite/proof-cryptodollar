import React from 'react'
import { Spin } from 'antd'

import styled from 'styled-components'

const LoaderLayout = () => {
  return (
    <SpinnerContainer>
      <Spin tip='Loading...' size='large'></Spin>
    </SpinnerContainer>
  )
}

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  height: 100vh;
  align-items: center;

`

export default LoaderLayout
