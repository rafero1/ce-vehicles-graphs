// setup API options
const options = {
  config: {
    // Vega-Lite default configuration
  },
  init: (view) => {
    // initialize tooltip handler
    view.tooltip(new vegaTooltip.Handler().call);
  },
  view: {
    // view constructor options
    // remove the loader if you don't want to default to vega-datasets!
    loader: vega.loader({
      baseURL: "https://cdn.jsdelivr.net/npm/vega-datasets@2/",
    }),
    renderer: "canvas",
  },
};
// register vega and vega-lite with the API
vl.register(vega, vegaLite, options);

// now you can use the API!
vl.markBar({ tooltip: true })
  .data([
    { a: "A", b: 28 }, { a: "B", b: 55 }, { a: "C", b: 43 },
    { a: "D", b: 91 }, { a: "E", b: 81 }, { a: "F", b: 53 },
    { a: "G", b: 19 }, { a: "H", b: 87 }, { a: "I", b: 52 },
  ])
  .encode(
    vl.x().fieldQ("b"),
    vl.y().fieldN("a"),
    vl.tooltip([vl.fieldQ("b"), vl.fieldN("a")])
  )
  .render()
  .then(viewElement => {
    // render returns a promise to a DOM element containing the chart
    // viewElement.value contains the Vega View object instance
    document.getElementById('view').appendChild(viewElement);
  });
