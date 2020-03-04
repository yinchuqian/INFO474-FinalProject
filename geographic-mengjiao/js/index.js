'use strict';

(function() {
    var width = 950,
        height = 550;

    var albersProjection = d3.geoAlbersUsa()
        .translate([(width) / 2, (height) / 2]);

    var geoPath = d3.geoPath()
        .projection( albersProjection );


    // load data and make scatter plot after window loads
    window.onload = function() {
        fetch("data/us_geo_small.json")
            .then(res => res.json()) // res is returned from the above fetch
            .then(jsonData => renderBackground(jsonData)); // data is returned from last .then
    }

    function renderBackground(jsonData) {
        var svg = d3.select( "body" )
            .append( "svg" )
            .attr( "width", width )
            .attr( "height", height );

        var usState = svg.append( "g" ).attr( "id", "usState" );

        // var state = svg.append("g")
        //             .style("stroke-width", "1.5px");


        d3.csv("data/state.csv").then((stateData) => {
            var color = d3.scaleSequential()
                .interpolator(d3.interpolateOrRd)
                .domain([
                    d3.min(stateData, function(d) { 
                        var min = d["year2011"]
                        var currentyear;
                        var nextyear;
                        for (var i = 2011; i < 2016; i++) {
                            currentyear = "year" + i;
                            nextyear = "year" + (i + 1);
                            if (d[currentyear] < d[nextyear]) {
                                min = d[currentyear]; 
                            } 
                        }
                        return min;
                    }),
                    d3.max(stateData, function(d) { 
                        var max = d["year2011"]
                        var currentyear;
                        var nextyear;
                        for (var i = 2011; i < 2016; i++) {
                            currentyear = "year" + i;
                            nextyear = "year" + (i + 1);
                            if (d[currentyear] > d[nextyear]) {
                                max = d[currentyear]; 
                            } 
                        }

                        return max;
                    })
                ]);

            // d3.csv is basically fetch but it can be be passed a csv file as a parameter
            // adding circles
            // d3.csv("data/2016.csv")
            //     .then((csvData) => drawCircle(svg, albersProjection, csvData));

            let defaultYear = "year2011";
            drawMap(jsonData, color, stateData, usState, defaultYear, svg);
            renderSlider(jsonData, color, stateData, usState, svg);
        });
    }

    function renderSlider(jsonData, color, stateData, usState, svg) {
        // slider start here
        var current = new Date(2011, 1, 1);        
        
        var playButton = document.getElementById("button1");
        var resetButton = document.getElementById("button2");
        
        var dataTime = d3.range(0, 6).map(function(d) {
            return new Date(2011 + d, 1, 1);
        });
        var sliderTime = d3.sliderBottom()
            .min(d3.min(dataTime))
            .max(d3.max(dataTime))
            .step(1000 * 60 * 60 * 24 * 365)
            .width(500)
            .tickFormat(d3.timeFormat('%Y'))
            .tickValues(dataTime)
            .default(new Date(2011, 1, 1))
            .on('onchange', val => {
                d3.select('p#value-time').text(d3.timeFormat('%Y')(val));
                var selectedYear = "year" + d3.timeFormat('%Y')(val);
                // using the selected year to get corresponding csv files
                drawMap(jsonData, color, stateData, usState, selectedYear, svg);
            });

        var gTime = d3
            .select('#slider')
            .append('svg')
            .attr('width', 700)
            .attr('height', 80)
            .append('g')
            .attr('transform', 'translate(100,30)');
        
        gTime.call(sliderTime);

        var timer;

        playButton.onclick = function() {
            var button = d3.select(this);
            if (button.text() == "Pause") {
                clearInterval(timer);
                button.html("<i class='fas fa-play'></i> Play");
            } else {
                timer = setInterval(step, 1200);
                button.text("Pause");
            }
        }

        resetButton.onclick =  function() {
            sliderTime.value(new Date(2001,1,1));
            if (playButton.textContent == "Pause") {
                playButton.click();
            }
            current = new Date(2001,1,1);
        }

        function step(){
            current = sliderTime.value().setFullYear(sliderTime.value().getFullYear() + 1);
            sliderTime.value(current);
            if (current >= 1485849600000) {
                playButton.click();
            }
        }
        
    }

    
  

    function drawMap(jsonData, color, stateData, usState, year, svg) {
        for (var i = 0, max = stateData.length; i < max; i++) {
            // grab state name
            var dataState = stateData[i]["STATE"];

            // grab data value, and convert from string to float
            var dataValue = parseFloat(stateData[i][year]);

            // Find the corresponding state inside the GeoJSON
            for( var j = 0, jmax = jsonData.features.length; j < jmax; j++) {
                var jsonState = jsonData.features[j].properties["NAME"];
                if(dataState.toUpperCase() == jsonState.toUpperCase()) {
                    // copy the data value into the JSON
                    jsonData.features[j].properties["value"] = dataValue;
                    break;

                }
            }
        }
        d3.select("div.tooltip").remove();
        let div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        d3.selectAll("#usState path").remove();
        usState.selectAll( "path" )
            .data( jsonData.features )
            .enter()
            .append( "path" )
            .attr( "d", geoPath )
                .style('stroke', 'rgb(129, 73, 0)')
                .style('fill', function(d) {
                    // get data value
                    var value = d.properties.value;
                    if(value) {
                        // if value exists
                        return color(value);
                    } else {
                        // if value is undefined...
                        return "#ccc";
                    }
                })
            .on("mouseover", over)
            .on("mouseout", out)
            .on("click", clicked);
        
        // when hover over a state, show a tooltip
        function over(d) {
            // show up tooltips
            div.transition()
                .duration(200)
                .style("opacity", .9);
        
            div.html("<h2>" + d.properties["NAME"] + "</h2><h3>" + d.properties.value + "</h3>")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px")
                .append('svg')
                .attr('width', 200)
                .attr('height', 50);

            // turn all other states to lighter color
            usState.selectAll("path").transition().duration('50').attr('opacity', '0.2');
            d3.select(this).transition().duration('50').attr('opacity', '1');
        }
    
        function out(d) {
            //hide tooltips
            div.transition()
                .duration(500)
                .style("opacity", 0);

            // turn all other states' color back
            usState.selectAll("path").transition().duration('50').attr('opacity', '1');
        }

        var active = d3.select(null);

        // zoom in
        function clicked(d) {
            console.log("clicked");
            // isclick = true;
            // clickpart = d;
            // g4.selectAll("path")
            //     .on("mouseover", tip2.show)
            //     .on("mouseout", tip2.hide);
            // dist1 = parseInt(d.properties.dist_num);
            if (active.node() === this) return reset();
            active.classed("active", false);
            active = d3.select(this).classed("active", true);
            // getdata(dist1);
        

            var bounds = geoPath.bounds(d),
                dx = bounds[1][0] - bounds[0][0],
                dy = bounds[1][1] - bounds[0][1],
                x = (bounds[0][0] + bounds[1][0]) / 2,
                y = (bounds[0][1] + bounds[1][1]) / 2,
                scale = .75 / Math.max(dx / width, dy / height),
                translate = [width / 2 - scale * x, height / 2 - scale * y];
            
            usState.selectAll("path").transition().duration('50').attr('opacity', '0.2');
            d3.select(this).transition().duration('50').attr('opacity', '1');
            
        
            usState.transition()
                .duration(750)
                .style("stroke-width", 1.5 / scale + "px")
                .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
        }
        
        //zoom out
        function reset() {
            console.log("reset");
            active.classed("active", false);
            active = d3.select(null);
            usState.transition()
                .duration(750)
                .style("stroke-width", "1px")
                .attr("transform", "");
        }
  
    
    }


    function drawCircle(svg, albersProjection, csvData) {
        var airbnb = svg.append( "g" ).attr( "id", "rodents" );

        let div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // 点完之后出bubble
        var circles = airbnb.selectAll( "circle" )
            .data( csvData )
            .enter()
            .append( "circle" )
            .attr("class", "dot")
            .attr("cx", function(d) {
                let coordinates = [d["longitude"], d["latitude"]];
                if (albersProjection( coordinates ) !== null) {
                    return albersProjection( coordinates )[0];
                }
            })
            .attr("cy", function(d) {
                let coordinates = [d["longitude"], d["latitude"]];
                if (albersProjection( coordinates ) !== null) {
                    return albersProjection( coordinates )[1];
                }
            })
            .attr('r', function(d) {
                return d["count"]*0.01;
                // return 1;
            })
            // .attr('border', "2px solid rgb(202, 140, 24)")
            .attr('fill', "rgba(150, 26, 167, 0.6)")
            // on mouseover, append each company's stats for that year.
            .on("mouseover", (d) => {      
                div.transition()
                  .duration(200)
                  .style("opacity", .9);
                div.html("<h2>" + d.EMPLOYER_NAME + "</h2><h3>" + d.STATE + "</h3><h3>" + d.count + "</h3>")
                  .style("left", (d3.event.pageX) + "px")
                  .style("top", (d3.event.pageY - 28) + "px")
                  .append('svg')
                  .attr('width', 200)
                  .attr('height', 50);
            })
            .on("mouseout", (d) => {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on("click", function(){
                d3.select(this)
                //   .attr("opacity", .9)
                  .transition()
                  .duration( 1000 )
                //   .attr( "x", width * Math.round( Math.random() ))
                //   .attr( "y", height * Math.round( Math.random() ))
                  .attr("opacity", 0 )
                  .on("end",function(){
                    d3.select(this).remove();
                  })
            });
    }
})();