const width = 800;
const height = 800;
let orbits = null;

const svg = d3.select("#orbit-map")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`);

const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

const loadDataButton = document.getElementById("loadData");
loadDataButton.addEventListener("click", loadAsteroidsArt);

function loadAsteroidsArt() {
    const dateInput = document.getElementById('dateInput').value;
    const apiKey = "GoeMBuuZBNwxjErw8AJfbweuUpRIxqesP2PevTZu";
    const apiUrl = `https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=${apiKey}&date=${dateInput}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const asteroids = data.near_earth_objects;
            if (orbits === null) {
                orbits = svg.append("g").attr("class", "orbits");
            }
            renderAsteroidOrbits(asteroids);
        })
        .catch(error => console.error("Error fetching data:", error.message));
}

function renderAsteroidOrbits(asteroids) {
    asteroids.sort((a, b) => {
        return a.close_approach_data[0].miss_distance.kilometers - b.close_approach_data[0].miss_distance.kilometers;
    });

    const scale = d3.scaleLinear()
        .domain([0, d3.max(asteroids, d => d.close_approach_data[0].miss_distance.kilometers)])
        .range([10, width / 2]);

    const starPoints = 5; // Change this value to adjust the number of star points
    const starRadius = 8; // Change this value to adjust the size of the star points

    const asteroidStars = orbits.selectAll("polygon")
        .data(asteroids)
        .enter()
        .append("polygon")
        .attr("points", d => generateStarPoints(d, starPoints, starRadius))
        .attr("transform", `translate(${width / 2},${height / 2})`)
        .attr("fill", "none")
        .attr("stroke", createGradient)
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", 6)
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip.html(
                "Name: " + d.name + "<br>" +
                "Diameter: " + d.estimated_diameter.kilometers.estimated_diameter_max + " kilometers<br>" +
                "Velocity: " + d.close_approach_data[0].relative_velocity.kilometers_per_second + " km/s<br>" +
                "Miss Distance: " + d.close_approach_data[0].miss_distance.kilometers + " kilometers"
            )
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    function generateStarPoints(d, numPoints, radius) {
        const angleIncrement = (2 * Math.PI) / numPoints;
        let points = "";

        for (let i = 0; i < numPoints; i++) {
            const angle = i * angleIncrement;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            points += `${x},${y} `;
        }

        return points.trim();
    }

    // Create a radial gradient with a spectrum of colors
    function createGradient(d, i) {
        const gradientId = `gradient-${i}`;
        const gradient = orbits.append("radialGradient")
            .attr("id", gradientId)
            .attr("cx", "50%")
            .attr("cy", "50%")
            .attr("r", "50%")
            .attr("fx", "50%")
            .attr("fy", "50%");

        gradient.append("stop")
            .attr("offset", "0%")
            .style("stop-color", "red");

        gradient.append("stop")
            .attr("offset", "16.66%")
            .style("stop-color", "orange");

        gradient.append("stop")
            .attr("offset", "33.33%")
            .style("stop-color", "yellow");

        gradient.append("stop")
            .attr("offset", "50%")
            .style("stop-color", "green");

        gradient.append("stop")
            .attr("offset", "66.66%")
            .style("stop-color", "blue");

        gradient.append("stop")
            .attr("offset", "83.33%")
            .style("stop-color", "indigo");

        gradient.append("stop")
            .attr("offset", "100%")
            .style("stop-color", "violet");

        return `url(#${gradientId})`;
    }
}
