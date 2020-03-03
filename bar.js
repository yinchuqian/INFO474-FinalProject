'use strict';
(function() {
    let data = '';
    let svgContainer = '';
    let margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 50
    }

    window.onload = () => {
        svgContainer = d3.select('body')
                        .append('svg')
                        .attr('width', 1400)
                        .attr('height', 800)
        d3.csv('data/top10.csv')
            .then((res) => {
                data = res;
                handleData(data)
            })
    }
    function handleData(data) {
        let groupEmployer = [];
        let employerToPass = {};
        for(let i = 0; i < data.length; i++) {
            let each = data[i];
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
        console.log(groupEmployer)
        plotBar(groupEmployer)

    }
    function plotBar(groupEmployer) {
        var width = 960 - margin.left - margin.right
        var height = 500 - margin.top - margin.bottom
        var svg = d3.select("#chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        var x = d3.scaleBand()
            .rangeRound([0, width])
            .padding(0.1)
            .domain(groupEmployer.map((d) => {
                return d.employer
            }))
        var y = d3.scaleLinear()
                .rangeRound([height, 0])
                .domain([0, d3.max(groupEmployer, function (d) {
                    return d.pass
                })]);
        svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
        svg.append("g")
                .call(d3.axisLeft(y))
                .append("text")
                .attr("fill", "#000")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .attr("text-anchor", "end")
                .text("Count of Pass");
        svg.selectAll(".bar")
                .data(groupEmployer)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function (d) {
                    return x(d.employer);
                })
                .attr("y", function (d) {
                    return y(d.pass);
                })
                .attr("width", x.bandwidth())
                .attr("height", function (d) {
                    return height - y(d.pass);
                });
    }
})()