import React from 'react';
import { Line } from 'react-chartjs-2';

const LineChart = ({ data }) => {
  const chartData = {
    labels: data.map(entry => entry.timestamp), // Assuming 'timestamp' is a field in your data
    datasets: [
      {
        label: 'Reported Incidents',
        data: data.map(entry => entry.incidentsCount), // Assuming 'incidentsCount' is a field in your data
        fill: false,
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: 'rgba(75,192,192,1)',
      },
    ],
  };

  const options = {
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day', // Adjust the unit as needed (day, week, month, etc.)
        },
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Number of Incidents',
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default LineChart;
