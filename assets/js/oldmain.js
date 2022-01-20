/**
* main.js
**/

class LineChart {
  constructor(data, params) {
    // setup
    const margin = {top: 10, right: 40, bottom: 45, left: 80},
    width = 800,
    svgWidth = width - margin.right - margin.left,
    height = 400,
    svgHeight = height - margin.top - margin.bottom;

    const lineWeight = 3;

    const svg = d3.select(params.selector).append("svg")
                  .attr("width", width + margin.right + margin.left)
                  .attr("height", height + margin.top + margin.bottom)
                .append('g')
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Escalas
    const x = d3.scaleLinear()
    .domain(d3.extent(data, params.x))
    .range([0, svgWidth]),
    xAxis = d3.axisBottom(x).tickFormat(d3.format("0"));

    const y = d3.scaleLinear()
    .domain([0, d3.max(data, params.y)])
    .range([svgHeight, 0]),
    yAxis = d3.axisLeft(y);

    // Eixo X
    svg.append('g')
    .attr("transform", "translate(0, " + svgHeight + ")")
    .attr("class", "x axis")
    .call(xAxis);

    svg.append("text")
    .attr("transform", "translate(" + (svgWidth/2) + "," + (svgHeight + margin.bottom - 3) + ")")
    .attr("class", "label")
    .style("text-anchor", "middle")
    .style("font-family", "Lato")
    .style("font-size", "14px")
    .text("Ano");

    // Eixo Y
    svg.append('g')
    .attr("class", "y axis")
    .call(yAxis);

    svg.append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("x", 0 - (svgHeight / 2))
    .attr("y", 0 - margin.left + 10)
    .style("text-anchor", "middle")
    .style("font-family", "Lato")
    .style("font-size", "14px")
    .text("Qtd. de Veículos");

    // 7. d3's line generator
    var line = d3.line()
    .x(d => x(params.x(d))) // set the x values for the line generator
    .y(d => y(params.y(d))) // set the y values for the line generator
    .curve(d3.curveMonotoneX) // apply smoothing to the line

    // 9. Append the path, bind the data, and call the line generator
    svg.append("path")
    .datum(data) // 10. Binds data to the line
    .attr("class", "line") // Assign a class for styling
    .attr("d", line) // 11. Calls the line generator
    .style("stroke", "#7d96ac")
    .style("stroke-width", lineWeight)
    .style("fill", "none");

    // 12. Appends a circle for each datapoint
    svg.selectAll(".dot")
    .data(data)
    .enter().append("circle") // Uses the enter().append() method
    .attr("class", "dot") // Assign a class for styling
    .attr("cx", d => x(params.x(d)))
    .attr("cy", d => y(params.y(d)))
    .attr("r", lineWeight * 1.5)
    .style("fill", "#476b8a");

    return svg.node();
  }
}

d3.csv("./assets/data/01-ANO-QTD-VEICULOS.csv", d3.autoType).then(function(data) {

  data.forEach(function(d) {
    const parseTime = d3.timeParse("%Y");
    d.NUM_EXERCICIO = parseTime(d.NUM_EXERCICIO);
  });

  data = data.sort((a, b) => d3.ascending(a.NUM_EXERCICIO, b.NUM_EXERCICIO));

  const chart = new LineChart(data, {
    selector: "#view-1",
    x: d => d["NUM_EXERCICIO"].getFullYear(),
    y: d => d["QTD_CHASSI"],
  });
});


d3.csv("./assets/data/02-ANO-QTD-TIPO-VEICULOS@1.csv", d3.autoType).then(function(data) {

  const chart = vl.markBar().data(data).encode(
    vl.x().fieldN("NUM_EXERCICIO").title("Ano"),
    vl.y().fieldQ("QtdChassi")
      .stack("normalize")
      .title("Qtd. Veículos"),
    vl.color().fieldN("TipoVeiculo"),
  ).toObject();

  const opt = {renderer: "canvas", actions: false};  /* Options for the embedding */
  vegaEmbed("#view-2", chart, opt);
});

d3.csv("./assets/data/06-VEICULOS-TIPO-MONTADORAS@1.csv", d3.autoType).then(function(data) {

  const n = 8,
        k = 20,
        duration = 200;

  const barSize = 48,
        margin = ({top: 16, right: 6, bottom: 6, left: 0}),
        height = margin.top + barSize * n + margin.bottom,
        width = 800;

  const x = d3.scaleLinear([0, 1], [margin.left, width - margin.right]);

  const y = d3.scaleBand()
            .domain(d3.range(n + 1))
            .rangeRound([margin.top, margin.top + barSize * (n + 1 + 0.1)])
            .padding(0.1);

  function color(params) {
    const scale = d3.scaleOrdinal(d3.schemeTableau10);
    if (data3.some(d => d.TipoVeiculo !== undefined)) {
      const categoryByName = new Map(data3.map(d => [d.Montadora, d.TipoVeiculo]))
      scale.domain(Array.from(categoryByName.values()));
      return d => scale(categoryByName.get(d.Montadora));
    }
    return d => scale(d.Montadora);
  }

  const formatNumber = d3.format(",d");
  const formatDate = d3.utcFormat("%m/%Y");

  const names = names = new Set(data3.map(d => d.Montadora));

  const datevalues = Array.from(d3.rollup(data3, ([d]) => d.QTD_CHASSI, d => +d.NUM_EXERCICIO, d => d.Montadora))
                          .map(([date, data3]) => [new Date(date, 0, 1), data3])
                          .sort(([a], [b]) => d3.ascending(a, b));

  function rank(value) {
    const data = Array.from(names, name => ({name, value: value(name)}));
    data.sort((a, b) => d3.descending(a.value, b.value));

    for (let i = 0; i < data.length; ++i) {
      data[i].rank = Math.min(n, i);
    }

    return data;
  }

  const keyframes = [];

  let ka, a, kb, b;

  for ([[ka, a], [kb, b]] of d3.pairs(datevalues)) {
    for (let i = 0; i < k; ++i) {
      const t = i / k;
      keyframes.push([
        new Date(ka * (1 - t) + kb * t),
        rank(name => (a.get(name) || 0) * (1 - t) + (b.get(name) || 0) * t)
      ]);
    }
  }

  keyframes.push([new Date(kb), rank(name => b.get(name) || 0)]);

  const nameframes = d3.groups(keyframes.flatMap(([, data]) => data), d => d.name);

  const prev = new Map(nameframes.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a])));
  const next = new Map(nameframes.flatMap(([, data]) => d3.pairs(data)));

  function bars(svg) {
    let bar = svg.append("g")
        .attr("fill-opacity", 0.6)
      .selectAll("rect");

    return ([date, data], transition) => bar = bar
      .data(data.slice(0, n), d => d.name)
      .join(
        enter => enter.append("rect")
          .attr("fill", color)
          .attr("height", y.bandwidth())
          .attr("x", x(0))
          .attr("y", d => y((prev.get(d) || d).rank))
          .attr("width", d => x((prev.get(d) || d).value) - x(0)),
        update => update,
        exit => exit.transition(transition).remove()
          .attr("y", d => y((next.get(d) || d).rank))
          .attr("width", d => x((next.get(d) || d).value) - x(0))
      )
      .call(bar => bar.transition(transition)
        .attr("y", d => y(d.rank))
        .attr("width", d => x(d.value) - x(0)));
  }

  function labels(svg) {
    let label = svg.append("g")
        .style("font", "bold 12px var(--sans-serif)")
        .style("font-variant-numeric", "tabular-nums")
        .attr("text-anchor", "end")
      .selectAll("text");

    return ([date, data], transition) => label = label
      .data(data.slice(0, n), d => d.name)
      .join(
        enter => enter.append("text")
          .attr("transform", d => `translate(${x((prev.get(d) || d).value)},${y((prev.get(d) || d).rank)})`)
          .attr("y", y.bandwidth() / 2)
          .attr("x", -6)
          .attr("dy", "-0.25em")
          .text(d => d.name)
          .call(text => text.append("tspan")
            .attr("fill-opacity", 0.7)
            .attr("font-weight", "normal")
            .attr("x", -6)
            .attr("dy", "1.15em")),
        update => update,
        exit => exit.transition(transition).remove()
          .attr("transform", d => `translate(${x((next.get(d) || d).value)},${y((next.get(d) || d).rank)})`)
          .call(g => g.select("tspan").tween("text", d => textTween(d.value, (next.get(d) || d).value)))
      )
      .call(bar => bar.transition(transition)
        .attr("transform", d => `translate(${x(d.value)},${y(d.rank)})`)
        .call(g => g.select("tspan").tween("text", d => textTween((prev.get(d) || d).value, d.value))));
  }

  function axis(svg) {
    const g = svg.append("g")
        .attr("transform", `translate(0,${margin.top})`);

    const axis = d3.axisTop(x)
        .ticks(width / 160)
        .tickSizeOuter(0)
        .tickSizeInner(-barSize * (n + y.padding()));

    return (_, transition) => {
      g.transition(transition).call(axis);
      g.select(".tick:first-of-type text").remove();
      g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "white");
      g.select(".domain").remove();
    };
  }

  function ticker(svg) {
    const now = svg.append("text")
        .style("font", `bold ${barSize}px var(--sans-serif)`)
        .style("font-variant-numeric", "tabular-nums")
        .attr("text-anchor", "end")
        .attr("x", width - 6)
        .attr("y", margin.top + barSize * (n - 0.45))
        .attr("dy", "0.32em")
        .text(formatDate(keyframes[0][0]));

    return ([date], transition) => {
      transition.end().then(() => now.text(formatDate(date)));
    };
  }

  function textTween(a, b) {
    const i = d3.interpolateNumber(a, b);
    return function(t) {
      this.textContent = formatNumber(i(t));
    };
  }

  const svg = d3.select("#view-3").append("svg")
  .attr("viewBox", [0, 0, width, height]);

  const updateBars = bars(svg);
  const updateAxis = axis(svg);
  const updateLabels = labels(svg);
  const updateTicker = ticker(svg);

  for (const keyframe of keyframes) {
    const transition = svg.transition()
        .duration(duration)
        .ease(d3.easeLinear);

    // Extract the top bar’s value.
    x.domain([0, keyframe[1][0].value]);

    updateAxis(keyframe, transition);
    updateBars(keyframe, transition);
    updateLabels(keyframe, transition);
    updateTicker(keyframe, transition);

    invalidation.then(() => svg.interrupt());
    transition.end();
  }

});