"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-06-10 10:40:57
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-07-18 12:18:29
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
exports.DiscreteScoreFunctionRenderer = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
// Import Application Classes
const services_1 = require("../services");
const ScoreFunction_renderer_1 = require("./ScoreFunction.renderer");
const types_1 = require("../../types");
// This class contains the logic for creating and rendering multiple users' DiscreteScoreFunctions for a single objective with a discrete 
// (either categorical or interval) domain. The score functions are rendered as bar charts. Each user has one bar indicating score per domain 
// element in the objective.
let DiscreteScoreFunctionRenderer = /** @class */ (() => {
    var DiscreteScoreFunctionRenderer_1;
    let DiscreteScoreFunctionRenderer = DiscreteScoreFunctionRenderer_1 = class DiscreteScoreFunctionRenderer extends ScoreFunction_renderer_1.ScoreFunctionRenderer {
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
            /*
                @param interactionConfig - The interactionConfig message sent to the ScoreFunctionRenderer to update interaction settings.
                @returns {void}
                @description	This method is used as the observer/handler of messages from the interactions pipeline and thus controls how and when the
                                score function interactions are turned on and off.
            */
            this.interactionConfigChanged = (interactionConfig) => {
                this.expandScoreFunctionInteraction.toggleExpandScoreFunction(interactionConfig.expandScoreFunctions, this.rootContainer.node().querySelectorAll('.' + ScoreFunction_renderer_1.ScoreFunctionRenderer.defs.PLOT_OUTLINE), this.lastRendererUpdate);
                this.adjustScoreFunctionInteraction.toggleDragToChangeScore(interactionConfig.adjustScoreFunctions, this.barTops, this.lastRendererUpdate);
            };
        }
        // ========================================================================================
        // 									Methods
        // ========================================================================================
        /*
            @param u - The most recent ScoreFunctionUpdate message.
            @param plotElementsContainer - The 'g' element that is intended to contain the user containers. The user containers are the 'g' elements that will contain the parts of each users plot (bars/points).
            @param domainLabelContainer - The 'g' element that is intended to contain the labels for the domain (x) axis.
            @returns {void}
            @description 	This method overrides the createPlot method in ScoreFunctionRenderer in order to create DiscreteScoreFunction specific elements,
                            like bars for the bar chart that is used to represent element scores. This method should NOT be called manually. Instead,
                            the createScoreFunction method that this class inherits from ScoreFunctionRenderer should be used. That method will call createPlot method after
                            doing the necessary construction of base containers and elements.
        */
        createPlot(u, plotElementsContainer, domainLabelContainer) {
            // Call the create plot method in ScoreFunctionRenderer. This will create the user containers and create the domain labels.
            super.createPlot(u, plotElementsContainer, domainLabelContainer);
            // Create the bar container element.
            var updateBarContainers = this.userContainers.selectAll('.' + DiscreteScoreFunctionRenderer_1.defs.BARS_CONTAINER)
                .data((d, i) => { return [d]; });
            updateBarContainers.exit().remove();
            updateBarContainers.enter().append('g')
                .classed(DiscreteScoreFunctionRenderer_1.defs.BARS_CONTAINER, true)
                .attr('id', 'scorefunction-' + u.objective.getId() + '-bars-container');
            this.barContainer = this.userContainers.selectAll('.' + DiscreteScoreFunctionRenderer_1.defs.BARS_CONTAINER);
            var updateBarLabelsContainer = this.userContainers.selectAll('.' + DiscreteScoreFunctionRenderer_1.defs.BAR_LABELS_CONTAINER)
                .data((d, i) => { return [d]; });
            updateBarLabelsContainer.exit().remove();
            updateBarLabelsContainer.enter().append('g')
                .classed(DiscreteScoreFunctionRenderer_1.defs.BAR_LABELS_CONTAINER, true)
                .attr('id', 'scorefunction-' + u.objective.getId() + '-pointlabels-container');
            // Create the bar label container element.
            this.barLabelContainer = this.userContainers.select('.' + DiscreteScoreFunctionRenderer_1.defs.BAR_LABELS_CONTAINER);
            // Create the bars, bar tops, and bar labels.
            this.createDiscretePlotElements(u, this.barContainer, this.barLabelContainer);
        }
        /*
            @param u - The most recent ScoreFunctionUpdate message.
            @param barsContainer - The 'g' element that is intended to contain the 'rect' elements that are bars in the plot.
            @param labelsContainer - The 'g' element that is intended to contain the labels for the bars.
            @returns {void}
            @description 	Creates the SVG elements and containers specific to a discrete score function plot. This is mainly the bars, bar tops, and bar labels of the bar graph.
                            This method should NOT be called manually. Use createScoreFunction to create the entire plot instead.
        */
        createDiscretePlotElements(u, barsContainer, labelsContainer) {
            // Create a bar for each new element in the Objective's domain. Note that this is all elements when the plot is first created.
            var updateUtilityBars = barsContainer.selectAll('.' + DiscreteScoreFunctionRenderer_1.defs.BAR)
                .data((d) => { return d.elements; });
            updateUtilityBars.exit().remove();
            updateUtilityBars
                .enter().append('rect')
                .classed(DiscreteScoreFunctionRenderer_1.defs.BAR, true)
                .attr('id', (d) => {
                return 'scorefunction-' + u.objective.getId() + '-' + d.element + '-bar';
            });
            this.utilityBars = barsContainer.selectAll('.' + DiscreteScoreFunctionRenderer_1.defs.BAR);
            var updateBarLabels = labelsContainer.selectAll('.' + DiscreteScoreFunctionRenderer_1.defs.BAR_LABEL)
                .data((d) => { return d.elements; });
            updateBarLabels.exit().remove();
            updateBarLabels
                .enter().append('text')
                .classed(DiscreteScoreFunctionRenderer_1.defs.BAR_LABEL, true)
                .attr('id', (d) => {
                return 'scorefunction-' + u.objective.getId() + '-' + d.element + '-label';
            });
            this.barLabels = labelsContainer.selectAll('.' + DiscreteScoreFunctionRenderer_1.defs.BAR_LABEL);
            // Create a selectable bar top for each new element in the Objective's domain. Note that this is all elements when the plot is first created.
            var updateBarTops = barsContainer.selectAll('.' + DiscreteScoreFunctionRenderer_1.defs.BAR_TOP)
                .data((d) => { return d.elements; });
            updateBarTops.exit().remove();
            updateBarTops
                .enter().append('rect')
                .classed(DiscreteScoreFunctionRenderer_1.defs.BAR_TOP, true)
                .attr('id', (d) => {
                return 'scorefunction-' + u.objective.getId() + '-' + d.element + '-bartop';
            });
            this.barTops = barsContainer.selectAll('.' + DiscreteScoreFunctionRenderer_1.defs.BAR_TOP);
        }
        /*
            @param u - The most recent ScoreFunctionUpdate message.
            @returns {void}
            @description	Positions the first coordinate and sizes the first dimension of elements making up the
                            domain and utility axes of the score function plot. This method should only be called when
                            there is a renderer update that actually requires reposition/sizing the first dimension of these
                            elements since this is a fairly costly operation. Changes of this form include:
                                - A new user is added to the plot, or a user is removed from the plot.
                                - The width of the area the plot will be rendered in has changed.
                                - The domain elements rendered in th plot have changed.
        */
        renderAxesDimensionOne(u) {
            super.renderAxesDimensionOne(u);
            // Fix domain labels positions specifically for the discrete plot.
            var labelCoordinateOneOffset;
            if (u.viewOrientation === types_1.ChartOrientation.Vertical) {
                labelCoordinateOneOffset = u.rendererConfig.labelOffset + 5;
            }
            else {
                labelCoordinateOneOffset = (1.5 * u.rendererConfig.labelOffset) + 5;
            }
            this.domainLabels.attr(u.rendererConfig.coordinateOne, (d, i) => { return (((u.rendererConfig.independentAxisCoordinateOne - u.rendererConfig.dependentAxisCoordinateOne) / this.domainSize) * i) + labelCoordinateOneOffset; }); // Position the domain labels at even intervals along the axis.
        }
        /*
            @param u - The most recent ScoreFunctionUpdate message.
            @param updateDimensionOne - Whether or not this (re-)rendering of the score function plot should also resize/position the first dimension of
                                        the plot elements. The first dimension is x if vertical orientation, y otherwise.
            @returns {void}
            @description	This method positions and styles the DiscreteScoreFunction specific elements of the score function plot. Specifically, it renders the bars, bar tops, and bar labels
                            of the bar chart. This method should NOT be called manually. Instead it should be used as a part of calling renderScoreFunction to re-render
                            the entire score function plot.
        */
        renderPlot(u, updateDimensionOne) {
            this.userContainers.data(u.scoreFunctionData);
            this.barContainer.data((d, i) => { return [d]; });
            this.utilityBars.data((d) => { return d.elements; });
            this.barTops.data((d) => { return d.elements; });
            this.renderDiscretePlotDimensionTwo(u);
            if (updateDimensionOne) {
                this.renderDiscretePlotDimensionOne(u);
            }
        }
        /*
            @param u - The most recent ScoreFunctionUpdate message.
            @returns {void}
            @description	This method positions and sizes the first coordinate/dimension of the DiscreteScoreFunction specific elements of the score function plot.
                            Specifically, it renders the bars, bar tops, and bar labels of the bar chart. This method should NOT be called manually. Instead it
                            should be used as a part of calling renderScoreFunction to re-render the entire score function plot.
        */
        renderDiscretePlotDimensionOne(u) {
            var barWidth = ((u.rendererConfig.dimensionOneSize / this.domainSize) / u.scoreFunctionData.length) / 2;
            // Position each users' container so theirs bars are properly offset from each other.
            this.userContainers
                .attr('transform', (d, i) => {
                return 'translate(' + ((u.viewOrientation === types_1.ChartOrientation.Vertical) ? ((barWidth * i) + ',0)') : ('0,' + (barWidth * i) + ')'));
            });
            // Render the utility bars.
            this.utilityBars
                .attr(u.rendererConfig.dimensionOne, barWidth)
                .attr(u.rendererConfig.coordinateOne, this.calculatePlotElementCoordinateOne);
            // Render the bar labels.
            this.barLabels
                .attr(u.rendererConfig.coordinateOne, (d, i) => { return this.calculatePlotElementCoordinateOne(d, i) + (barWidth / 3); });
            // Render the bar tops.
            this.barTops
                .attr(u.rendererConfig.dimensionOne, barWidth)
                .attr(u.rendererConfig.coordinateOne, this.calculatePlotElementCoordinateOne);
        }
        /*
            @param u - The most recent ScoreFunctionUpdate message.
            @returns {void}
            @description	This method positions and sizes the second coordinate/dimension of the DiscreteScoreFunction specific elements of the score function plot.
                            Specifically, it renders the bars, bar tops, and bar labels of the bar chart. This method should NOT be called manually. Instead it
                            should be used as a part of calling renderScoreFunction to re-render the entire score function plot.
        */
        renderDiscretePlotDimensionTwo(u) {
            // Assign this function to a variable because it is used multiple times. This is cleaner and faster than creating multiple copies of the same anonymous function.
            var calculateBarDimensionTwo = (d) => {
                return Math.max(u.heightScale(d.scoreFunction.getScore('' + d.element)), 2);
            };
            this.utilityBars
                .attr(u.rendererConfig.dimensionTwo, calculateBarDimensionTwo)
                .attr(u.rendererConfig.coordinateTwo, (d) => {
                return (u.viewOrientation === types_1.ChartOrientation.Vertical) ? u.rendererConfig.independentAxisCoordinateTwo - calculateBarDimensionTwo(d) : u.rendererConfig.independentAxisCoordinateTwo;
            });
            this.barLabels
                .text((d, i) => {
                return Math.round(100 * d.scoreFunction.getScore(d.element)) / 100;
            }).attr(u.rendererConfig.coordinateTwo, (d) => {
                return (u.viewOrientation === types_1.ChartOrientation.Vertical) ? (u.rendererConfig.independentAxisCoordinateTwo - calculateBarDimensionTwo(d)) - 2 : calculateBarDimensionTwo(d) + 30;
            });
            this.barTops
                .attr(u.rendererConfig.dimensionTwo, u.rendererConfig.labelOffset)
                .attr(u.rendererConfig.coordinateTwo, (d) => {
                return (u.viewOrientation === types_1.ChartOrientation.Vertical) ? u.rendererConfig.independentAxisCoordinateTwo - calculateBarDimensionTwo(d) - (u.rendererConfig.labelOffset / 2) : u.rendererConfig.independentAxisCoordinateTwo + calculateBarDimensionTwo(d) - (u.rendererConfig.labelOffset / 2);
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
            this.utilityBars.style('stroke', (d) => { return ((u.individual) ? u.objective.getColor() : d.color); });
            this.utilityBars.style('fill', (d) => { return ((u.individual) ? u.objective.getColor() : d.color); });
            this.barLabels.style('font-size', 8);
        }
        /*
            @param displayScoreFunctionValueLabels - A boolean value indicating whether or not to display the score labels.
            @returns {void}
            @description	This method toggles the visibility of score labels next to the bars in the bar chart.
        */
        toggleValueLabels(displayScoreFunctionValueLabels) {
            if (!this.barLabelContainer)
                return;
            if (displayScoreFunctionValueLabels) {
                // Display the labels.
                this.barLabelContainer.style('display', 'block');
            }
            else {
                // Hide the labels by hiding their container.
                this.barLabelContainer.style('display', 'none');
            }
        }
    };
    // class name definitions for SVG elements that are created by this renderer.
    DiscreteScoreFunctionRenderer.defs = Object.assign({
        BARS_CONTAINER: 'scorefunction-bars-container',
        BAR: 'scorefunction-bar',
        BAR_TOP: 'scorefunction-bartop',
        BAR_LABELS_CONTAINER: 'scorefunction-bar-labels-container',
        BAR_LABEL: 'scorefunction-bar-label'
    }, ScoreFunction_renderer_1.ScoreFunctionRenderer.defs);
    DiscreteScoreFunctionRenderer = DiscreteScoreFunctionRenderer_1 = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [services_1.ChartUndoRedoService])
    ], DiscreteScoreFunctionRenderer);
    return DiscreteScoreFunctionRenderer;
})();
exports.DiscreteScoreFunctionRenderer = DiscreteScoreFunctionRenderer;
//# sourceMappingURL=DiscreteScoreFunction.renderer.js.map