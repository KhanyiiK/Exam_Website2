// Function to generate a random color with a specified opacity
function getRandomColor() {
    const hue = Math.floor(Math.random() * 360); // Random hue between 0 and 360
    const saturation = 70; // Constant saturation
    const lightness = 60; // Constant lightness

    const color = `hsla(${hue}, ${saturation}%, ${lightness}%, `;
    const opacity = Math.random();  // Random opacity between 0 and 1

    return `${color}${opacity})`;
}

// Set up the SVG and tooltip
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

// Set up the button click event listener
const loadDataButton = document.getElementById("loadData");
loadDataButton.addEventListener("click", loadAsteroidsArt);

// Function to load asteroid data
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

// Function to render asteroid orbits
// Function to render asteroid orbits
function renderAsteroidOrbits(asteroids) {
    asteroids.sort((a, b) => {
        return a.close_approach_data[0].miss_distance.kilometers - b.close_approach_data[0].miss_distance.kilometers;
    });

    const starRadius = Math.min(width, height) / 4; // Radius of the star pattern

    const asteroidOrbits = orbits.selectAll("circle")
        .data(asteroids)
        .enter()
        .append("circle")
        .attr("cx", (d, i) => width / 2 + starRadius * Math.cos((i / asteroids.length) * 2 * Math.PI))
        .attr("cy", (d, i) => height / 2 + starRadius * Math.sin((i / asteroids.length) * 2 * Math.PI))
        .attr("r", (d, i) => starRadius * (i / asteroids.length))
        .attr("fill", getRandomColor)  // Use the updated function here
        .attr("stroke", "none")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", 2)
        .on("mouseover", function (event, d) {
            const circle = d3.select(this);

            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip.html(
                `<strong>Name:</strong> ${d.name}<br>` +
                `<strong>Diameter:</strong> ${d.estimated_diameter.kilometers.estimated_diameter_max} kilometers<br>` +
                `<strong>Velocity:</strong> ${d.close_approach_data[0].relative_velocity.kilometers_per_second} km/s<br>` +
                `<strong>Miss Distance:</strong> ${d.close_approach_data[0].miss_distance.kilometers} kilometers`
            )
            .style("left", (parseFloat(circle.attr("cx")) + 5) + "px")
            .style("top", (parseFloat(circle.attr("cy")) - 28) + "px");

            // Display the random color in the tooltip
            tooltip.style("background", getRandomColor());
        })
        .on("mouseout", () => {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
}
