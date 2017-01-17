(() => {
"use strict";

const WIDTH = 440, HEIGHT = 200;

let root = d3.select("#phasing");
let svg = root.append("svg")
  .attr("width", WIDTH)
  .attr("height", HEIGHT);

let xScale = d3.scaleLinear()
  .domain([0, 6*Math.PI])
  .range([0, WIDTH]);
let yScale = d3.scaleLinear()
  .domain([-2.1, 2.1])
  .range([0, HEIGHT]);

let data = [];
for(let i=0; i < 4096; i++) {
  data.push(i * 100 / 4096.0); 
}

let sine = function(phase, sum) {
  let path = d3.line()
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

let staticPath = svg.append('svg:path')
  .datum(data)
  .attr("stroke", "#008F95")
  .attr("stroke-width", 3)
  .attr("fill", "none")
  .attr('d', sine(0,false).path);

let phasingPath = svg.append('svg:path')
  .datum(data)
  .attr("stroke", "#EB6E80")
  .attr("stroke-width", 3)
  .attr("fill", "none")
  .attr('d', sine(0,false).path);

let sumPath = svg.append('svg:path')
  .datum(data)
  .attr("stroke", "#E9B000")
  .attr("stroke-width", 4)
  .attr("fill", "none")
  .attr('d', sine(0,true).path);

///////////////
// Synthesis //
///////////////

let audioCtx = new (window.AudioContext || window.webkitAudioContext)();

let oscNode = audioCtx.createOscillator();
let gainNode = audioCtx.createGain();

oscNode.type = 'sine';
oscNode.frequency.value = 440;
gainNode.gain.value = 0;

oscNode.connect(gainNode);
gainNode.connect(audioCtx.destination);
oscNode.start();

///////////////////
// Demo Controls //
///////////////////

let form = root.append("form")

let phaseSlider = form.append("input")
  .attr("type", "range")
  .attr("name", "phase")
  .attr("min", 0)
  .attr("max", 200)
  .attr("value", 0);
let phaseLabel = form.append("label")
  .attr("for", "phase")
  .text("Phase");

let muteButton = form.append('input')
  .attr('type', 'checkbox')
  .attr('name', 'phaseMute')
  .attr('checked', true);
let muteLabel = form.append('label')
  .attr('for', 'phaseMute')
  .text('Mute');

let sliderScale = d3.scaleLinear()
  .domain([0, 200])
  .range([0, Math.PI]);

let audioScale = d3.scaleLinear()
  .domain([0, 200])
  .range([1.0, 0.0]);

phaseSlider.on("input", () => {
  window.requestAnimationFrame(() => {
    let phase = sliderScale(phaseSlider.node().value);
    phasingPath.datum(data).attr('d', sine(phase,false).path);
    sumPath.datum(data).attr('d', sine(phase,true).path);

    if(!muteButton.node().checked) {
      gainNode.gain.value = audioScale(phaseSlider.node().value);
    }
  });
});

muteButton.on("input", () => {
  if(muteButton.node().checked) {
    gainNode.gain.value = 0;
  } else {
    gainNode.gain.value = audioScale(phaseSlider.node().value);
  }
});
})();
