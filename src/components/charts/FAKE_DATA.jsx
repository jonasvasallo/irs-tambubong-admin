export const lineChartData = {
    labels: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ],
    datasets: [
        {
            label: "Steps",
            data: [3000, 5000, 4500, 6000, 8000, 7000, 9000],
            borderColor: "rgb(75, 192, 192)"
        }
    ]
}

export const barChartData = {
    labels: ["Incident Tag 1", "Incident Tag 2", "Incident Tag 3", "Incident Tag 4", "Incident Tag 5"],
    datasets: [
        {
            label: "Number of Reported Incidents",
            data: [3, 2, 2, 1, 1],
            backgroundColor: ["rgba(255,99,132,0.2)"],
            borderColor: ["rgba(54,162,235,1)"],
            borderWidth: 1,
        }
    ]
}