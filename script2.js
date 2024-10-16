function renderHourlyChart(hours, temperatures) {
    let chart = new frappe.Chart('#chart', {
        title: "Population",
        data: chartData,
        type: 'line', 
        height: 450,
        colors: ['#eb5146']
    });
}
const hours=['19:00','20:00'];
const chartData={
    labels: hours,
        datasets: [
            {
                name: "Temperature",
                type:'line',
                values: [12,18]
            }
        ]
};
renderHourlyChart(['19:00','20:00'],[12,18])