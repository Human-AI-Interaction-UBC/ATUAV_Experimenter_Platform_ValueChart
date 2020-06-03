"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-06-07 15:34:15
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-07-24 10:28:42
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
exports.ScoreFunctionRenderer = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
// Import Libraries:
const d3 = require("d3");
// Import Application Classes:
const services_1 = require("../services");
const interactions_1 = require("../interactions");
const interactions_2 = require("../interactions");
const types_1 = require("../../types");
// This class is the base class for DiscreteScoreFuntionRenderer, and ContinuousScoreFunctionRenderer. It contains the logic for creating and rendering the 
// axis, labels, and base containers of a ScoreFunction. It is an abstract class and should NOT be instantiated or used for any reason. This class has 
// uses outside of rendering a ValueChart, and as such is decoupled as much as possible from the services associated with the ValueChartDirective.
let ScoreFunctionRenderer = /** @class */ (() => {
    var ScoreFunctionRenderer_1;
    let ScoreFunctionRenderer = ScoreFunctionRenderer_1 = class ScoreFunctionRenderer {
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        /*
            @returns {void}
            @description 	Used for Angular's dependency injection. However, this class is frequently constructed manually unlike the other renderer classes.
                            This constructor should not be used to do any initialization of the class. Note that the dependencies of the class are intentionally being kept to a minimum.
        */
        constructor(chartUndoRedoService) {
            this.chartUndoRedoService = chartUndoRedoService;
            // ========================================================================================
            // 									Fields
            // ========================================================================================
            this.minimumDimension = 50;
            // ========================================================================================
            // 									Methods
            // ========================================================================================
            /*
                @param update - The ScoreFunctionUpdate message sent to the LabelRenderer to initiate a re-rendering of the score function.
                                This message is almost always dispatched from the labelRenderer or the ScoreFunctionDirective in response to
                                a message from the ValueChartDirective (first case) or a change in the Directive's inputs (second case).
                @returns {void}
                @description	This method is used as the observer/handler of messages from the rendering pipeline and thus controls how and when the
                                label area is rendered.
            */
            this.scoreFunctionChanged = (update) => {
                // Check to see if this update is going to require re-rendering the first dimension of the score function plot.
                // Rendering the first dimension is expensive and usually not required - most updates are caused by changing user
                // weights or score functions and only require re-rendering the second dimension.
                if (this.lastRendererUpdate)
                    var dimensionOneChanged = this.lastRendererUpdate.rendererConfig.dimensionOneSize !== update.rendererConfig.dimensionOneSize;
                this.lastRendererUpdate = update;
                // If the root container is undefined, then the score function has never been rendered and needs to be constructed for the first time.
                if (this.rootContainer == undefined) {
                    this.createScoreFunction(update);
                    this.renderScoreFunction(update, (this.numUsers != update.scoreFunctions.length || this.viewOrientation != update.viewOrientation));
                    this.applyStyles(update);
                    this.numUsers = update.scoreFunctions.length;
                    return;
                }
                // The plot structure (SVG elements) must be updated if the number of users has changed.
                if (this.numUsers != update.scoreFunctions.length) {
                    this.createPlot(update, this.plotElementsContainer, this.domainLabelContainer);
                }
                this.updateInteractions(update);
                this.renderScoreFunction(update, (this.numUsers != update.scoreFunctions.length || this.viewOrientation != update.viewOrientation || dimensionOneChanged));
                // If the update requires updating the styles, then do so.
                if (update.styleUpdate) {
                    this.applyStyles(update);
                }
                this.numUsers = update.scoreFunctions.length;
                this.viewOrientation = update.viewOrientation;
            };
            /*
                @param displayScoreFunctionValueLabels - whether or not score function value labels should be displayed. These labels show exactly what
                                                         utility is assigned to each rendered domain element.
                @returns {void}
                @description	This method is used as the observer/handler of messages from the view config pipeline and thus controls how and when the
                                score function view options are turned on and off.
            */
            this.viewConfigChanged = (displayScoreFunctionValueLabels) => {
                this.toggleValueLabels(displayScoreFunctionValueLabels);
            };
            /*
                @param interactionConfig - The interactionConfig message sent to the ScoreFunctionRenderer to update interaction settings.
                @returns {void}
                @description	This method is used as the observer/handler of messages from the interactions pipeline and thus controls how and when the
                                score function interactions are turned on and off.
            */
            this.interactionConfigChanged = (interactionConfig) => {
                this.expandScoreFunctionInteraction.toggleExpandScoreFunction(interactionConfig.expandScoreFunctions, this.rootContainer.node().querySelectorAll('.' + ScoreFunctionRenderer_1.defs.PLOT_OUTLINE), this.lastRendererUpdate);
            };
            /*
                @param u - The most recent ScoreFunctionUpdate message.
                @returns {void}
                @description	Update the lastRendererUpdate fields of the interactions associated with the ScoreFunctionRenderer with the most recent ScoreFunctionUpdate message.
                                It is critical to the correct operation of the interaction classes that these fields remain synched with lastRendererUpdate field
                                in the ScoreFunctionRenderer instance.
            */
            this.updateInteractions = (u) => {
                this.expandScoreFunctionInteraction.lastRendererUpdate = u;
                this.adjustScoreFunctionInteraction.lastRendererUpdate = u;
            };
            // ========================================================================================
            // 			Anonymous functions that are used often enough to be made class fields
            // ========================================================================================
            this.calculatePlotElementCoordinateOne = (d, i) => { return (((this.lastRendererUpdate.rendererConfig.independentAxisCoordinateOne - this.lastRendererUpdate.rendererConfig.dependentAxisCoordinateOne) / this.domainSize) * i) + this.lastRendererUpdate.rendererConfig.labelOffset * 1.5; };
            this.adjustScoreFunctionInteraction = new interactions_2.AdjustScoreFunctionInteraction(this.chartUndoRedoService);
            this.expandScoreFunctionInteraction = new interactions_1.ExpandScoreFunctionInteraction(this.chartUndoRedoService);
        }
        /*
            @param u - The most recent ScoreFunctionUpdate message.
            @returns {void}
            @description 	Creates the base containers and elements for a score function plot. It should be called as the first step of creating a score function plot.
                            sub classes of this class should call createScoreFunction before creating any of their specific elements.
        */
        createScoreFunction(u) {
            var objectiveId = u.objective.getId();
            this.objective = u.objective;
            // The root container is passed in.
            this.rootContainer = u.el;
            // Create the a container for the plot outlines, and the plot outlines itself.
            this.outlineContainer = u.el.append('g')
                .classed(ScoreFunctionRenderer_1.defs.OUTLINE_CONTAINER, true)
                .attr('id', 'scorefunction-' + objectiveId + '-outline-container');
            this.plotOutline = this.outlineContainer
                .append('rect')
                .classed(ScoreFunctionRenderer_1.defs.PLOT_OUTLINE, true)
                .attr('id', 'scorefunction-' + objectiveId + '-outline')
                .classed('valuechart-outline', true);
            // Create a container to hold all the elements of the plot.
            this.plotContainer = u.el.append('g')
                .classed(ScoreFunctionRenderer_1.defs.PLOT_CONTAINER, true)
                .attr('id', 'scorefunction-' + objectiveId + '-plot-container');
            this.createScoreFunctionAxis(this.plotContainer, objectiveId);
            this.domainLabelContainer = this.plotContainer.append('g') // Create a container to hold the domain axis labels.
                .classed(ScoreFunctionRenderer_1.defs.DOMAIN_LABELS_CONTAINER, true)
                .attr('id', 'scorefunction-' + objectiveId + '-domain-labels-container');
            this.plotElementsContainer = this.plotContainer.append('g') // create a container to hold all the elements of the plot, like points, lines, bars, etc.
                .classed(ScoreFunctionRenderer_1.defs.PLOT_ELEMENTS_CONTAINER, true)
                .classed('scorefunction-' + objectiveId + '-plot-elements-container', true);
            this.clickToExpandText = this.rootContainer.append('text')
                .classed(ScoreFunctionRenderer_1.defs.EXPAND_TEXT, true)
                .attr('id', (d) => {
                return 'scorefunction-' + u.objective.getId() + '-expand-text';
            })
                .text('Double Click to Expand');
            this.createPlot(u, this.plotElementsContainer, this.domainLabelContainer);
        }
        /*
            @param plotContainer - The 'g' element that is intended to contain the score function plot.
            @param objectiveId - The id of the objective for which this score function plot is being created. This is for use in setting element IDs.
            @returns {void}
            @description 	Creates the axes of a score function plot, both x and y, and creates the utility axis labels.
                            Note that the domain labels are created in createPlot because they are data dependent.
        */
        createScoreFunctionAxis(plotContainer, objectiveId) {
            this.axisContainer = plotContainer.append('g')
                .classed(ScoreFunctionRenderer_1.defs.AXES_CONTAINER, true)
                .attr('id', 'scorefunction-' + objectiveId + '-axes-container');
            this.domainAxis = this.axisContainer.append('line')
                .classed(ScoreFunctionRenderer_1.defs.DOMAIN_AXIS, true)
                .attr('id', 'scorefunction-' + objectiveId + '-domain-axis');
            let unitsText = "";
            let dom = this.objective.getDomain();
            if (dom.type === 'continuous' && dom.unit !== undefined) {
                unitsText = dom.unit;
            }
            this.unitsLabel = this.axisContainer.append('text')
                .classed(ScoreFunctionRenderer_1.defs.UNITS_LABEL, true)
                .attr('id', 'scorefunction-' + objectiveId + '-units-label')
                .text(unitsText);
            this.utilityAxisContainer = this.axisContainer.append('g')
                .classed(ScoreFunctionRenderer_1.defs.UTILITY_AXIS_CONTAINER, true)
                .attr('id', 'scorefunction-' + objectiveId + '-utility-axis-container');
        }
        /*
            @param u - The most recent ScoreFunctionUpdate message.
            @param plotElementsContainer - The 'g' element that is intended to contain the user containers. These are 'g' elements that will contain the parts of each users plot (bars/points).
            @param domainLabelContainer - The 'g' element that is intended to contain the labels for the domain (x) axis.
            @returns {void}
            @description 	Creates the user containers, which will contain each user's plot elements, and the domain labels for the domain element axis.
                            DiscreteScoreFunction and ContinuousScoreFunction extend this method in order to create the additional SVG elements they need.
                            This method is also used to update a score function plot when the Users change.
        */
        createPlot(u, plotElementsContainer, domainLabelContainer) {
            var objectiveId = u.objective.getId();
            // Create the user containers. Each user should have one 'g' element that will hold the elements of its plot. Elements refers to bars, points, fit lines, etc.
            var updateUserContainers = plotElementsContainer.selectAll('.' + ScoreFunctionRenderer_1.defs.USER_CONTAINER)
                .data(u.scoreFunctionData);
            updateUserContainers.exit().remove();
            updateUserContainers.enter().append('g')
                .classed(ScoreFunctionRenderer_1.defs.USER_CONTAINER, true)
                .attr('id', (d) => { return 'scorefunction-' + d.color.replace(/\s+/g, '') + '-container'; });
            this.userContainers = plotElementsContainer.selectAll('.' + ScoreFunctionRenderer_1.defs.USER_CONTAINER);
            var updateDomainLabels = domainLabelContainer.selectAll('.' + ScoreFunctionRenderer_1.defs.DOMAIN_LABEL)
                .data(u.scoreFunctionData.length > 0 ? u.scoreFunctionData[0].elements : []);
            updateDomainLabels.exit().remove();
            // Create one label for each element of the PrimitiveObjective's domain.
            updateDomainLabels
                .enter().append('text')
                .classed(ScoreFunctionRenderer_1.defs.DOMAIN_LABEL, true)
                .attr('id', (d) => {
                return 'scorefunction-' + objectiveId + '-' + d.element + '-label';
            });
            this.domainLabels = domainLabelContainer.selectAll('.' + ScoreFunctionRenderer_1.defs.DOMAIN_LABEL);
        }
        /*
            @param u - The most recent ScoreFunctionUpdate message.
            @param updateDimensionOne - Whether or not this (re)-rendering of the score function plot should also resize/position the first dimension of
                                        the plot elements. The first dimension is x if vertical orientation, y otherwise.
            @returns {void}
            @description	Positions + styles the elements making up the score function plot. This method should be used
                            whenever the score function plot needs to be rendered for the first time, or when updated in response to changes to users' ScoreFunctions.
                            It uses calls to the render plot method (which is overwritten by subclasses), renderAxesDimensionTwo, and renderAxesDimensionOne
                            to render the different parts of the score function plot.
        */
        renderScoreFunction(u, updateDimensionOne) {
            this.domainSize = u.scoreFunctionData.length > 0 ? u.scoreFunctionData[0].elements.length : 0;
            this.toggleDisplay(u);
            // Give the plot outline the correct dimensions.
            this.plotOutline
                .attr(u.rendererConfig.dimensionOne, u.rendererConfig.dimensionOneSize - 1)
                .attr(u.rendererConfig.dimensionTwo, u.rendererConfig.dimensionTwoSize);
            this.renderAxesDimensionTwo(u);
            // Render the first dimension of the utility and domain axes if we need to.
            if (updateDimensionOne)
                this.renderAxesDimensionOne(u);
            // Position the text elements that are shown when the score function does not have enough space to render.
            if (u.viewOrientation == types_1.ChartOrientation.Vertical) {
                this.clickToExpandText.attr(u.rendererConfig.coordinateOne, 0);
                this.clickToExpandText.attr(u.rendererConfig.coordinateTwo, u.rendererConfig.dimensionTwoSize / 2);
            }
            else {
                this.clickToExpandText.attr(u.rendererConfig.coordinateOne, u.rendererConfig.dimensionOneSize / 2);
                this.clickToExpandText.attr(u.rendererConfig.coordinateTwo, 0);
            }
            this.renderPlot(u, updateDimensionOne);
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
            // Position the domain axis.
            this.domainAxis
                .attr(u.rendererConfig.coordinateOne + '1', u.rendererConfig.dependentAxisCoordinateOne)
                .attr(u.rendererConfig.coordinateOne + '2', u.rendererConfig.independentAxisCoordinateOne);
            this.unitsLabel
                .attr(u.rendererConfig.coordinateOne, u.rendererConfig.independentAxisCoordinateOne / 2);
            var labelCoordinateOneOffset;
            if (u.viewOrientation === types_1.ChartOrientation.Vertical) {
                labelCoordinateOneOffset = u.rendererConfig.labelOffset;
            }
            else {
                labelCoordinateOneOffset = (1.5 * u.rendererConfig.labelOffset);
            }
            // Position the domain labels along the domain (x) axis.
            this.domainLabels
                .attr(u.rendererConfig.coordinateOne, (d, i) => { return (((u.rendererConfig.independentAxisCoordinateOne - u.rendererConfig.dependentAxisCoordinateOne) / this.domainSize) * i) + labelCoordinateOneOffset; }) // Position the domain labels at even intervals along the axis.
                .text((d) => { return d.element; });
        }
        /*
            @param u - The most recent ScoreFunctionUpdate message.
            @returns {void}
            @description	Positions and sizes the second coordinate/dimension elements of both the domain (y) and utility axes (x). This method should NOT be called manually. Rendering
                            the axes elements should be done as part of a call to renderScoreFunction instead. Most re-rendering cycles
                            only require calling this function (not rednerAxesDimensionOne).
        */
        renderAxesDimensionTwo(u) {
            this.domainAxis
                .attr(u.rendererConfig.coordinateTwo + '1', u.rendererConfig.independentAxisCoordinateTwo)
                .attr(u.rendererConfig.coordinateTwo + '2', u.rendererConfig.independentAxisCoordinateTwo);
            this.unitsLabel
                .attr(u.rendererConfig.coordinateTwo, u.rendererConfig.independentAxisCoordinateTwo + u.rendererConfig.labelOffset - 2);
            var labelCoordinateTwo;
            if (u.viewOrientation === types_1.ChartOrientation.Vertical) {
                labelCoordinateTwo = u.rendererConfig.independentAxisCoordinateTwo + u.rendererConfig.labelOffset - 12;
            }
            else {
                labelCoordinateTwo = u.rendererConfig.independentAxisCoordinateTwo - (u.rendererConfig.labelOffset);
            }
            this.domainLabels
                .attr(u.rendererConfig.coordinateTwo, labelCoordinateTwo);
            // Delete the elements of the previous utility axis.
            var elements = this.utilityAxisContainer.node().children;
            for (var i = 0; i < elements.length; i++) {
                elements[i].remove();
            }
            // Create the new Scale for use creating the utility axis.
            var uilityScale = d3.scaleLinear()
                .domain([0, 1]);
            // Calculate the correct height of the utility axis.
            var utilityScaleHeight = (u.viewOrientation === types_1.ChartOrientation.Vertical) ? (u.rendererConfig.independentAxisCoordinateTwo - u.rendererConfig.dependentAxisCoordinateTwo) : (u.rendererConfig.dependentAxisCoordinateTwo - u.rendererConfig.independentAxisCoordinateTwo);
            var utilityAxis;
            // The range of the scale must be inverted for the vertical axis because pixels coordinates set y to increase downwards, rather than upwards as normal.
            if (u.viewOrientation === types_1.ChartOrientation.Vertical) {
                uilityScale.range([utilityScaleHeight, 0]);
                utilityAxis = d3.axisLeft(uilityScale);
            }
            else {
                uilityScale.range([0, utilityScaleHeight]);
                utilityAxis = d3.axisTop(uilityScale);
            }
            // The utility axis should have two ticks. For some reason 1 is the way to do this...
            utilityAxis.ticks(1);
            // Position the axis by positioning the axis container and then create it.
            this.utilityAxisContainer
                .attr('transform', () => {
                return 'translate(' + ((u.viewOrientation === types_1.ChartOrientation.Vertical) ? ((u.rendererConfig.dependentAxisCoordinateOne + 4) + ',' + (u.rendererConfig.dependentAxisCoordinateTwo - .5) + ')') : ((u.rendererConfig.independentAxisCoordinateTwo - .5) + ', ' + (u.rendererConfig.dependentAxisCoordinateOne + 4) + ')'));
            })
                .call(utilityAxis);
        }
        /*
            @param u - The most recent ScoreFunctionUpdate message.
            @returns {void}
            @description	Toggles whether or not the ScoreFunction will actually be displayed based on the size of the area it has been given
                            to render in. The plot will not render properly if the area is too small (less than 50px X 50px) and so should not be displayed.
        */
        toggleDisplay(u) {
            if (u.rendererConfig.dimensionOneSize < this.minimumDimension || u.rendererConfig.dimensionTwoSize < this.minimumDimension) {
                this.plotContainer.style('display', 'none');
                this.clickToExpandText.style('display', 'block');
            }
            else {
                this.plotContainer.style('display', 'block');
                this.clickToExpandText.style('display', 'none');
            }
        }
        /*
            @param u - The most recent ScoreFunctionUpdate message.
            @returns {void}
            @description	Apply styles to the score function plot that depend on values given in the ScoreFunctionUpdate message.
                            Styles that can be computed statically are applied through CSS classes instead of here.
        */
        applyStyles(u) {
            this.domainAxis
                .style('stroke-width', 1)
                .style('stroke', 'black');
            this.unitsLabel.style('font-size', '10px');
            this.utilityAxisContainer.style('font-size', 8);
            this.domainLabels.style('font-size', '9px');
        }
    };
    // class name definitions for SVG elements that are created by this renderer.
    ScoreFunctionRenderer.defs = {
        OUTLINE_CONTAINER: 'scorefunction-outline-container',
        PLOT_OUTLINE: 'scorefunction-plot-outline',
        PLOT_CONTAINER: 'scorefunction-plot-container',
        USER_CONTAINER: 'scorefunction-user-container',
        DOMAIN_LABELS_CONTAINER: 'scorefunction-plot-domain-labels-container',
        DOMAIN_LABEL: 'scorefunction-domain-labels',
        PLOT_ELEMENTS_CONTAINER: 'scorefunction-plot-elements-container',
        AXES_CONTAINER: 'scorefunction-axes-container',
        UTILITY_AXIS_CONTAINER: 'scorefunction-utility-axis',
        DOMAIN_AXIS: 'scorefunction-domain-axis',
        UNITS_LABEL: 'scorefunction-units-label',
        EXPAND_TEXT: 'scorefunction-expand-text'
    };
    ScoreFunctionRenderer = ScoreFunctionRenderer_1 = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [services_1.ChartUndoRedoService])
    ], ScoreFunctionRenderer);
    return ScoreFunctionRenderer;
})();
exports.ScoreFunctionRenderer = ScoreFunctionRenderer;
//# sourceMappingURL=ScoreFunction.renderer.js.map