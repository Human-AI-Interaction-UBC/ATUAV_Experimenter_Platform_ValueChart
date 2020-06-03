"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-06-10 10:41:27
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-07-18 12:19:55
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
exports.ContinuousScoreFunctionRenderer = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
// Import Application Classes:
const ScoreFunction_renderer_1 = require("./ScoreFunction.renderer");
const services_1 = require("../services");
const types_1 = require("../../types");
// This class contains the logic for creating and rendering multiple users' ContinuousScoreFunctions for a single objective with a continuous 
// (either categorical or interval) domain. The score functions are rendered as scatter plots where the points are the elements in the objective's 
// domain to which the users have assigned scores. Each user has one point indicating score per domain element in the objective.
let ContinuousScoreFunctionRenderer = /** @class */ (() => {
    var ContinuousScoreFunctionRenderer_1;
    let ContinuousScoreFunctionRenderer = ContinuousScoreFunctionRenderer_1 = class ContinuousScoreFunctionRenderer extends ScoreFunction_renderer_1.ScoreFunctionRenderer {
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        /*
            @returns {void}
            @description 	Used for Angular's dependency injection. However, this class is frequently constructed manually unlike the other renderer classes. It calls the constructor in ScoreFunctionRenderer as
                            all subclasses in TypeScript must do. This constructor should not be used to do any initialization of the class. Note that the dependencies of the class are intentionally being kept to a minimum.
        */
        constructor(chartUndoRedoService) {
            super(chartUndoRedoService);
            // ========================================================================================
            // 									Methods
            // ========================================================================================
            /*
                @param interactionConfig - The interactionConfig message sent to the ScoreFunctionRenderer to update interaction settings.
                @returns {void}
                @description	This method is used as the observer/handler of messages from the interactions pipeline and thus controls how and when the
                                score function interactions are turned on and off.
            */
            this.interactionConfigChanged = (interactionConfig) => {
                this.expandScoreFunctionInteraction.toggleExpandScoreFunction(interactionConfig.expandScoreFunctions, this.rootContainer.node().querySelectorAll('.' + ScoreFunction_renderer_1.ScoreFunctionRenderer.defs.PLOT_OUTLINE), this.lastRendererUpdate);
                this.adjustScoreFunctionInteraction.toggleDragToChangeScore(interactionConfig.adjustScoreFunctions, this.plottedPoints, this.lastRendererUpdate);
            };
        }
        /*
            @param u - The most recent ScoreFunctionUpdate message.
            @param plotElementsContainer - The 'g' element that is intended to contain the user containers. The user containers are the 'g' elements that will contain the parts of each users plot (bars/points).
            @param domainLabelContainer - The 'g' element that is intended to contain the labels for the domain (x) axis.
            @returns {void}
            @description 	This method overrides the createPlot method in ScoreFunctionRenderer in order to create ContinuousScoreFunction specific elements,
                            like points and fitlines for the scatter plot that is used to represent element scores. This method should NOT be called manually. Instead,
                            the createScoreFunction method that this class inherits from ScoreFunctionRenderer should be used. That method will call createPlot method after
                            doing the necessary construction of base containers and elements.
        */
        createPlot(u, plotElementsContainer, domainLabelContainer) {
            // Call the create plot method in ScoreFunctionRenderer.
            super.createPlot(u, plotElementsContainer, domainLabelContainer);
            // Create the continuous score function specific element containers:
            // Create the fitline container.
            var updateLinesContainer = this.userContainers.selectAll('.' + ContinuousScoreFunctionRenderer_1.defs.FITLINES_CONTAINER)
                .data((d, i) => { return [d]; });
            updateLinesContainer.exit().remove();
            updateLinesContainer.enter().append('g')
                .classed(ContinuousScoreFunctionRenderer_1.defs.FITLINES_CONTAINER, true)
                .attr('id', 'scorefunction-' + u.objective.getId() + '-fitlines-container');
            this.linesContainer = this.userContainers.selectAll('.' + ContinuousScoreFunctionRenderer_1.defs.FITLINES_CONTAINER);
            // Create the points container.
            var updatePointsContainer = this.userContainers.selectAll('.' + ContinuousScoreFunctionRenderer_1.defs.POINTS_CONTAINER)
                .data((d, i) => { return [d]; });
            updatePointsContainer.exit().remove();
            updatePointsContainer.enter()
                .append('g')
                .classed(ContinuousScoreFunctionRenderer_1.defs.POINTS_CONTAINER, true)
                .attr('id', 'scorefunction-' + u.objective.getId() + '-points-container');
            this.pointsContainer = this.userContainers.selectAll('.' + ContinuousScoreFunctionRenderer_1.defs.POINTS_CONTAINER);
            // Create the point labels container.
            var updatePointLabelContainer = this.userContainers.selectAll('.' + ContinuousScoreFunctionRenderer_1.defs.POINT_LABELS_CONTAINER)
                .data((d, i) => { return [d]; });
            updatePointLabelContainer.exit().remove();
            updatePointLabelContainer.enter()
                .append('g')
                .classed(ContinuousScoreFunctionRenderer_1.defs.POINT_LABELS_CONTAINER, true)
                .attr('id', 'scorefunction-' + u.objective.getId() + '-point-labels-container');
            this.pointLabelContainer = this.userContainers.selectAll('.' + ContinuousScoreFunctionRenderer_1.defs.POINT_LABELS_CONTAINER);
            this.createContinuousPlotElements(u, this.pointsContainer, this.linesContainer, this.pointLabelContainer);
        }
        /*
            @param u - The most recent ScoreFunctionUpdate message.
            @param pointsContainer - The 'g' element that is intended to contain the 'circle' elements used as points in the scatter plot.
            @oaram linesContainer - The 'g' element that is intended to contain the 'line' elements used as fitlines in the scatter plot.
            @param labelsContainer - The 'g' element that is intended to contain the labels for the bars.
            @returns {void}
            @description 	Creates the SVG elements and containers specific to a discrete score function plot. This is mainly the bars, bar tops, and bar labels of the bar graph.
                            This method should NOT be called manually. Use createScoreFunction to create the entire plot instead.
        */
        createContinuousPlotElements(u, pointsContainer, linesContainer, labelsContainer) {
            // Create a point for each new element in the Objective's domain. Note that this is all elements when the plot is first created.
            var updatePlottedPoints = pointsContainer.selectAll('.' + ContinuousScoreFunctionRenderer_1.defs.POINT)
                .data((d) => { return d.elements; });
            updatePlottedPoints.exit().remove();
            updatePlottedPoints
                .enter().append('circle')
                .classed(ContinuousScoreFunctionRenderer_1.defs.POINT, true)
                .attr('id', (d) => {
                return 'scorefunction-' + u.objective.getId() + '-' + d.element + '-point';
            });
            this.plottedPoints = pointsContainer.selectAll('.' + ContinuousScoreFunctionRenderer_1.defs.POINT);
            var updatePointLabels = labelsContainer.selectAll('.' + ContinuousScoreFunctionRenderer_1.defs.POINT_LABEL)
                .data((d) => { return d.elements; });
            updatePointLabels.exit().remove();
            updatePointLabels
                .enter().append('text')
                .classed(ContinuousScoreFunctionRenderer_1.defs.POINT_LABEL, true)
                .attr('id', (d) => {
                return 'scorefunction-' + u.objective.getId() + '-' + d.element + 'point-label';
            });
            this.pointLabels = labelsContainer.selectAll('.' + ContinuousScoreFunctionRenderer_1.defs.POINT_LABEL);
            // Create a slope line for each new adjacent pair of elements in the Objective's domain. Note that this is all elements when the plot is first created.
            var updateFitLines = linesContainer.selectAll('.' + ContinuousScoreFunctionRenderer_1.defs.FITLINE)
                .data((d) => {
                // Each fit line connects domain element i to i + 1 in the plot. This means that we need to create one fewer lines than domain elements.
                // To do this, we simply remove the last domain element from the list before we create the lines.
                var temp = d.elements.pop(); // Remove the last domain element.
                var data = d.elements.slice(); // Copy the array.
                d.elements.push(temp); // Add the domain element back.
                return data;
            });
            updateFitLines.exit().remove();
            updateFitLines
                .enter().append('line')
                .classed(ContinuousScoreFunctionRenderer_1.defs.FITLINE, true)
                .attr('id', (d) => {
                return 'scorefunction-' + u.objective.getId() + '-' + d.element + '-fitline';
            });
            this.fitLines = linesContainer.selectAll('.' + ContinuousScoreFunctionRenderer_1.defs.FITLINE);
        }
        /*
            @param u - The most recent ScoreFunctionUpdate message.
            @param updateDimensionOne - Whether or not this (re-)rendering of the score function plot should also resize/position the first dimension of
                                        the plot elements. The first dimension is x if vertical orientation, y otherwise.
            @returns {void}
            @description	This method positions and styles the ContinuousScoreFunction specific elements of the score function plot. Specifically, it renders the points, fitlines, and point labels
                            of the scatter plot. This method should NOT be called manually. Instead it should be used as a part of calling renderScoreFunction to re-render the entire score function plot.
        */
        renderPlot(u, updateDimensionOne) {
            this.userContainers.data(u.scoreFunctionData);
            this.linesContainer.data((d, i) => { return [d]; });
            this.pointsContainer.data((d, i) => { return [d]; });
            this.plottedPoints.data((d) => { return d.elements; });
            this.fitLines.data((d) => {
                // Each fit line connects domain element i to i + 1 in the plot. This means that we need to create one fewer lines than domain elements.
                // To do this, we simply remove the last domain element from the list before we create the lines.
                var temp = d.elements.pop(); // Remove the last domain element.
                var data = d.elements.slice(); // Copy the array.
                d.elements.push(temp); // Add the domain element back.
                return data;
            });
            this.renderContinuousPlotDimensionTwo(u);
            if (updateDimensionOne) {
                this.renderContinuousPlotDimensionOne(u);
            }
        }
        /*
            @param u - The most recent ScoreFunctionUpdate message.
            @returns {void}
            @description	This method positions and sizes the first coordinate/dimension of the ContinuousScoreFunction specific elements of the score function plot.
                            Specifically, it renders the points, fitlines, and point labels of the scatter plot. This method should NOT be called manually. Instead it
                            should be used as a part of calling renderScoreFunction to re-render the entire score function plot.
        */
        renderContinuousPlotDimensionOne(u) {
            var pointRadius = u.rendererConfig.labelOffset / 2.5;
            var pointOffset = 3;
            // Render the scatter plot points for each user.
            this.plottedPoints
                .attr('c' + u.rendererConfig.coordinateOne, (d, i) => { return this.calculatePlotElementCoordinateOne(d, i) - pointOffset; })
                .attr('r', pointRadius);
            // Render the point labels for each user.
            this.pointLabels
                .attr(u.rendererConfig.coordinateOne, (d, i) => { return this.calculatePlotElementCoordinateOne(d, i) + pointRadius + 1; });
            // Render the fitlines for each user.
            this.fitLines
                .attr(u.rendererConfig.coordinateOne + '1', (d, i) => { return this.calculatePlotElementCoordinateOne(d, i) - pointOffset; })
                .attr(u.rendererConfig.coordinateOne + '2', (d, i) => { return this.calculatePlotElementCoordinateOne(d, i + 1) - pointOffset; });
        }
        /*
            @param u - The most recent ScoreFunctionUpdate message.
            @returns {void}
            @description	This method positions and sizes the second coordinate/dimension of the ContinuousScoreFunction specific elements of the score function plot.
                            Specifically, it renders the points, fitlines, and point labels of the scatter plot. This method should NOT be called manually. Instead it
                            should be used as a part of calling renderScoreFunction to re-render the entire score function plot.
        */
        renderContinuousPlotDimensionTwo(u) {
            // Assign this function to a variable because it is used multiple times. This is cleaner and faster than creating multiple copies of the same anonymous function.
            var calculatePointCoordinateTwo = (d) => {
                return (u.viewOrientation === types_1.ChartOrientation.Vertical) ? (u.rendererConfig.independentAxisCoordinateTwo) - u.heightScale(d.scoreFunction.getScore(+d.element)) : u.heightScale(d.scoreFunction.getScore(+d.element));
            };
            this.plottedPoints
                .attr('c' + u.rendererConfig.coordinateTwo, calculatePointCoordinateTwo);
            this.pointLabels
                .text((d, i) => {
                return Math.round(100 * d.scoreFunction.getScore(+d.element)) / 100;
            })
                .attr(u.rendererConfig.coordinateTwo, calculatePointCoordinateTwo);
            this.fitLines
                .attr(u.rendererConfig.coordinateTwo + '1', calculatePointCoordinateTwo)
                .attr(u.rendererConfig.coordinateTwo + '2', (d, i) => {
                var userElements = u.scoreFunctionData.find((userElements) => {
                    return userElements.color === d.color;
                });
                return calculatePointCoordinateTwo(userElements.elements[i + 1]);
            });
        }
        /*
            @param u - The most recent ScoreFunctionUpdate message.
            @returns {void}
            @description	Apply styles to the score function plot that depend on values given in the ScoreFunctionUpdate message.
                            Styles that can be computed statically are applied through CSS classes instead of here.
        */
        applyStyles(u) {
            super.applyStyles(u);
            this.plottedPoints.style('fill', (d) => { return ((u.individual) ? u.objective.getColor() : d.color); })
                .style('fill-opacity', 0.5)
                .style('stroke-width', 1)
                .style('stroke', 'black');
            this.pointLabels.style('font-size', 8);
        }
        /*
            @param enableDragging - A boolean value indicating whether or not to display the  score labels.
            @returns {void}
            @description	This method toggles the visibility of score labels next to the bars in the bar chart.
        */
        toggleValueLabels(displayScoreFunctionValueLabels) {
            if (!this.pointLabelContainer)
                return;
            if (displayScoreFunctionValueLabels) {
                // Display the labels.
                this.pointLabelContainer.style('display', 'block');
            }
            else {
                // Hide the labels by hiding their container.
                this.pointLabelContainer.style('display', 'none');
            }
        }
    };
    // class name definitions for SVG elements that are created by this renderer.	
    ContinuousScoreFunctionRenderer.defs = Object.assign({
        FITLINES_CONTAINER: 'scorefunction-fitlines-container',
        FITLINE: 'scorefunction-fitline',
        POINTS_CONTAINER: 'scorefunction-points-container',
        POINT: 'scorefunction-point',
        POINT_LABELS_CONTAINER: 'scorefunction-point-labels-container',
        POINT_LABEL: 'scorefunction-point-label'
    }, ScoreFunction_renderer_1.ScoreFunctionRenderer.defs);
    ContinuousScoreFunctionRenderer = ContinuousScoreFunctionRenderer_1 = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [services_1.ChartUndoRedoService])
    ], ContinuousScoreFunctionRenderer);
    return ContinuousScoreFunctionRenderer;
})();
exports.ContinuousScoreFunctionRenderer = ContinuousScoreFunctionRenderer;
//# sourceMappingURL=ContinuousScoreFunction.renderer.js.map