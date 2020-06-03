"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2017-07-24 10:36:47
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-07-24 10:36:47
*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViolinRenderer = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
// Import Libraries:
const d3 = require("d3");
// Import Types:
const types_1 = require("../../types");
let ViolinRenderer = /** @class */ (() => {
    var ViolinRenderer_1;
    let ViolinRenderer = ViolinRenderer_1 = class ViolinRenderer {
        // ========================================================================================
        //                                     Constructor
        // ========================================================================================
        /*
            @returns {void}
            @description     Used for Angular's dependency injection ONLY. It should not be used to do any initialization of the class.
                            This constructor should NOT be called manually. Angular will automatically handle the construction of this directive when it is used.
        */
        constructor() {
            // ========================================================================================
            //                                     Fields
            // ========================================================================================
            this.bandwidth = 0.08;
            this.resolution = 25;
            this.markerRadius = 3;
            // ========================================================================================
            //                                     Methods
            // ========================================================================================
            this.weightsPlotChanged = (update) => {
                if (this.plot === undefined) {
                    this.createViolin(update);
                }
                if (update.structuralUpdate) {
                    this.createUserPoints(update);
                }
                this.renderViolinPlot(update);
            };
            this.kernelDensityEstimator = (kernel, X) => {
                return function (V) {
                    return X.map(function (x) {
                        return [x, d3.mean(V, function (v) { return kernel(x - v); })];
                    });
                };
            };
            this.kernelEpanechnikov = (k) => {
                return function (v) {
                    return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
                };
            };
        }
        createViolin(u) {
            this.plot = u.el.append('g')
                .classed(ViolinRenderer_1.defs.PLOT, true)
                .attr('id', 'violin-' + u.objectiveId + '-plot');
            this.plotOutlineContainer = this.plot.append('g')
                .classed(ViolinRenderer_1.defs.OUTLINE_CONTAINER, true)
                .attr('id', 'violin-' + u.objectiveId + '-outline-container');
            this.plotOutline = this.plotOutlineContainer.append('rect')
                .classed(ViolinRenderer_1.defs.PLOT_OUTLINE, true)
                .classed('valuechart-outline', true)
                .attr('id', 'violin-' + u.objectiveId + '-outline');
            this.plotAxesContainer = this.plot.append('g')
                .classed(ViolinRenderer_1.defs.AXES_CONTAINER, true)
                .attr('id', 'violin-' + u.objectiveId + '-axes-container');
            this.weightAxisContainer = this.plotAxesContainer.append('g')
                .classed(ViolinRenderer_1.defs.WEIGHT_AXIS_CONTAINER, true)
                .attr('id', 'violin-' + u.objectiveId + '-weight-axis-container');
            this.densityAxisContainer = this.plotAxesContainer.append('g')
                .classed(ViolinRenderer_1.defs.DENSITY_AXIS_CONTAINER, true)
                .attr('id', 'violin-' + u.objectiveId + '-density-axis-container');
            this.plotElementsContainer = this.plot.append('g')
                .classed(ViolinRenderer_1.defs.PLOT_ELEMENTS_CONTAINER, true)
                .attr('id', 'violin-' + u.objectiveId + '-elements-container');
            this.upperDensityLine = this.plotElementsContainer.append("path")
                .classed(ViolinRenderer_1.defs.PLOT_DENSITY_LINE, true);
            this.lowerDensityLine = this.plotElementsContainer.append("path")
                .classed(ViolinRenderer_1.defs.PLOT_DENSITY_LINE, true);
            this.quartileRect = this.plotElementsContainer.append('rect')
                .classed(ViolinRenderer_1.defs.QUARTILE_RECT, true);
            this.medianMarker = this.plotElementsContainer.append('circle')
                .classed(ViolinRenderer_1.defs.MEDIAN_MARKER, true);
            this.createUserPoints(u);
        }
        createUserPoints(u) {
            var updateUserPoints = this.plotElementsContainer.selectAll('.' + ViolinRenderer_1.defs.USER_POINT)
                .data(u.users);
            // Update cells to conform to the data.
            updateUserPoints.exit().remove();
            updateUserPoints.enter().append('circle')
                .classed(ViolinRenderer_1.defs.USER_POINT, true);
            this.userPoints = this.plotElementsContainer.selectAll('.' + ViolinRenderer_1.defs.USER_POINT);
        }
        renderViolinPlot(u) {
            this.plotElementsContainer.attr('transform', 'translate(' + ((u.viewOrientation === types_1.ChartOrientation.Vertical) ? ((u.rendererConfig.dependentAxisCoordinateOne + 4) + ',' + (u.rendererConfig.dependentAxisCoordinateTwo - .5) + ')') : ((u.rendererConfig.independentAxisCoordinateTwo - .5) + ', ' + (u.rendererConfig.dependentAxisCoordinateOne + 4) + ')')));
            this.plotOutline.attr(u.rendererConfig.dimensionOne, u.rendererConfig.dimensionOneSize)
                .attr(u.rendererConfig.dimensionTwo, u.rendererConfig.dimensionTwoSize);
            // Create the new Scale for use creating the weight axis.
            this.weightScale = d3.scaleLinear()
                .domain([0, 1]);
            // Create the new Scale for use creating the density axis.
            this.densityScale = d3.scaleLinear()
                .domain([-7.5, 7.5]);
            var weightScaleWidth = u.rendererConfig.independentAxisCoordinateOne - u.rendererConfig.dependentAxisCoordinateOne;
            var densityScaleHeight = (u.viewOrientation === types_1.ChartOrientation.Vertical) ? (u.rendererConfig.independentAxisCoordinateTwo - u.rendererConfig.dependentAxisCoordinateTwo) : (u.rendererConfig.dependentAxisCoordinateTwo - u.rendererConfig.independentAxisCoordinateTwo);
            let density = this.kernelDensityEstimator(this.kernelEpanechnikov(this.bandwidth), this.weightScale.ticks(this.resolution))(u.weights);
            density.splice(0, 0, [0, 0]);
            var line;
            var mirrorLine;
            // The range of the scale must be inverted for the vertical axis because pixels coordinates set y to increase downwards, rather than upwards as normal.
            if (u.viewOrientation === types_1.ChartOrientation.Vertical) {
                this.weightScale.range([0, weightScaleWidth]);
                this.densityScale.range([densityScaleHeight, 0]);
                line = d3.line()
                    .curve(d3.curveBasis)
                    .x((d) => { return this.weightScale(d[0]); })
                    .y((d) => { return this.densityScale(d[1]); });
                mirrorLine = d3.line()
                    .curve(d3.curveBasis)
                    .x((d) => { return this.weightScale(d[0]); })
                    .y((d) => { return this.densityScale(-1 * d[1]); });
            }
            else {
                this.weightScale.range([0, weightScaleWidth]);
                this.densityScale.range([0, densityScaleHeight]);
                line = d3.line()
                    .curve(d3.curveBasis)
                    .y((d) => { return this.weightScale(d[0]); })
                    .x((d) => { return this.densityScale(d[1]); });
                mirrorLine = d3.line()
                    .curve(d3.curveBasis)
                    .y((d) => { return this.weightScale(d[0]); })
                    .x((d) => { return this.densityScale(-1 * d[1]); });
            }
            var color;
            if (u.users.length === 1)
                color = u.objective.getColor();
            else
                color = 'light-grey';
            this.upperDensityLine
                .datum(density)
                .attr("fill", color)
                .attr("stroke", color)
                .attr("fill-opacity", 0.5)
                .attr("stroke-width", 1.5)
                .attr("stroke-linejoin", "round")
                .attr("d", line);
            this.lowerDensityLine
                .datum(density)
                .attr("fill", color)
                .attr("stroke", color)
                .attr("fill-opacity", 0.5)
                .attr("stroke-width", 1.5)
                .attr("stroke-linejoin", "round")
                .attr("d", mirrorLine);
            this.quartileRect
                .attr('fill', 'grey')
                .attr('fill-opacity', 0.4)
                .attr('stroke', 'black')
                .attr('stroke-width', 1)
                .attr(u.rendererConfig.dimensionOne, this.weightScale(u.thirdQuartile - u.firstQuartile))
                .attr(u.rendererConfig.dimensionTwo, Math.max((u.viewOrientation === types_1.ChartOrientation.Vertical) ? this.densityScale(4.5) : this.densityScale(-4.5), 0))
                .attr(u.rendererConfig.coordinateOne, this.weightScale(u.firstQuartile))
                .attr(u.rendererConfig.coordinateTwo, (u.viewOrientation === types_1.ChartOrientation.Vertical) ? this.densityScale(1.5) : this.densityScale(-1.5));
            this.medianMarker
                .attr('fill', 'white')
                .attr('stroke', 'black')
                .attr('stroke-width', 1)
                .attr('r', this.markerRadius * 2)
                .attr('c' + u.rendererConfig.coordinateOne, this.weightScale(u.medianWeight))
                .attr('c' + u.rendererConfig.coordinateTwo, this.densityScale(0));
            this.renderUserPoints(u);
            this.renderWeightAxis(u);
            this.renderDensityAxis(u);
        }
        renderUserPoints(u) {
            this.userPoints
                .attr('r', this.markerRadius)
                .attr('c' + u.rendererConfig.coordinateOne, (d, i) => { return this.weightScale(d.getWeightMap().getObjectiveWeight(u.objective.getId())); })
                .attr('c' + u.rendererConfig.coordinateTwo, this.densityScale(0))
                .attr('fill', (d, i) => { return d.color; })
                .attr('stroke', (d, i) => { return d.color; })
                .attr('stroke-width', 1);
        }
        renderWeightAxis(u) {
            // Delete the elements of the previous axes.
            var elements = this.weightAxisContainer.node().children;
            for (var i = 0; i < elements.length; i++) {
                elements[i].remove();
            }
            var weightAxis;
            // The range of the scale must be inverted for the vertical axis because pixels coordinates set y to increase downwards, rather than upwards as normal.
            if (u.viewOrientation === types_1.ChartOrientation.Vertical) {
                weightAxis = d3.axisBottom(this.weightScale);
            }
            else {
                weightAxis = d3.axisLeft(this.weightScale);
            }
            if (u.viewOrientation === types_1.ChartOrientation.Vertical)
                weightAxis.ticks(4);
            else
                weightAxis.ticks(1);
            // Position the axis by positioning the axis container and then create it.
            this.weightAxisContainer
                .attr('transform', () => {
                return 'translate(' + ((u.viewOrientation === types_1.ChartOrientation.Vertical) ? ((u.rendererConfig.dependentAxisCoordinateOne + 4) + ',' + (u.rendererConfig.independentAxisCoordinateTwo - .5) + ')') : ((u.rendererConfig.independentAxisCoordinateTwo - .5) + ', ' + (u.rendererConfig.dependentAxisCoordinateOne + 4) + ')'));
            })
                .call(weightAxis);
        }
        renderDensityAxis(u) {
            // Delete the elements of the previous axes.
            var elements = this.densityAxisContainer.node().children;
            for (var i = 0; i < elements.length; i++) {
                elements[i].remove();
            }
            var densityAxis;
            // The range of the scale must be inverted for the vertical axis because pixels coordinates set y to increase downwards, rather than upwards as normal.
            if (u.viewOrientation === types_1.ChartOrientation.Vertical) {
                densityAxis = d3.axisLeft(this.densityScale);
            }
            else {
                densityAxis = d3.axisTop(this.densityScale);
            }
            densityAxis.ticks(0);
            // Position the axis by positioning the axis container and then create it.
            this.densityAxisContainer
                .attr('transform', () => {
                return 'translate(' + ((u.viewOrientation === types_1.ChartOrientation.Vertical) ? ((u.rendererConfig.dependentAxisCoordinateOne + 4) + ',' + (u.rendererConfig.dependentAxisCoordinateTwo - .5) + ')') : ((u.rendererConfig.independentAxisCoordinateTwo - .5) + ', ' + (u.rendererConfig.dependentAxisCoordinateOne + 4) + ')'));
            })
                .call(densityAxis);
        }
    };
    ViolinRenderer.defs = {
        PLOT: 'violin-plot-container',
        PLOT_ELEMENTS_CONTAINER: 'violin-plot-elements-container',
        PLOT_DENSITY_LINE: 'violin-density-line',
        MEDIAN_MARKER: 'violin-median-marker',
        QUARTILE_RECT: 'violin-quartile-rect',
        USER_POINT: 'violin-user-point',
        OUTLINE_CONTAINER: 'violin-outline-container',
        PLOT_OUTLINE: 'violin-plot-outline',
        AXES_CONTAINER: 'violin-axes-container',
        WEIGHT_AXIS_CONTAINER: 'violin-weight-axis',
        DENSITY_AXIS_CONTAINER: 'violin-density-axis',
    };
    ViolinRenderer = ViolinRenderer_1 = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [])
    ], ViolinRenderer);
    return ViolinRenderer;
})();
exports.ViolinRenderer = ViolinRenderer;
//# sourceMappingURL=Violin.renderer.js.map