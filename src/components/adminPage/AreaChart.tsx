'use client';
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);
interface ChartData {
  labels: string[];
  datasets: {
    fill: boolean;
    label: string;
    data: number[];
    pointBorderColor: string;
    pointBorderWidth: number;
    pointBackgroundColor: string;
    borderColor: string;
    backgroundColor: string;
    borderWidth: number;
    pointRadius: number;
    pointHoverRadius: number;
  }[];
}
interface Props {
  data: ChartData;
}
export const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        title: function () {
          return '';
        },
      },
    },
    title: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        display: true,
        autoSkip: false,
        maxRotation: 45,
        minRotation: 45,
      },
    },
    y: {
      grid: {
        color: 'rgba(19, 28, 22, 0.20)', // Background color of the chart
      },
    },
  },
  maintainAspectRatio: false,
};

const AreaChart: React.FC<Props> = ({ data }) => {
  return <Line options={options} height={250} data={data} />;
};

export default AreaChart;
