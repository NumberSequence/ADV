//refresh page: reset from top
history.scrollRestoration = "manual";

let Bub1TF = false;
let Bub2TF = false;
let IncidentsAfter = true;
let MassAfter = true;
let flashing = false;
let bubblesThere = 0;
let theCSV;
let Bub4 = false;

//switches
function ToggleB1() {
  Bub1TF = !Bub1TF;
  flashing = Bub1TF;
  flashOdd();
}

function ToggleB2() {
  Bub2TF = !Bub2TF;
  flashing = Bub2TF;
  flashOdd();
}

//add/remove beeswarm styling depending on user selection
flashOdd = function () {
  showOdd = document.querySelectorAll(".circ[isodd='1']");
  showOdd.forEach((i) => {
    if (flashing) {
      i.classList.add("peeking");
    } else {
      i.classList.remove("peeking");
    }
  });
};

//remove incidents with 4 victims from beeswarm. Change title
hideFour = function () {
  hidable = document.querySelectorAll(".circ[val='4']");
  Bub4 = !Bub4;
  hidable.forEach((i) => {
    if (Bub4) {
      i.classList.add("hideIt");
      document.getElementById("swarmNote").innerHTML =
        "<br>(excludes 4-victim incidents)";
    } else {
      i.classList.remove("hideIt");
      document.getElementById("swarmNote").innerHTML = "";
    }
  });
};

//user selects first view incidents of heatmap ... change title
function IncidentsClick() {
  IncidentsAfter = !IncidentsAfter;
  metricConsidered = " shooting";
  maxRange = 350;
  ticklines = 5;
  if (IncidentsAfter) {
    variableConsidered = eval(
      "(datum) => { return parseInt(datum." + "Incidents2" + ");};"
    );
    document.getElementById("heatTitle").innerHTML =
      "NYPD Shooting Incident Data - Corrected<br>NYC Shootings Incidents w/ Injuries";
  } else {
    variableConsidered = eval(
      "(datum) => { return parseInt(datum." + "Incidents1" + ");};"
    );
    document.getElementById("heatTitle").innerHTML =
      "NYPD Shooting Incident Data - Introduced<br>NYC Shootings Incidents";
  }

  //repaint heatmap
  cal.paint({
    data: {
      y: variableConsidered,
    },
    scale: {
      color: {
        domain: [0, maxRange],
      },
    },
  });
}

//user selects first view of mass incidents ... change title
function MassClick() {
  MassAfter = !MassAfter;
  metricConsidered = " mass shooting";
  maxRange = 15;
  ticklines = 5;

  if (MassAfter) {
    variableConsidered = eval(
      "(datum) => { return parseInt(datum." + "Mass3" + ");};"
    );
    document.getElementById("heatTitle").innerHTML =
      "NYPD Shooting Incident Data - Interpreted<br>NYC Mass Shootings Incidents";
  } else {
    variableConsidered = eval(
      "(datum) => { return parseInt(datum." + "Mass2" + ");};"
    );
    document.getElementById("heatTitle").innerHTML =
      "NYPD Shooting Incident Data<br>NYC Mass Shootings Incidents";
  }

  //repaint heatmap
  cal.paint({
    data: {
      y: variableConsidered,
    },
    scale: {
      color: {
        domain: [0, maxRange],
      },
    },
  });
}

//CREATE HEATMAP

let vh = window.innerHeight;
let vw = window.innerWidth;
let metricConsidered = " shooting";
let variableConsidered = (datum) => {
  return parseInt(datum.Incidents1);
};

const weekDaysTemplate = (DateHelper) => ({
  name: "weekday",
  parent: "day",
  mapping: (startTimestamp, endTimestamp) => {
    let weekNumber = 0;
    let x = -1;

    return DateHelper.intervals(
      "day",
      startTimestamp,
      DateHelper.date(endTimestamp)
    )
      .map((ts) => {
        const date = DateHelper.date(ts);

        if (weekNumber !== date.week()) {
          weekNumber = date.week();
          x += 1;
        }

        if (date.format("d") === "0" || date.format("d") === "6") {
          return null;
        }

        return {
          t: ts,
          x,
          y: date.format("d") - 1,
        };
      })
      .filter((n) => n !== null);
  },
});
const cal = new CalHeatmap();
cal.addTemplates(weekDaysTemplate);
cal.paint(
  {
    range: 17,
    date: {
      start: new Date("2006-01-01"),
      min: new Date("2006-01-01"),
      max: new Date("2022-12-31"),
      timezone: "utc",
    },

    data: {
      source: "IncidentsUse3.csv",
      type: "csv",
      x: "OCCUR_DATE",
      y: variableConsidered,
    },

    domain: {
      gutter: 0,
      type: "year",
      label: { text: "YYYY", position: "left", offset: { x: 0, y: vh / 120 } },
    },

    verticalOrientation: true,
    subDomain: {
      dynamicDimension: false,
      width: vw / 25,
      height: vh / 23,
      gutter: 0,
      type: "month",
    },
    scale: {
      color: {
        type: "linear",
        domain: [0, 350],
        // custom color range,
        range: ["#d9dee2", "#328dcb"],
      },
    },
  },
  [
    [
      Tooltip,
      {
        text: function (date, value, dayjsDate) {
          if (value == 1) {
            return (
              (value
                ? d3.format(",")(value) + metricConsidered + " reported"
                : "0" + metricConsidered + "s reported") +
              " in " +
              dayjsDate.format("MMMM YYYY")
            );
          } else {
            return (
              (value
                ? d3.format(",")(value) + metricConsidered + "s reported"
                : "0" + metricConsidered + "s  reported") +
              " in " +
              dayjsDate.format("MMMM YYYY")
            );
          }
        },
      },
    ],

    [
      Legend,
      {
        label: metricConsidered + "s",
      },
    ],
  ]
);

//resize heatmap when window resized
window.onresize = function () {
  vh = window.innerHeight;
  vw = window.innerWidth;
  cal.paint({
    subDomain: {
      width: vw / 25,
      height: vh / 23,
    },
  });
};

const targets = document.querySelectorAll(".changeTrip");

//change visualizations/inputs depending on where the user scrolls
const lazyLoad = (target) => {
  const io = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;

          const metricConsidered = img.getAttribute("preMetric");
          if (
            metricConsidered == "bubbles1" ||
            metricConsidered == "bubbles2"
          ) {
            //if the user triggers the beeswarm
            if (
              (metricConsidered == "bubbles1" &&
                theCSV == "IncidentsUseMassBee.csv") ||
              (metricConsidered == "bubbles2" &&
                theCSV == "IncidentsUseMassBee2.csv")
            ) {
              //do nothing if the existing selection fits the scrolled section
            } else {
              //create swarm if needed
              bubblesThere = 1;
              d3.selectAll("#d3container > *").remove();
              const width = 0.15 * window.innerWidth;
              const height = 0.8 * window.innerHeight;
              const margin = [50, 0, 50, 100];
              let svg = d3
                .select("#d3container")
                .append("svg")
                .attr("height", height)
                .attr("width", width);
              //choose data source/title
              //keep existing styling of flashing/static circles
              if (metricConsidered == "bubbles1") {
                theCSV = "IncidentsUseMassBee.csv";
                flashing = Bub1TF;
                document.getElementById("swarmTitle").innerHTML =
                  "# of Mass Shooting Victims:<br>Initial Analysis";
              } else {
                theCSV = "IncidentsUseMassBee2.csv";
                flashing = Bub2TF;
                document.getElementById("swarmTitle").innerHTML =
                  "# of Mass Shooting Victims:<br>Discovery Analysis";
                document.getElementById("swarmNote").innerHTML = "";
              }

              d3.csv(theCSV).then((data) => {
                let useIt = Array.from(new Set(data.map((d) => d.firstAppear)));
                let xScale = d3
                  .scaleBand()
                  .domain(useIt)
                  .range([margin[3], width - margin[1]]);

                let yScale = d3
                  .scaleLinear()
                  .domain(d3.extent(data.map((d) => +d["MonYrAxis"])))
                  .range([margin[0], height - margin[2]]);

                let color = d3
                  .scaleOrdinal()
                  .domain(useIt)
                  .range(["rgba(122, 182, 217, 1)"]);

                //map size of circle
                let vicmap = d3.extent(data.map((d) => +d["Num_Vic"]));
                let size = d3.scaleSqrt().domain(vicmap).range([4, 20]);

                //define the tooltip
                var tooltip = d3
                  .select("#d3container")
                  .append("div")
                  .style("width", "fit-content")
                  .style("position", "absolute")
                  .style("white-space", "nowrap")
                  .style("padding", "0 10px")
                  .style("margin", "0 0 0 20px")
                  .style("opacity", 0)
                  .attr("class", "tooltip");

                //define the circles
                svg
                  .selectAll(".circ")
                  .data(data)
                  .enter()
                  .append("circle")
                  .attr("class", "circ")
                  .attr("stroke", "black")
                  .attr("fill", (d) => color(d.Odd_Even_Vic))
                  .attr("r", (d) => size(d["Num_Vic"]))
                  .attr("cx", (d) => xScale(d.Odd_Even_Vic))
                  .attr("cy", (d) => yScale(d.Odd_Even_Vic))
                  .attr("isodd", (d) => d["Num_Vic"] % 2)
                  .attr("val", (d) => d["Num_Vic"])
                  .on("mouseover", function (e, d) {
                    tooltip
                      .transition()
                      .style("opacity", 0.9)
                      .style("background", "lightsteelblue");
                    tooltip
                      .html(d.OCCUR_DATE + "<br>" + d.Num_Vic + " victims")
                      .style("left", d3.select(this).attr("cx") + "px")
                      .style("top", d3.select(this).attr("cy") + "px");
                  })
                  .on("mouseout", function (d) {
                    tooltip.transition().style("opacity", 0);
                  });
                //keep existing styling of flashing/static circles
                flashOdd();

                //no overlap of circles
                let simulation = d3
                  .forceSimulation(data)
                  .force(
                    "x",
                    d3
                      .forceX((d) => {
                        return xScale(d.firstAppear);
                      })
                      .strength(0.2)
                  )

                  .force(
                    "y",
                    d3
                      .forceY((d) => {
                        return yScale(d.MonYrAxis);
                      })
                      .strength(1)
                  )

                  .force(
                    "collide",
                    d3.forceCollide((d) => {
                      return size(d["Num_Vic"]);
                    })
                  )

                  .alphaDecay(0)
                  .alpha(0.3)
                  .on("tick", tick);

                function tick() {
                  d3.selectAll(".circ")
                    .attr("cx", (d) => d.x)
                    .attr("cy", (d) => d.y);
                }
                let init_decay = setTimeout(function () {
                  console.log("start alpha decay");
                  simulation.alphaDecay(0.1);
                }, 2500); // settle swarm 2.5 seconds
              });
              //keep existing styling of flashing/static circles
              flashOdd();
            }
          }
          //end: beeswarm triggered

          //if heatmap change triggered, which source
          else if (metricConsidered != "bubbles") {
            const variableConsidered = eval(
              "(datum) => { return parseInt(datum." +
                img.getAttribute("preVar") +
                ");};"
            );

            //choose which switches to reset
            if (img.getAttribute("reset") == "yes") {
              IncidentsAfter = true;
              MassAfter = true;
              Bub4 = false;
              document.getElementById("IncidentsButton").checked = true;
              document.getElementById("MassButton").checked = true;
              document.getElementById("BubID4").checked = false;
            }

            //repaint heatmap
            cal.paint(
              {
                data: {
                  y: variableConsidered,
                },
                scale: {
                  color: {
                    domain: [0, img.getAttribute("maxRange")],
                  },
                },
              },
              [
                [
                  Tooltip,
                  {
                    text: function (date, value, dayjsDate) {
                      if (value == 1) {
                        return (
                          (value
                            ? d3.format(",")(value) +
                              metricConsidered +
                              " reported"
                            : "0" + metricConsidered + "s reported") +
                          " in " +
                          dayjsDate.format("MMMM YYYY")
                        );
                      } else {
                        return (
                          (value
                            ? d3.format(",")(value) +
                              metricConsidered +
                              "s reported"
                            : "0" + metricConsidered + "s  reported") +
                          " in " +
                          dayjsDate.format("MMMM YYYY")
                        );
                      }
                    },
                  },
                ],
                [
                  Legend,
                  {
                    label: metricConsidered + "s", //"Color Legend",
                    enabled: true,
                    width: vw / 4,
                    // itemSelector: "#cal-heatmap",
                    ticks: parseInt(img.getAttribute("ticks")),
                  },
                ],
              ]
            );

            //change heatmap title based on where screen is
            if (img.getAttribute("preVar") == "Incidents1") {
              document.getElementById("heatTitle").innerHTML =
                "NYPD Shooting Incident Data - Introduced<br>NYC Shootings Incidents";
            } else if (img.getAttribute("preVar") == "Incidents2") {
              document.getElementById("heatTitle").innerHTML =
                "NYPD Shooting Incident Data - Corrected<br>NYC Shootings Incidents w/ Injuries";
            } else if (img.getAttribute("preVar") == "Mass2") {
              document.getElementById("heatTitle").innerHTML =
                "NYPD Shooting Incident Data<br>NYC Mass Shootings Incidents";
            } else if (img.getAttribute("preVar") == "Mass3") {
              document.getElementById("heatTitle").innerHTML =
                "NYPD Shooting Incident Data - Interpreted<br>NYC Mass Shootings Incidents";
            }
          }
        }
      });
    },
    //div has to be halfway across page
    { threshold: [0.5], root: null }
  );
  io.observe(target);
};
targets.forEach(lazyLoad);

/* global IntersectionObserver */

var counter = 1;
