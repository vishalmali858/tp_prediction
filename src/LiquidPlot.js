import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Liquid } from '@ant-design/plots';

function LiquidPlot({ percentage }) {
  const config = {
    percent: percentage,
    shape: 'rect',
    outline: {
      border: 2,
      distance: 4,
    },
    wave: {
      length: 128,
    },
    description: "Title"
  };
  return <Liquid {...config} />;
};

export default LiquidPlot;
