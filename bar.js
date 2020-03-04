'use strict';
(function() {
    let data = '';
    const colors = ['#FFD700', '#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '	#8B008B', '#FF1493', 'black', '#696969']
    let margin = {
        top: 50,
        right: 20,
        bottom: 50,
        left: 220
    }

    window.onload = () => {
        d3.csv('data/top10.csv')
            .then((res) => {
                data = res;
                for(let item in data) {
                    data[item].YEAR = Math.round(data[item].YEAR)
                }
                handleData(data)
            })
    }
    function handleData(data) {
        var yearDrop = d3.select("body").append("select").attr("class", "year-drop")

        yearDrop.append('option')
                  .data(data)
                  .text('All Years')
                  .attr('value', 'All')
                  .enter()
        yearDrop.selectAll("option.state")
                .data(d3.map(data, (d) => {return d.YEAR}).keys())
                .enter()
                .append("option")
                .text((d) => { return d});
        let groupEmployer = filterData('All', data);
        plotBar(groupEmployer)
        yearDrop.on('change', function() {
            let selectedYear = d3.select(this).property("value");
            console.log(selectedYear)
            groupEmployer = filterData(selectedYear, data)
            plotBar(groupEmployer)
        })

    }
    function filterData(selectedYear, data) {
        let employerToPass = {}
        let groupEmployer = [];
        let filtered = data;
        if(selectedYear !== 'All') {
            filtered = filtered.filter((each) => each.YEAR == selectedYear);
        }
        for(let i = 0; i < filtered.length; i++) {
            let each = filtered[i];
            if (!employerToPass[each['EMPLOYER_NAME']]) {
                employerToPass[each['EMPLOYER_NAME']] = 0;
            }
            if(each['CASE_STATUS'] == 'CERTIFIED') {
                employerToPass[each['EMPLOYER_NAME']]++;
            }
        }
        for (let key in  employerToPass) {
            let eachMap = {}
            eachMap['employer'] = key
            eachMap['pass'] = employerToPass[key]
            groupEmployer.push(eachMap)
        }
        groupEmployer = groupEmployer.sort((a, b) => {
            return d3.ascending(a.pass, b.pass)
        })
        return groupEmployer
    }
    function plotBar(groupEmployer) {
        var width = 1250 - margin.left - margin.right // count of pass
        var height = 700 - margin.top - margin.bottom // employer names
        var color = d3.scaleOrdinal().range(colors);
        d3.select('#chart').selectAll('svg').remove();
        var svg = d3.select("#chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        // employer names
        var y = d3.scaleBand()
            .rangeRound([0, height])
            .padding(0.1)
            .domain(groupEmployer.map((d) => {
                return d.employer
            }))
        // count of pass
        var x = d3.scaleLinear()
                .rangeRound([width, 0])
                .domain([d3.max(groupEmployer, function (d) {
                    return d.pass
                }), 0]);
        svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
                .append('text')
                .attr("fill", "#000")
                .attr('x', 900)
                .attr('y', 30)
                .attr('font-size', '15px')
                .attr("text-anchor", "end")
                .text("Count of Pass");
        svg.append("g")
                .call(d3.axisLeft(y))
        svg.selectAll(".bar")
                .data(groupEmployer)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", 7)
                .attr("y", function (d) {
                    return y(d.employer);
                })
                .attr("height", y.bandwidth())
                .attr("width", function (d) {
                    return x(d.pass);
                })
                .style("fill", function(d, i) {
                    return color(i);
                  })
    }
})()