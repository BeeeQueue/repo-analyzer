const bodyBox = document.body.getBoundingClientRect()
const box = {
  height: bodyBox.height - 100,
  width: bodyBox.width - 100
}

const run = async () => {
  data = data.filter(obj => !obj.error)
  // .map(d => ({
  //   date: d.date,
  //   value: d.data.header.n_lines
  // }))

  const languages = Array.from(
    new Set(
      data.reduce(
        (array, d) =>
          array.concat(Object.keys(d.data).filter(k => k !== "header")),
        []
      )
    )
  )

  data = data.map(d => {
    const keys = Object.keys(d.data).filter(k => k !== "header" && k !== "SUM")

    return keys.reduce(
      (obj, key) => {
        obj[key] = d.data[key].code + d.data[key].blank + d.data[key].comment

        return obj
      },
      { date: d.date, total: d.data.header.n_lines }
    )
  })

  const randomColor = d3
    .scaleOrdinal()
    .domain(languages)
    .range(d3.schemeSet2)

  const color = key => {
    switch (key) {
      case "JavaScript":
        return "orange"
      case "TypeScript":
        return "cornflowerblue"
      case "Ruby":
        return "darkred"
      case "JSON":
        return "red"
      default:
        return randomColor(key)
    }
  }

  const stackedData = d3.stack().keys(languages)(data)

  const totalLoc = data.map(obj => obj.total).sort((a, b) => b - a)[0]
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
    .domain([0, totalLoc])
    .range([box.height, 0])
  svg.append("g").call(d3.axisLeft(y))

  const area = d3
    .area()
    .x(d => x(new Date(d.data.date)))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]))

  svg
    .selectAll("mylayers")
    .data(stackedData)
    .enter()
    .append("path")
    .attr("class", d => d.key)
    .style("fill", d => color(d.key))
    .attr("d", area)
}

run()
