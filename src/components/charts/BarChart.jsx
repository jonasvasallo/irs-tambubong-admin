import React from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { lineChartData } from './FAKE_DATA';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ data }) => {
    const options = {};
    const chartData = {
        labels: data.labels,
        datasets: [
          {
            label: "Number of Reported Incidents",
            data: data.data,
            backgroundColor: ["rgba(255,99,132,0.2)"],
            borderColor: ["rgba(54,162,235,1)"],
            borderWidth: 1,
          }
        ]
      };
  return (
    <Bar options={options} data={chartData}/>
  )
}

export default BarChart