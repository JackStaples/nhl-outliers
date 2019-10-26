import React, { useState, useRef, useEffect } from "react";
import Checkbox from "./components/Checkbox";
import update from "immutability-helper";
//import useAbortableFetch from "use-abortable-fetch";

import "./App.css";
import * as d3 from "d3";

const App = () => {
  const svgRef = useRef();

  const [teams, setTeams] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    fetchNhlTeams();
    const svg = d3.select(svgRef.current);
    //makeBinnedBarchart(svg, data);
  }, []);

  const fetchNhlTeams = async () => {
    const response = await fetch("https://statsapi.web.nhl.com/api/v1/teams");
    const nhlData = await response.json();
    setTeams(nhlData.teams);
  };

  const fetchNHLTeamData = async () => {};

  const handleSelect = (event, data) => {
    const { id } = event.target;
    const index = selected.indexOf(id);
    let newSelected = selected;
    if (index > -1) {
      newSelected = update(selected, { $splice: [[index, 1]] });
    } else {
      newSelected = update(selected, { $push: [id] });
    }
    console.log(selected);
    setSelected(newSelected);
  };

  return (
    <React.Fragment>
      <h1>{selected}</h1>
      {teams.map(team => {
        return (
          <Checkbox
            data={team}
            handleSelect={handleSelect}
            id={team.id}
            key={team.id}
          />
        );
      })}
      <svg ref={svgRef} />
    </React.Fragment>
  );
};
/*
const makeBinnedBarchart = (svg, data) => {
  // set the margins of the graph
  const margin = { top: 20, right: 20, bottom: 30, left: 40 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  // set the ranges of the x and y axis
  const x = d3
    .scaleLinear()
    .range([0, width])
    .domain([
      0,
      d3.max(data, d => {
        return d.number;
      })
    ]);
  const y = d3
    .scaleBand()
    .range([0, height])
    .padding(0.1);

  // append the svg and set the margins
  svg
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  const g = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Scale the range of the data in the domains
  x.domain([
    0,
    d3.max(data, function(d) {
      return d.number;
    })
  ]);
  y.domain(
    data.map(function(d) {
      return d.name;
    })
  );

  // append the rectangles for the bar chart
  g.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .filter(d => {
      return d.selected;
    })
    .attr("class", "bar")
    .attr("x", 0)
    .attr("width", d => {
      return y(d.name);
    })
    .attr("y", d => {
      return y(d.name);
    })
    .attr("height", y.bandwidth());

  // add the x Axis
  g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // add the y Axis
  g.append("g").call(d3.axisLeft(y));
};
*/
export default App;
