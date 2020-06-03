"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-07-19 19:57:28
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-06-01 14:05:39
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
exports.ScoreDistributionChartRenderer = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
// Import Libraries:
const d3 = require("d3");
// Import Application Classes: 
const utilities_1 = require("../utilities");
const types_1 = require("../../types");
// This class renders multiple users' ScoreFunctions for the same PrimitiveObjective into a series of box plots. These box plots visualize the 
// distribution of users' scores for the domain elements of the PrimitiveObjective and facilitate identification of disagreements concerning score assignments.
// This class should only be used to visualize MULTIPLE users' ScoreFunctions. Every box plot will appear as a single black line (since the sample 
// is of size one) if the ValueChart has only one user. Note that this class, similar to the ScoreFunctionRenderers, is used outside 
// of the ValueChartDirective's service environment and thus has very few dependencies. This should be maintained as much as possible. 
let ScoreDistributionChartRenderer = /** @class */ (() => {
    var ScoreDistributionChartRenderer_1;
    let ScoreDistributionChartRenderer = ScoreDistributionChartRenderer_1 = class ScoreDistributionChartRenderer {
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        /*
            @returns {void}
            @description 	Used for Angular's dependency injection. However, this class is also frequently constructed manually unlike the other renderer classes.
                            This constructor should not be used to do any initialization of the class. Note that the dependencies of the class are intentionally being kept to a minimum.
        */
        constructor(rendererScoreFunctionUtility) {
            this.rendererScoreFunctionUtility = rendererScoreFunctionUtility;
            // View configuration object:
            this.viewConfig = {};
            // Constants for positioning elements:
            this.coordinateOneOffset = 26;
            this.coordinateTwoOffset = 15;
            // ========================================================================================
            // 			Anonymous functions that are used often enough to be made class fields
            // ========================================================================================
            this.calculateBoxPlotCoordinateOne = (index) => (((this.viewConfig.dimensionOneSize - this.coordinateOneOffset) / this.elementUserScoresSummaries.length) * index) + (this.coordinateOneOffset + 10);
        }
        // ========================================================================================
        // 									Methods
        // ========================================================================================
        /*
            @param el - The element that to be used as the parent of the score distribution chart.
            @param objective - The objective that the score distribution chart is going to be for.
            @returns {void}
            @description	Creates the base containers and elements for a score distribution chart. It should be called when
                            creating an score distribution chart for the first time.
        */
        createScoreDistributionChart(el, objective, scoreFunctions) {
            this.rootContainer = el;
            var objectiveId = objective.getId();
            // Create the a container for the plot outlines, and the plot outlines itself.
            this.chartOutline = el.append('g')
                .classed(ScoreDistributionChartRenderer_1.defs.OUTLINE_CONTAINER, true)
                .attr('id', 'distribution-' + objectiveId + '-outline-container')
                .append('rect')
                .classed(ScoreDistributionChartRenderer_1.defs.OUTLINE, true)
                .attr('id', 'distribution-' + objectiveId + '-outline')
                .classed('valuechart-outline', true);
            // Create a container to hold all the elements of the chart.
            this.chartContainer = el.append('g')
                .classed(ScoreDistributionChartRenderer_1.defs.CHART_CONTAINER, true)
                .attr('id', 'distribution-' + objectiveId + '-chart-container');
            // Create the container to hold the axes of the chart.
            this.axesContainer = this.chartContainer.append('g')
                .classed(ScoreDistributionChartRenderer_1.defs.AXES_CONTAINER, true)
                .attr('id', 'distribution-' + objective.getId() + '-axes-container');
            // Create a container to hold the score (y) axis.
            this.scoreAxisContainer = this.axesContainer.append('g')
                .classed(ScoreDistributionChartRenderer_1.defs.SCORE_AXIS_CONTAINER, true)
                .attr('id', 'distribution-' + objective.getId() + '-score-axis-container');
            // Create a container to hold the domain (x) axis.
            this.domainAxisContainer = this.axesContainer.append('g')
                .classed(ScoreDistributionChartRenderer_1.defs.DOMAIN_AXIS_CONTAINER, true)
                .attr('id', 'distribution-' + objective.getId() + '-domain-axis-container');
            // Retrieve the data for the summary chart and save it as a class field.
            var elementUserScoresSummaries = this.rendererScoreFunctionUtility.getAllScoreFunctionDataSummaries(objective, scoreFunctions);
            this.elementUserScoresSummaries = elementUserScoresSummaries.slice();
            this.createDomainAxis(this.domainAxisContainer, objective, elementUserScoresSummaries);
            this.createBoxPlots(this.chartContainer, objective, elementUserScoresSummaries);
        }
        /*
            @param domainAxisContainer - The 'g' element that to be used as the parent of the domain axis elements.
            @param objective - The objective that the score distribution chart is going to be for.
            @param elementUserScoresSummaries - the properly formatted data for rendering the score distribution plot.
            @returns {void}
            @description	Creates the domain axis for a score distribution plot. It should NOT be called manually.
        */
        createDomainAxis(domainAxisContainer, objective, elementUserScoresSummaries) {
            // Create the line that will act as the domain axis.
            this.domainAxis = domainAxisContainer.append('line')
                .classed(ScoreDistributionChartRenderer_1.defs.DOMAIN_AXIS, true)
                .attr('id', 'distribution-' + objective.getId() + '-domain-axis');
            // Create a container for the domain axis labels.
            this.domainLabelsContainer = domainAxisContainer.append('g')
                .classed(ScoreDistributionChartRenderer_1.defs.DOMAIN_LABELS_CONTAINER, true)
                .attr('id', 'distribution-' + objective.getId() + 'domain-labels-container');
            // Create the labels for the domain axis.
            this.domainLabelsContainer.selectAll('.' + ScoreDistributionChartRenderer_1.defs.DOMAIN_LABEL)
                .data(elementUserScoresSummaries)
                .enter().append('text')
                .classed(ScoreDistributionChartRenderer_1.defs.DOMAIN_LABEL, true)
                .attr('id', (d) => { return 'distribution-' + d.element + '-domain-label'; });
            // Save the domain labels as a field.
            this.domainLabels = this.domainLabelsContainer.selectAll('.' + ScoreDistributionChartRenderer_1.defs.DOMAIN_LABEL);
        }
        /*
            @param chartContainer - The 'g' element that to be used as the parent of the box plots in the score distribution chart.
            @param objective - The objective that the score distribution chart is going to be for.
            @param elementUserScoresSummaries - the properly formatted data for rendering the score distribution plot.
            @returns {void}
            @description	Creates the box plots for the score distribution chart by first creating the box plot containers and then calling createBoxPlotElements.
        */
        createBoxPlots(chartContainer, objective, elementUserScoresSummaries) {
            chartContainer.append('g')
                .classed(ScoreDistributionChartRenderer_1.defs.BOXPLOT_CONTAINERS_CONTAINER, true)
                .attr('id', 'distribution-' + objective.getId() + '-boxplot-containers-container')
                .selectAll('.' + ScoreDistributionChartRenderer_1.defs.BOXPLOT_CONTAINER)
                .data(elementUserScoresSummaries)
                .enter().append('g')
                .classed(ScoreDistributionChartRenderer_1.defs.BOXPLOT_CONTAINER, true)
                .attr('id', (d) => { return 'distribution-' + d.element + '-boxplot-container'; });
            this.boxplotContainers = chartContainer.selectAll('.' + ScoreDistributionChartRenderer_1.defs.BOXPLOT_CONTAINER);
            this.createBoxPlotElements(this.boxplotContainers, objective, elementUserScoresSummaries);
        }
        /*
            @param boxplotContainers - The selection of 'g' elements that are to be used as the parents of each box plot in the score distribution chart. That should be exactly one 'g' element per element in the objective's domain.
            @param objective - The objective that the score distribution chart is going to be for.
            @param elementUserScoresSummaries - the properly formatted data for rendering the score distribution plot.
            @returns {void}
            @description	Creates the box plots for the score distribution chart by first creating the box plot containers and then calling createBoxPlotElements.
        */
        createBoxPlotElements(boxplotContainers, objective, elementUserScoresSummaries) {
            // Create the quartile outline rectangles for each box plot.
            this.boxplotQuartileOutlines = boxplotContainers.append('rect')
                .classed(ScoreDistributionChartRenderer_1.defs.BOXPLOT_QUARTILE_OUTLINE, true);
            // Create the max lines for each box plot.
            this.boxplotMaxLines = boxplotContainers.append('line')
                .classed(ScoreDistributionChartRenderer_1.defs.BOXPLOT_MAX_LINE, true);
            // Create the min lines for each box plot.
            this.boxplotMinLines = boxplotContainers.append('line')
                .classed(ScoreDistributionChartRenderer_1.defs.BOXPLOT_MIN_LINE, true);
            // Create the median lines for each box plot.
            this.boxplotMedianLines = boxplotContainers.append('line')
                .classed(ScoreDistributionChartRenderer_1.defs.BOXPLOT_MEDIAN_LINE, true);
            // Create the dashed lines that connect the quartile outlines to the max lines for each box plot.
            this.boxplotUpperDashedLines = boxplotContainers.append('line')
                .classed(ScoreDistributionChartRenderer_1.defs.BOXPLOT_DASHED_LINE, true)
                .classed('dashed-line', true);
            // Create the dashed lines that connect the quartile outlines to the min lines for each box plot.
            this.boxplotLowerDashedLines = boxplotContainers.append('line')
                .classed(ScoreDistributionChartRenderer_1.defs.BOXPLOT_DASHED_LINE, true)
                .classed('dashed-line', true);
        }
        /*
            @param width - The width of the area in which to render the score distribution chart. In pixel coordinates.
            @param height - The width of the area in which to render the score distribution chart. In pixel coordinates.
            @param viewOrientation - The view orientation in which to render the score distribution chart. Must be either 'vertical', or 'horizontal'.
            @returns {void}
            @description	Initializes the view configuration for the score distribution plot, and then positions + styles its elements. This method should be used
                            whenever the score distribution plot needs to be rendered for the first time, or when updated in response to changes to users' ScoreFunctions.
                            View configuration must be done here because this class intentionally avoids using the renderConfigService class. It uses calls to the
                            helper methods method to render the different parts of the score distribution plot.
        */
        renderScoreDistributionChart(width, height, viewOrientation) {
            // Initialize view configuration. This code is very similar to that is renderConfigService, and it is here because we are intentionally avoiding a dependency on renderConfigService.
            if (viewOrientation === types_1.ChartOrientation.Vertical) {
                this.viewConfig.dimensionOne = 'width';
                this.viewConfig.dimensionTwo = 'height';
                this.viewConfig.coordinateOne = 'x';
                this.viewConfig.coordinateTwo = 'y';
                this.viewConfig.dimensionOneSize = width;
                this.viewConfig.dimensionTwoSize = height;
            }
            else {
                this.viewConfig.dimensionOne = 'height';
                this.viewConfig.dimensionTwo = 'width';
                this.viewConfig.coordinateOne = 'y';
                this.viewConfig.coordinateTwo = 'x';
                this.viewConfig.dimensionOneSize = height;
                this.viewConfig.dimensionTwoSize = width;
            }
            // Render the chart outline.
            this.chartOutline
                .attr(this.viewConfig.dimensionOne, this.viewConfig.dimensionOneSize - 1)
                .attr(this.viewConfig.dimensionTwo, this.viewConfig.dimensionTwoSize);
            // Render the axes and the box plots.
            this.renderAxes(this.axesContainer, viewOrientation);
            this.renderBoxPlots(this.boxplotContainers, this.elementUserScoresSummaries, viewOrientation);
        }
        /*
            @param axesContainer - The 'g' element which contains the elements making up the domain and score axes.
            @param viewOrientation - The view orientation in which to render the score distribution chart. Must be either 'vertical', or 'horizontal'.
            @returns {void}
            @description	Position and styles the domain and score axes of the chart. This method should NOT be called manually.
        */
        renderAxes(axesContainer, viewOrientation) {
            // Delete the elements of the previous scale:
            this.renderDomainAxis(this.domainAxis, this.domainLabels, viewOrientation);
            this.renderScoreAxis(this.scoreAxisContainer, viewOrientation);
        }
        /*
            @param domainAxis - The 'line' element that is used as the domain axis.
            @param domainLabels - The 'text' elements that are used as labels for the domain axis.
            @param viewOrientation - The view orientation in which to render the score distribution chart. Must be either 'vertical', or 'horizontal'.
            @returns {void}
            @description	Positions and styles the domain axis of the chart. This method should NOT be called manually.
        */
        renderDomainAxis(domainAxis, domainLabels, viewOrientation) {
            // This function is used to determine the coordinate two position of the domain axis.
            var calculateDomainAxisCoordinateTwo = () => {
                return (viewOrientation === types_1.ChartOrientation.Vertical) ?
                    (this.viewConfig.dimensionTwoSize - this.coordinateTwoOffset) + 0.5
                    :
                        this.coordinateTwoOffset;
            };
            // The offset of domain labels from the domain axis.
            var labelOffset = 8;
            // Position and style the domain axis
            domainAxis
                .attr(this.viewConfig.coordinateOne + '1', this.coordinateOneOffset)
                .attr(this.viewConfig.coordinateTwo + '1', calculateDomainAxisCoordinateTwo)
                .attr(this.viewConfig.coordinateOne + '2', this.viewConfig.dimensionOneSize)
                .attr(this.viewConfig.coordinateTwo + '2', calculateDomainAxisCoordinateTwo)
                .style('stroke-wdith', 2)
                .style('stroke', 'black');
            // Position the domain labels along the axis.
            domainLabels
                .text((d) => { return d.element; })
                .attr(this.viewConfig.coordinateOne, (d, i) => { return this.calculateBoxPlotCoordinateOne(i) + labelOffset; })
                .attr(this.viewConfig.coordinateTwo, () => { return calculateDomainAxisCoordinateTwo() + ((viewOrientation === types_1.ChartOrientation.Vertical) ? (this.coordinateTwoOffset / 2) : -(this.coordinateTwoOffset / 2)); })
                .style('font-size', 8);
        }
        /*
            @param scoreAxisContainer - The 'g' element which contains the elements making up the score axis.
            @param viewOrientation - The view orientation in which to render the score distribution chart. Must be either 'vertical', or 'horizontal'.
            @returns {void}
            @description	Positions and styles the score axis of the chart. This method should NOT be called manually.
        */
        renderScoreAxis(scoreAxisContainer, viewOrientation) {
            // Delete elements from a previous rendering of the score axis. This must be done because we are using d3's axis generating methods.
            var elements = scoreAxisContainer.node().children;
            for (var i = 0; i < elements.length; i++) {
                elements[i].remove();
            }
            // Create the new Scale to be used to create the score axis.
            var scoreAxisScale = d3.scaleLinear()
                .domain([0, 1]); // Set the domain of the score axis to be from 0 to 1, inclusive.
            // Calculate the height of the score axis based on the size of the score distribution chart.
            var scoreAxisHeight = (this.viewConfig.dimensionTwoSize) - (1.5 * this.coordinateTwoOffset);
            var scoreAxis;
            // Position the score axis correctly depending on the view orientation of the chart.
            if (viewOrientation === types_1.ChartOrientation.Vertical) {
                scoreAxisScale.range([scoreAxisHeight, 0]);
                scoreAxis = d3.axisLeft(scoreAxisScale);
                scoreAxisContainer.attr('transform', 'translate(' + this.coordinateOneOffset + ',' + (this.coordinateTwoOffset / 2) + ')');
            }
            else {
                scoreAxisScale.range([0, scoreAxisHeight]);
                scoreAxis = d3.axisTop(scoreAxisScale);
                scoreAxisContainer.attr('transform', 'translate(' + (this.coordinateTwoOffset / 2) + ',' + this.coordinateOneOffset + ')');
            }
            scoreAxis.ticks(20); // Set the number of ticks on the score axis.
            scoreAxisContainer.call(scoreAxis) // Create the score axis.
                .style('font-size', 8); // Set the size of the labels on the score axis by setting the font-size.
        }
        /*
            @param boxplotContainers - The selection of 'g' element which contain the elements up the box plots. Each 'g' element should contain the SVG elements for one box plot.
                                        There should be one 'g' element per element in the domain of the objective being rendered.
            @param elementUserScoresSummaries - The properly formatted data for rendering the score distribution plot.
            @param viewOrientation - The view orientation in which to render the score distribution chart. Must be either 'vertical', or 'horizontal'.
            @returns {void}
            @description	Positions and styles the box plots that make up the score distribution first chart. This method first positions the them by positioning their containers,
                            and then it calls renderBoxPlotElements to render their elements. This method should NOT be called manually. Instead, call renderScoreDistributionChart
                            to render the entire chart at once.
        */
        renderBoxPlots(boxplotContainers, elementUserScoresSummaries, viewOrientation) {
            // Position each of the box plots by positioning their containers. 
            boxplotContainers.attr('transform', (d, i) => {
                let offset = this.calculateBoxPlotCoordinateOne(i);
                return 'translate(' + ((viewOrientation === types_1.ChartOrientation.Vertical) ? offset : 0) + ',' + ((viewOrientation === types_1.ChartOrientation.Vertical) ? 0 : offset) + ')';
            });
            this.renderBoxPlotElements(elementUserScoresSummaries, viewOrientation);
        }
        /*
            @param elementUserScoresSummaries - The properly formatted data for rendering the score distribution plot.
            @param viewOrientation - The view orientation in which to render the score distribution chart. Must be either 'vertical', or 'horizontal'.
            @returns {void}
            @description	Positions and styles the elements making up the score distribution chart's box plots. This method should NOT be called manually. Instead, call renderScoreDistributionChart
                            to render the entire chart at once.
        */
        renderBoxPlotElements(elementUserScoresSummaries, viewOrientation) {
            var boxplotWidth = ((this.viewConfig.dimensionOneSize / elementUserScoresSummaries.length) / 2);
            // Configure the scale that is used to translate between score values and pixel coordinates.
            var heightScale = d3.scaleLinear()
                .domain([0, 1])
                .range([0, (this.viewConfig.dimensionTwoSize - (1.5 * this.coordinateTwoOffset)) - 1]);
            var calculateCoordinateTwoPosition = (score) => { return this.viewConfig.dimensionTwoSize - (heightScale(score) + this.coordinateTwoOffset); };
            // Render the quartile outlines.
            this.boxplotQuartileOutlines
                .attr(this.viewConfig.dimensionOne, boxplotWidth)
                .attr(this.viewConfig.dimensionTwo, (d, i) => { return heightScale(d.thirdQuartile - d.firstQuartile); })
                .attr(this.viewConfig.coordinateOne, 0)
                .attr(this.viewConfig.coordinateTwo, (d, i) => { return calculateCoordinateTwoPosition(d.thirdQuartile); })
                .style('fill', 'white')
                .style('fill-opactiy', 0)
                .style('stroke', '#5a5757')
                .style('stroke-width', 1);
            // Render the median lines.
            this.boxplotMedianLines
                .attr(this.viewConfig.coordinateOne + '1', 0)
                .attr(this.viewConfig.coordinateTwo + '1', (d) => { return calculateCoordinateTwoPosition(d.median); })
                .attr(this.viewConfig.coordinateOne + '2', boxplotWidth)
                .attr(this.viewConfig.coordinateTwo + '2', (d) => { return calculateCoordinateTwoPosition(d.median); })
                .style('stroke', 'black')
                .style('stroke-width', 2);
            // Render the max lines.
            this.boxplotMaxLines
                .attr(this.viewConfig.coordinateOne + '1', 0)
                .attr(this.viewConfig.coordinateTwo + '1', (d) => { return calculateCoordinateTwoPosition(d.max); })
                .attr(this.viewConfig.coordinateOne + '2', boxplotWidth)
                .attr(this.viewConfig.coordinateTwo + '2', (d) => { return calculateCoordinateTwoPosition(d.max); })
                .style('stroke', 'black')
                .style('stroke-width', 2);
            // Render the min lines.
            this.boxplotMinLines
                .attr(this.viewConfig.coordinateOne + '1', 0)
                .attr(this.viewConfig.coordinateTwo + '1', (d) => { return calculateCoordinateTwoPosition(d.min); })
                .attr(this.viewConfig.coordinateOne + '2', boxplotWidth)
                .attr(this.viewConfig.coordinateTwo + '2', (d) => { return calculateCoordinateTwoPosition(d.min); })
                .style('stroke', 'black')
                .style('stroke-width', 2);
            // Render the lines connecting the max lines and quartile outlines.
            this.boxplotUpperDashedLines
                .attr(this.viewConfig.coordinateOne + '1', boxplotWidth / 2)
                .attr(this.viewConfig.coordinateTwo + '1', (d) => { return calculateCoordinateTwoPosition(d.max); })
                .attr(this.viewConfig.coordinateOne + '2', boxplotWidth / 2)
                .attr(this.viewConfig.coordinateTwo + '2', (d) => { return calculateCoordinateTwoPosition(d.thirdQuartile); });
            // Render the lines connecting the min lines and quartile outlines.
            this.boxplotLowerDashedLines
                .attr(this.viewConfig.coordinateOne + '1', boxplotWidth / 2)
                .attr(this.viewConfig.coordinateTwo + '1', (d) => { return calculateCoordinateTwoPosition(d.firstQuartile); })
                .attr(this.viewConfig.coordinateOne + '2', boxplotWidth / 2)
                .attr(this.viewConfig.coordinateTwo + '2', (d) => { return calculateCoordinateTwoPosition(d.min); });
        }
    };
    // class name definitions for SVG elements that are created by this renderer.
    ScoreDistributionChartRenderer.defs = {
        OUTLINE_CONTAINER: 'distribution-outline-container',
        OUTLINE: 'distribution-outline',
        CHART_CONTAINER: 'distribution-chart-container',
        BOXPLOT_CONTAINERS_CONTAINER: 'distribution-boxplot-containers-container',
        BOXPLOT_CONTAINER: 'distribution-boxplot-container',
        BOXPLOT_QUARTILE_OUTLINE: 'distribution-boxplot-quartile-outline',
        BOXPLOT_MAX_LINE: 'distribution-boxplot-max-line',
        BOXPLOT_MIN_LINE: 'distribution-boxplot-min-line',
        BOXPLOT_MEDIAN_LINE: 'distribution-boxplot-median-line',
        BOXPLOT_DASHED_LINE: 'distribution-boxplot-dashed-line',
        AXES_CONTAINER: 'distribution-axes-container',
        SCORE_AXIS_CONTAINER: 'distribution-score-axis-container',
        DOMAIN_AXIS_CONTAINER: 'distribution-domain-axis-container',
        DOMAIN_AXIS: 'distribution-domain-axis',
        DOMAIN_LABELS_CONTAINER: 'distribution-domain-labels-container',
        DOMAIN_LABEL: 'distribution-domain-label',
    };
    ScoreDistributionChartRenderer = ScoreDistributionChartRenderer_1 = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [utilities_1.RendererScoreFunctionUtility])
    ], ScoreDistributionChartRenderer);
    return ScoreDistributionChartRenderer;
})();
exports.ScoreDistributionChartRenderer = ScoreDistributionChartRenderer;
//# sourceMappingURL=ScoreDistributionChart.renderer.js.map