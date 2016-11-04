"use strict";

const WIDTH = 440, HEIGHT = 200;

var root = d3.select("#phasing");
var svg = root.append("svg")
  .attr("width", WIDTH)
  .attr("height", HEIGHT);

var xScale = d3.scaleLinear()
  .domain([0, 6*Math.PI])
  .range([0, WIDTH]);
var yScale = d3.scaleLinear()
  .domain([-2.1, 2.1])
  .range([0, HEIGHT]);

var data = [];
for(var i=0; i < 4096; i++) {
  data.push(i * 100 / 4096.0); 
}

var sine = function(phase, sum) {
  var path = d3.line()
  .x(function (d) { return xScale(d); })
  .y(function (d) { 
    if(sum) {
      return yScale(Math.sin(d+phase) + Math.sin(d)); 
    } else {
      return yScale(Math.sin(d+phase)); 
    }
  });

  return { phase: phase, path: path };
}

var staticPath = svg.append('svg:path')
  .datum(data)
  .attr("stroke", "#008F95")
  .attr("stroke-width", 3)
  .attr("fill", "none")
  .attr('d', sine(0,false).path);

var phasingPath = svg.append('svg:path')
  .datum(data)
  .attr("stroke", "#EB6E80")
  .attr("stroke-width", 3)
  .attr("fill", "none")
  .attr('d', sine(0,false).path);

var sumPath = svg.append('svg:path')
  .datum(data)
  .attr("stroke", "#E9B000")
  .attr("stroke-width", 4)
  .attr("fill", "none")
  .attr('d', sine(0,true).path);

///////////////////
// Demo Controls //
///////////////////

var form = root.append("form")
var phaseSlider = form.append("input")
  .attr("type", "range")
  .attr("name", "phase")
  .attr("min", 0)
  .attr("max", 200)
  .attr("value", 0);
var phaseLabel = form.append("label")
  .attr("for", "phase")
  .text("Phase");

var sliderScale = d3.scaleLinear()
  .domain([0, 200])
  .range([0, Math.PI]);

phaseSlider.on("input", function() {
  window.requestAnimationFrame(function() {
    var phase = sliderScale(phaseSlider.node().value);
    phasingPath.datum(data).attr('d', sine(phase,false).path);
    sumPath.datum(data).attr('d', sine(phase,true).path);
  });
});
