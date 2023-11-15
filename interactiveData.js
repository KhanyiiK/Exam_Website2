const btnLoad = document.getElementById("loadData");
const outputDiv = document.getElementById("output");
const API_KEY = "hmLb4VuZeYXJDH5eRHWTSjEjEWY57DYdYxzztVko";
let isChartsCreated = false;

btnLoad.addEventListener("click", loadAsteroidsData);

async function loadAsteroidsData() {
    const dateInput = document.getElementById('dateInput').value;
    const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${dateInput}&end_date=${dateInput}&api_key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
        displayData(data);

    } catch (error) {
        console.error("Error fetching data:", error);
        outputDiv.innerHTML = "Failed to fetch data. Please try again.";
    }
}

function displayData(data) {
    const asteroids = data.near_earth_objects;
    let velocityData = [];
    let missDistanceData = [];
    let asteroidNames = [];

    // Extracting data from the API response
    Object.values(asteroids).forEach(asteroidArr => {
        asteroidArr.forEach(asteroid => {
            let approachData = asteroid.close_approach_data[0];

            // Check if approachData is available
            if (approachData) {
                let velocity = approachData.relative_velocity.kilometers_per_second;
                let missDistance = approachData.miss_distance.kilometers;

                // Log the values to help identify the issue
                console.log("Name:", asteroid.name);
                console.log("Velocity:", velocity);
                console.log("Miss Distance:", missDistance);

                // Check if both velocity and missDistance have valid values
                if (!isNaN(parseFloat(velocity)) && !isNaN(parseFloat(missDistance))) {
                    velocityData.push(parseFloat(velocity));
                    missDistanceData.push(parseFloat(missDistance));
                    asteroidNames.push(asteroid.name);
                } else {
                    console.log("Invalid values for velocity or missDistance");
                }
            } else {
                console.log("No approachData available for", asteroid.name);
            }
        });
    });

    if (!isChartsCreated) {
        createBubbleChart('#bubbleChart', velocityData, missDistanceData, asteroidNames, outputDiv);
        isChartsCreated = true;
    }
}

function createBubbleChart(selector, dataX, dataY, labels, outputDiv) {
    const margin = { top: 20, right: 80, bottom: 40, left: 70 }; // Adjusted left margin
    const width = 550 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select(selector)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(dataX)])
        .range([0, width]);

    // Adjust the domain of the y-axis scale to cover the entire range of miss distances
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(dataY)])
        .range([height, 0]);

    const radiusScale = d3.scaleLinear()
        .domain([0, d3.max(dataX)])
        .range([5, 20]);

    const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, d3.max(dataX)]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis)
        .append('text')
        .attr('fill', '#000')
        .attr('transform', 'rotate(0)')
        .attr('x', width / 2)
        .attr('dy', 35)
        .attr('text-anchor', 'middle')
        .text('Velocity (km/s)');

    svg.append('g')
        .attr('class', 'y-axis')
        .call(yAxis);

    // Move the "Miss Distance" label to the left of the y-axis
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -75)
        .attr('x', -height / 2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Miss Distance (km)');

    const tooltip = d3.select('body').append('div')
        .style('position', 'absolute')
        .style('background', '#f9f9f9')
        .style('padding', '5px')
        .style('border', '1px solid #ccc')
        .style('border-radius', '5px')
        .style('opacity', '0');

    svg.selectAll('.dot')
        .data(dataX)
        .enter().append('circle')
        .attr('class', 'dot')
        .attr('cx', (d, i) => xScale(dataX[i]))
        .attr('cy', (d, i) => yScale(dataY[i]))
        .attr('r', (d, i) => radiusScale(dataX[i]))
        .style('fill', (d, i) => colorScale(dataX[i]))
        .on('mouseover', (event, d, i) => {
            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip.html(`${labels[i]}<br>Velocity: ${dataX[i]} km/s<br>Miss Distance: ${dataY[i]} km`)
                .style('left', (event.pageX) + 'px')
                .style('top', (event.pageY - 28) + 'px');

            // Display data from outputDiv in the tooltip
            const outputData = outputDiv.querySelectorAll('p');
            outputData.forEach(data => {
                tooltip.append('p').html(data.innerHTML);
            });
        })
        .on('mouseout', () => {
            tooltip.transition()
                .duration(500)
                .style('opacity', 0)
                .selectAll('p') // Clear appended paragraphs
                .remove();
        });
}
