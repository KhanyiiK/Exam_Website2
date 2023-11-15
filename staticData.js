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

    for (let date in asteroids) {
        asteroids[date].forEach(asteroid => {
            let velocity = asteroid.close_approach_data[0].relative_velocity.kilometers_per_second;
            let missDistance = asteroid.close_approach_data[0].miss_distance.kilometers;
            velocityData.push(parseFloat(velocity));
            missDistanceData.push(parseFloat(missDistance));
            asteroidNames.push(asteroid.name);
        });
    }

    if (!isChartsCreated) {
        createBarChart('#velocityChart', velocityData, 'Asteroid Velocity (km/s)', 'Asteroid Name');
        createScatterChart('#missDistanceChart', missDistanceData, 'Miss Distance from Earth (km)', 'Asteroid Name');
        isChartsCreated = true;
    }
}

function createBarChart(selector, data, label, labelX) {
    const margin = { top: 20, right: 80, bottom: 40, left: 50 };
    const width = 550 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select(selector)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().domain(data.map((d, i) => i)).range([0, width]).padding(0.1);
    const y = d3.scaleLinear().domain([0, d3.max(data)]).nice().range([height, 0]);

    // Create a tooltip
    const tooltip = d3.select('body').append('div')
        .style('position', 'absolute')
        .style('background', '#f9f9f9')
        .style('padding', '5px')
        .style('border', '1px solid #ccc')
        .style('border-radius', '5px')
        .style('opacity', '0');

    svg.append('text')
        .attr('x', width / 2)
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .style('font-weight', 'light')
        .text(label);

    svg.append('g')
        .selectAll('.bar')
        .data(data)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', (d, i) => x(i))
        .attr('y', d => y(d))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d))
        .style('fill', 'hsla(31, 17%, 36%, 1)')
        .on('mouseover', (event, d) => {
            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip.html("Value: " + d)
                .style('left', (event.pageX) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', () => {
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });

    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .append('text')
        .attr('fill', '#000')
        .attr('transform', 'rotate(0)')
        .attr('x', width / 2)
        .attr('dy', 35)
        .attr('text-anchor', 'middle')
        .text(labelX);

    svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y).ticks(5))
        .append('text')
        .attr('fill', '#000')
        .attr('transform', 'rotate(-90)')
        .attr('y', -40)
        .attr('dy', 0)
        .attr('text-anchor', 'end')
        .text(label);
}

function createScatterChart(selector, data, label, labelX) {
    const margin = { top: 20, right: 80, bottom: 40, left: 50 };
    const width = 550 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select(selector)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().domain(data.map((d, i) => i)).range([0, width]).padding(0.1);
    const y = d3.scaleLinear().domain([0, d3.max(data)]).nice().range([height, 0]);

    // Create a tooltip
    const tooltip = d3.select('body').append('div')
        .style('position', 'absolute')
        .style('background', '#f9f9f9')
        .style('padding', '5px')
        .style('border', '1px solid #ccc')
        .style('border-radius', '5px')
        .style('opacity', '0');

    svg.append('text')
        .attr('x', width / 2)
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .style('font-weight', 'light')
        .text(label);

    svg.selectAll('.dot')
        .data(data)
        .enter().append('circle')
        .attr('class', 'dot')
        .attr('cx', (d, i) => x(i) + x.bandwidth() / 2)
        .attr('cy', d => y(d))
        .attr('r', 5)
        .style('fill', 'hsla(30, 30%, 58%, 1)')
        .on('mouseover', (event, d) => {
            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip.html("Value: " + d)
                .style('left', (event.pageX) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', () => {
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });

    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .append('text')
        .attr('fill', '#000')
        .attr('transform', 'rotate(0)')
        .attr('x', width / 2)
        .attr('dy', 35)
        .attr('text-anchor', 'middle')
        .text(labelX);

    svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y).ticks(5))
        .append('text')
        .attr('fill', '#000')
        .attr('transform', 'rotate(-90)')
        .attr('y', -40)
        .attr('dy', 0)
        .attr('text-anchor', 'end')
        .text(label);
}

// Add the event listener for the button
document.getElementById("loadData").addEventListener("click", loadAsteroidsData);

