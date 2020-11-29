//tooltip
const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);
const selectedDateLabel = d3.select(".selected-date-label");

export const lineChart = (selection, props) => {
  const {
    colorScale,
    yValue,
    title,
    xValue,
    xAxisLabel,
    // circleRadius,
    yAxisLabel,
    margin,
    width,
    height,
    data,
    nested,
    selectedDate,
    setSelectedDate,
  } = props;

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(data, xValue))
    .range([0, innerWidth]);

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(data, yValue))
    .range([innerHeight, 0])
    .nice();

  const g = selection.selectAll(".container").data([null]);
  const gEnter = g.enter().append("g").attr("class", "container");
  gEnter.merge(g).attr("transform", `translate(${margin.left},${margin.top})`);

  const xAxis = d3
    .axisBottom(xScale)
    .tickSize(-innerHeight)
    .tickPadding(15)
    .tickFormat(d3.timeFormat("%b'%y"));

  const yAxis = d3.axisLeft(yScale).tickSize(-innerWidth).tickPadding(10);

  const yAxisGEnter = gEnter.append("g").attr("class", "y-axis");

  const yAxisG = g.select(".y-axis");

  yAxisGEnter.merge(yAxisG).call(yAxis).selectAll(".domain").remove();

  yAxisGEnter
    .append("text")
    .attr("class", "axis-label")
    .attr("y", -80)
    .attr("fill", "black")
    .attr("transform", `rotate(-90)`)
    .attr("text-anchor", "middle")
    .merge(yAxisG.select(".axis-label"))
    .attr("x", -innerHeight / 2)
    .text(yAxisLabel);

  const xAxisGEnter = gEnter.append("g").attr("class", "x-axis");

  const xAxisG = g.select(".x-axis");

  xAxisGEnter
    .merge(xAxisG)
    .call(xAxis)
    .attr("transform", `translate(0,${innerHeight})`)
    .select(".domain")
    .remove();

  xAxisGEnter
    .append("text")
    .attr("class", "axis-label")
    .attr("y", 75)
    .attr("fill", "black")
    .merge(xAxisG.select(".axis-label"))
    .attr("x", innerWidth / 2)
    .text(xAxisLabel);

  const lineGenerator = d3
    .line()
    .x((d) => xScale(xValue(d)))
    .y((d) => yScale(yValue(d)))
    .curve(d3.curveBasis);

  //data join
  const linePaths = g.merge(gEnter).selectAll(".line-path").data(nested);

  linePaths
    .enter()
    .append("path")
    .attr("class", "line-path")
    .merge(linePaths)
    .attr("d", (d) => lineGenerator(d.values))
    .attr("stroke", (d) => colorScale(d.key));

  gEnter
    .append("line")
    .attr("class", "selected-date-line")
    .attr("y1", 0)
    .merge(g.select(".selected-date-line"))
    .attr("x1", xScale(selectedDate))
    .attr("x2", xScale(selectedDate))
    .attr("y2", innerHeight);

  gEnter
    .append("text")
    .attr("class", "title")
    .attr("y", -10)
    .merge(g.select(".title"))
    .text(title);

  //Add invisible rectangle element for select date pointer area and mouse event listener
  gEnter
    .append("rect")
    .attr("class", "mouse-interceptor")
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .merge(g.select(".mouse-interceptor"))
    .attr("width", innerWidth)
    .attr("height", innerHeight)
    .on("mousemove", function () {
      const x = d3.mouse(this)[0];
      //capture pixel coordinate with date from the xScale
      const hoveredDate = xScale.invert(x);
      const date = hoveredDate.toISOString().split("T")[0];
      setSelectedDate(hoveredDate);

      if (selectedDateLabel.text() !== date) {
        selectedDateLabel.text(date);
      } else {
        selectedDateLabel.text(selectedDate);
      }

      tooltip.transition().duration(500).style("opacity", 0.9);
      tooltip
        .html(date)
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 28 + "px");
    })
    .on("mouseout", function () {
      tooltip.transition().duration(200).style("opacity", 0);
      tooltip.html(null);
    });
};
