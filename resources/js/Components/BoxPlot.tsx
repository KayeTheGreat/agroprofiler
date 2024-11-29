import React, { useState, useEffect } from "react";
import * as d3 from "d3";

// Sample data structure (you can replace this with dynamic data passed from parent)
const heatmapData = {
    allocations: [
        { barangay: "Barangay 1", value: 10 },
        { barangay: "Barangay 2", value: 20 },
        { barangay: "Barangay 3", value: 30 },
    ],
    commodities: [
        { barangay: "Barangay 1", value: 15 },
        { barangay: "Barangay 2", value: 25 },
        { barangay: "Barangay 3", value: 35 },
    ],
    farmers: {
        Registered: [
            { barangay: "Barangay 1", value: 5 },
            { barangay: "Barangay 2", value: 10 },
            { barangay: "Barangay 3", value: 15 },
        ],
        Unregistered: [
            { barangay: "Barangay 1", value: 5 },
            { barangay: "Barangay 2", value: 10 },
            { barangay: "Barangay 3", value: 20 },
        ],
    },
    highValue: [
        { barangay: "Barangay 1", value: 10 },
        { barangay: "Barangay 2", value: 5 },
        { barangay: "Barangay 3", value: 25 },
    ],
};

const BoxPlot: React.FC = () => {
    const [selectedType, setSelectedType] = useState<string>("allocations");
    const [selectedFarmerType, setSelectedFarmerType] =
        useState<string>("Registered");
    const [data, setData] = useState<any[]>(heatmapData.allocations);

    // Update data when the selected distribution type or farmer type changes
    useEffect(() => {
        if (selectedType === "farmers") {
            // If "farmers" is selected, use the selected farmer type (Registered/Unregistered)
            setData(heatmapData.farmers[selectedFarmerType]);
        } else {
            setData(heatmapData[selectedType]);
        }
    }, [selectedType, selectedFarmerType]);

    // D3.js BoxPlot drawing function
    const drawBoxPlot = (data: any[]) => {
        const svg = d3.select("#boxplot-svg");
        svg.selectAll("*").remove(); // Clear previous chart

        const margin = { top: 10, right: 30, bottom: 40, left: 40 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const x = d3.scaleBand().range([0, width]).padding(0.1);
        const y = d3.scaleLinear().range([height, 0]);

        // Set up the SVG container
        svg.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr(
                "transform",
                "translate(" + margin.left + "," + margin.top + ")"
            );

        // Set the domains for the x and y axes
        x.domain(data.map((d) => d.barangay)); // Assuming 'barangay' is a field in your data
        y.domain([0, d3.max(data, (d) => d.value)]); // Assuming 'value' is a field for value

        // Draw the boxes for the boxplot
        svg.selectAll(".box")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "box")
            .attr("x", (d) => x(d.barangay)!)
            .attr("y", (d) => y(d.value)) // Adjust according to your data structure
            .attr("width", x.bandwidth())
            .attr("height", (d) => height - y(d.value))
            .style("fill", "#69b3a2");

        // Draw the x-axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Draw the y-axis
        svg.append("g").call(d3.axisLeft(y));
    };

    useEffect(() => {
        drawBoxPlot(data);
    }, [data]);

    return (
        <div>
            <div>
                <label>Distribution Type: </label>
                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                >
                    <option value="allocations">Allocations</option>
                    <option value="commodities">Commodities</option>
                    <option value="farmers">Farmers</option>
                    <option value="highValue">High Value Crops</option>
                </select>
            </div>

            {selectedType === "farmers" && (
                <div>
                    <label>Farmer Type: </label>
                    <select
                        value={selectedFarmerType}
                        onChange={(e) => setSelectedFarmerType(e.target.value)}
                    >
                        <option value="Registered">Registered</option>
                        <option value="Unregistered">Unregistered</option>
                    </select>
                </div>
            )}

            {/* BoxPlot */}
            <svg id="boxplot-svg"></svg>
        </div>
    );
};

export default BoxPlot;
