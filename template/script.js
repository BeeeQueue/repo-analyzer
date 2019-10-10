const bodyBox = document.body.getBoundingClientRect()
const box = {
  height: bodyBox.height - 100,
  width: bodyBox.width - 100
}

const run = async () => {
  data = data
    .filter(obj => !obj.error)
    .map(d => ({
      date: d.date,
      value: d.data.header.n_lines
    }))

  const totalLoc = data.map(obj => obj.value).sort((a, b) => b - a)[0]
  console.log(totalLoc)

  const svg = d3
    .select("body")
    .append("svg")
    .attr("height", bodyBox.height)
    .attr("width", bodyBox.width)
    .append("g")

  svg.style("transform", "translate(50px, 50px)")

  const x = d3
    .scaleTime()
    .domain(d3.extent(data, ({ date }) => new Date(date)))
    .range([0, box.width])
  svg.append("g").call(d3.axisBottom(x))

  const y = d3
    .scaleLinear()
    .domain(d3.extent(data, ({ value }) => value))
    .range([box.height, 0])
  svg.append("g").call(d3.axisLeft(y))

  svg
    .append("path")
    .attr("fill", "#cce5df")
    .attr("stroke", "#69b3a2")
    .attr("stroke-width", 1.5)
    .datum(data)
    .attr(
      "d",
      d3
        .area()
        .x(d => x(new Date(d.date)))
        .y0(y(0))
        .y1(d => y(d.value))
    )
}

run()
