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
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    fetchNhlTeams().then(() => {
      const svg = d3.select(svgRef.current);
      makeBinnedBarchart(svg, players);
    });
  }, [players]);

  const handleSelect = (event, data) => {
    const { id } = event.target;
    const index = selected.indexOf(id);
    let newSelected = selected;
    if (index > -1) {
      newSelected = update(selected, { $splice: [[index, 1]] });
    } else {
      newSelected = update(selected, { $push: [id] });
    }
    setSelected(newSelected);
    fetchNHLTeamData(newSelected);
  };

  const fetchNhlTeams = async () => {
    const response = await fetch("https://statsapi.web.nhl.com/api/v1/teams");
    const nhlData = await response.json();
    setTeams(nhlData.teams);
  };

  const fetchNHLTeamData = async selected => {
    const teamsResponse = await fetch(
      `https://statsapi.web.nhl.com/api/v1/teams?teamId=${selected}&expand=team.roster`
    );
    const teamData = await teamsResponse.json();
    fetchNHLPlayerData(teamData);
  };

  const fetchNHLPlayerData = async teamData => {
    const players = [];

    teamData.teams.forEach(async team => {
      team.roster.roster.forEach(async player => {
        const playerResponse = await fetch(
          `https://statsapi.web.nhl.com${player.person.link}`
        );
        const playerData = await playerResponse.json();
        players.push(playerData);
      });
    });

    setPlayers(players);
  };

  return (
    <React.Fragment>
      <div>
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
      </div>
      <svg ref={svgRef} />
    </React.Fragment>
  );
};

const makeBinnedBarchart = (svg, players) => {
  d3.select("g").remove();

  const data = [
    { month: "January", count: 0 },
    { month: "February", count: 0 },
    { month: "March", count: 0 },
    { month: "April", count: 0 },
    { month: "May", count: 0 },
    { month: "June", count: 0 },
    { month: "July", count: 0 },
    { month: "August", count: 0 },
    { month: "September", count: 0 },
    { month: "October", count: 0 },
    { month: "November", count: 0 },
    { month: "December", count: 0 }
  ];

  players.forEach(player => {
    let date = new Date(player.people[0].birthDate);
    data[date.getMonth()].count += 1;
  });

  // set the margins of the graph
  const margin = { top: 20, right: 40, bottom: 30, left: 60 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  // set the ranges of the x and y axis
  const x = d3
    .scaleLinear()
    .range([0, width])
    .domain([
      0,
      d3.max(data, d => {
        return d.count;
      })
    ]);

  const colorScale = d3.scaleOrdinal(d3.schemeSet3);

  console.log(colorScale);

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
    d3.max(data, d => {
      return d.count;
    })
  ]);
  y.domain(
    data.map(d => {
      return d.month;
    })
  );

  // append the rectangles for the bar chart
  g.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("fill", d => {
      console.log(y(d.month));
      const color = colorScale(y(d.month));
      console.log(color);
      return color;
    })
    .attr("x", 0)
    .attr("width", d => {
      return d.count > 0 ? x(d.count) : 0;
    })
    .attr("y", d => {
      return y(d.month);
    })
    .attr("height", y.bandwidth())
    .on();

  // add the x Axis
  g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // add the y Axis
  g.append("g").call(d3.axisLeft(y));
};

export default App;
