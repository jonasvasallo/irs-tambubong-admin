import React from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { lineChartData } from './FAKE_DATA';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LineChart = ({ data, timeUnit }) => {
  const options = {
    scales: {
      x: {
        type: 'time',
        time: {
          unit: timeUnit, // Dynamic time unit based on selected timeframe
          displayFormats: {
            day: 'MMM D',
            week: 'MMM D',
            month: 'MMM YYYY',
            year: 'YYYY',
          },
        },
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Incidents',
        },
      },
    },
  };
  return (
    <Line options={options} data={data} />
  )
}

export default LineChart
