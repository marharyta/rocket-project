
function getFuelChart(
            renderTo,
            initFuelValues = defaultInitFuelValues,
            maxAltitude = 250,
            maxFuelValueOnChart = 500
        ) {
    
    const dh = maxAltitude / (initFuelValues.length - 1);
    const initData = initFuelValues.map((fuel, i) => [Math.round(i * dh), fuel]);
    
    const chartOptions = JSON.parse(JSON.stringify(defaultChartOptions));
    
    chartOptions.xAxis.max = maxAltitude;
    chartOptions.yAxis.softMax = maxFuelValueOnChart;
    chartOptions.series[0].data = initData;
    chartOptions.chart.renderTo = renderTo;
    
    return new Highcharts.Chart(chartOptions);
}

function getFuelData(chart) {
    return chart.series[0].data.map(({ x: altitude, y: fuel }) => ({ altitude, fuel }));
}

// default values:

const defaultInitFuelValues = Array.from(new Array(10)).map(() => 200);

const defaultChartOptions = {

    legend: {
        enabled: false
    },
    
    chart: {
        animation: false
    },
    
    title: {
        text: 'Fuel consumption to altitude chart'
    },

    xAxis: {
        title: { text: 'Altitude' },
        min: 0
    },

    yAxis: {
        title: { text: 'Fuel consumption' },
        min: 0
    },

    plotOptions: {
        series: {
            stickyTracking: false
        },
        line: {
            cursor: 'ns-resize'
        }
    },

    tooltip: {
        yDecimals: 2
    },

    series: [{
        draggableY: true
    }]

};

