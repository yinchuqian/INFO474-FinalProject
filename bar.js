'use strict';
(function() {
    let data = '';
    let svgContainer = '';
    let scales = {
        margin: 50,
        width: 1000,
        height: 800
    }
    let tinyScales = {
        width: 500,
        height: 500,
        margin: 50
    }
    window.onload = () => {
        svgContainer = d3.select('body')
                        .append('svg')
                        .attr('width', 1400)
                        .attr('height', 800)
        d3.csv('data/data.csv')
            .then((res) => {
                data = res;
                handleData(data)
            })
    }
    function handleData(data) {
        
    }
})()