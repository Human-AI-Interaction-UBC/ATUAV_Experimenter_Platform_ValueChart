"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-06-07 12:53:30
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-07-24 10:51:29
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
exports.ObjectiveChartRenderer = void 0;
// Import Angular Classes
const core_1 = require("@angular/core");
// Import Application Classes:
const services_1 = require("../services");
const services_2 = require("../services");
const definitions_1 = require("../definitions");
const interactions_1 = require("../interactions");
const types_1 = require("../../types");
// This class renders a ValueChart's Alternatives into a series of bar charts, one for each primitive objective in the ValueChart. 
// These bar charts display the utilities for each Alternative's consequences for each user in the ValueChart.
// This utility is based on the weights given to objectives, and the user determined scores assigned to points in the consequence space. 
// Each Alternative's value for each PrimitiveObjective is rendered into a rectangle whose height (or width depending on the orientation) is 
// proportional to its (weight * userScore). The rectangles for each Alternative are aligned vertically (or horizontally) so that they form a of 
// series bar charts. Rectangles for different users utilities for the same alternatives are grouped together into columns.
let ObjectiveChartRenderer = /** @class */ (() => {
    let ObjectiveChartRenderer = class ObjectiveChartRenderer {
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        /*
            @returns {void}
            @description 	Used for Angular's dependency injection ONLY. It should not be used to do any initialization of the class.
                            This constructor should NOT be called manually. Angular will automatically handle the construction of this directive when it is used.
        */
        constructor(rendererService, renderEventsService, sortAlternativesInteraction) {
            this.rendererService = rendererService;
            this.renderEventsService = renderEventsService;
            this.sortAlternativesInteraction = sortAlternativesInteraction;
            // Constants for use in rendering the summary chart.
            this.USER_SCORE_SPACING = 10; // The spacing between user score bars, in pixels.
            // ========================================================================================
            // 									Methods
            // ========================================================================================
            /*
                @param update - The RendererUpdate message sent to the ObjectiveChart to initiate a re-rendering of the objectives breakdown.
                @returns {void}
                @description	This method is used as the observer/handler of messages from the rendering pipeline and thus controls how and when the
                                objective chart is rendered.
            */
            this.valueChartChanged = (update) => {
                this.lastRendererUpdate = update;
                // If the base element of the Objective Chart is undefined, then it has not yet been rendered. We must create SVG elements for the first time.
                if (this.chart == undefined) {
                    this.createObjectiveChart(update);
                }
                // If the RendererUpdate is a structural update, then update the SVG elements making up the Objective Chart.
                if (update.structuralUpdate) {
                    this.createObjectiveRows(update, this.rowsContainer, this.rowOutlinesContainer, this.alternativeBoxesContainer, this.alternativeLabelsContainer);
                    this.toggleDomainLabels(update.viewConfig.displayDomainValues);
                }
                // Update the lastRendererUpdate values in the attached interaction classes and render the Objective Chart.
                this.updateInteractions(update);
                this.renderObjectiveChart(update);
            };
            /*
                @param interactionConfig - The interactionConfig message sent to the ObjectiveChartRenderer to update the InteractionConfig.
                @returns {void}
                @description	This method is used as the observer/handler of messages from the interactions pipeline and thus controls how and when the
                                objective chart interactions are turned on and off.
            */
            this.interactionsChanged = (interactionConfig) => {
                this.sortAlternativesInteraction.toggleAlternativeSorting(interactionConfig.sortAlternatives, this.alternativeBoxes, this.lastRendererUpdate);
            };
            /*
                @param viewConfig - The viewConfig message sent to the ObjectiveChartRenderer to update the InteractionConfig.
                @returns {void}
                @description	This method is used as the observer/handler of messages from the view configuration pipeline and thus controls how and when the
                                objective chart view options are turned on and off.
            */
            this.viewConfigChanged = (viewConfig) => {
                this.toggleDomainLabels(viewConfig.displayDomainValues);
            };
            /*
                @param u - The most recent RendererUpdate message.
                @returns {void}
                @description	Update the lastRendererUpdate fields of the interactions associated with the ObjectiveChartRenderer with the most recent RendererUpdate message.
            */
            this.updateInteractions = (u) => {
                this.sortAlternativesInteraction.lastRendererUpdate = u;
            };
            // ========================================================================================
            // 		Anonymous functions that are used often enough to be made class fields
            // ========================================================================================
            this.calculateWeightOutlineDimensionTwo = (d, i) => {
                let userObjectiveWeight = d.user.getWeightMap().getObjectiveWeight(d.objective.getId());
                return Math.max(this.lastRendererUpdate.rendererConfig.dimensionTwoScale(userObjectiveWeight) - 1, 0);
            };
            // Calculate the CoordinateOne of a cell given the cells data and its index. Cells are all the same width (or height), so we simply divide the length of each row into equal amounts to find their locations.
            this.calculateCellCoordinateOne = (d, i, u) => { return i * (u.rendererConfig.dimensionOneSize / u.valueChart.getAlternatives().length); };
            // Calculate the CoordinateOne of a userScore given the userScore object and its index. userScores are just further subdivisions of cells based on the number of userScores in each cell.
            this.calculateUserScoreDimensionOne = (d, i, u) => { return (u.rendererConfig.dimensionOneSize / u.valueChart.getAlternatives().length) / u.usersToDisplay.length; };
            // User score heights (or widths) are proportional to the weight of the objective the score is for, times the score (score * weight).
            this.calculateUserScoreDimensionTwo = (d, i) => {
                let userObjectiveWeight = d.user.getWeightMap().getObjectiveWeight(d.objective.getId());
                let score = d.user.getScoreFunctionMap().getObjectiveScoreFunction(d.objective.getId()).getScore(d.value);
                return this.lastRendererUpdate.rendererConfig.dimensionTwoScale(score * userObjectiveWeight);
            };
        }
        /*
            @param u - The most recent RendererUpdate message that the ObjectiveChartRenderer has received.
            @returns {void}
            @description	Creates the base containers and elements for the objective Chart of a ValueChart. It should be called when
                            creating an objective chart for the first time, but not when updating as the basic framework of the chart never needs to be
                            constructed again. Instead, call the createObjectiveRows method to add or remove rows, and user columns from the
                            objective chart.
        */
        createObjectiveChart(u) {
            // Indicate that rendering of the objective chart is just starting.
            this.renderEventsService.objectiveChartDispatcher.next(0);
            // Create the root container for the objective chart.
            this.chart = u.el.append('g')
                .classed(definitions_1.ObjectiveChartDefinitions.CHART, true);
            // Create the container for the row outlines.
            this.rowOutlinesContainer = this.chart.append('g')
                .classed(definitions_1.ObjectiveChartDefinitions.ROW_OUTLINES_CONTAINER, true);
            // Create the container to hold the rows.
            this.rowsContainer = this.chart.append('g')
                .classed(definitions_1.ObjectiveChartDefinitions.ROWS_CONTAINER, true);
            // Create the container to hold the labels for the alternatives
            this.alternativeLabelsContainer = this.chart.append('g')
                .classed(definitions_1.ObjectiveChartDefinitions.ALTERNATIVE_LABELS_CONTAINER, true);
            // Create the container to hold the alternative boxes.
            this.alternativeBoxesContainer = this.chart.append('g')
                .classed(definitions_1.ObjectiveChartDefinitions.ALTERNATIVE_BOXES_CONTAINER, true);
            this.createObjectiveRows(u, this.rowsContainer, this.rowOutlinesContainer, this.alternativeBoxesContainer, this.alternativeLabelsContainer);
        }
        /*
            @param u - The most recent RendererUpdate message that the ObjectiveChartRenderer has received.
            @param rowsContainer - The 'g' element that will contain/contains the row elements for the objective chart.
            @param rowOutlinesContainer - The 'g' element that will contain/contains the 'rect' elements used to outline each row.
            @param boxesContainer - The 'g' element that contains the transparent 'rect' elements placed on top of each alternative in the objective chart in order to intercept clicks for dragging, etc.
            @param alternativeLabelsContainer - The 'g' element that contains the 'text' elements used to label each alternative in the ValueChart.
            @returns {void}
            @description	Creates/Updates the individual rows that make up the summary chart. One row is created for each primitive objective in the ValueChart.
                            It also creates the cells cell in each row, and users score bars in each cell through a call to createObjectiveCells. It will remove any
                            rows that are no longer have an associated element in the u.rows parameter, and add rows if rows contains new elements. It also will add/remove
                            cells and user score bars via createObjectiveCell. ONLY this method should be used to add/remove rows, cells, and user score bars to objective chart
                            when objectives, alternatives, or user are added/removed from the ValueChart. createObjectiveRows should NOT be manually called.
        */
        createObjectiveRows(u, rowsContainer, rowOutlinesContainer, boxesContainer, alternativeLabelsContainer) {
            // Create the row outlines for every new PrimitiveObjective. When the graph is being created for the first time, this is every PrimitiveObjective.
            var updateRowOutlines = rowOutlinesContainer.selectAll('.' + definitions_1.ObjectiveChartDefinitions.ROW_OUTLINE)
                .data(u.rowData);
            // Update row outlines to conform to the data.
            updateRowOutlines.exit().remove(); // Remove row outlines that do not have a matching row in the data.
            updateRowOutlines.enter().append('rect') // Add row outlines for rows elements that have no matching outline.
                .classed(definitions_1.ObjectiveChartDefinitions.ROW_OUTLINE, true)
                .classed('valuechart-outline', true);
            // Note that it is important that we re-select all row outlines before assigning them to the class field. This is because 
            // the selections used for adding and removing elements are only the added or removed elements, not ALL of the elements.
            // This is true for any situation where we need to remove and then add new elements to an existing selection.
            this.rowOutlines = rowOutlinesContainer.selectAll('.' + definitions_1.ObjectiveChartDefinitions.ROW_OUTLINE); // Update the row outlines field.
            var updateRowContainers = rowsContainer.selectAll('.' + definitions_1.ObjectiveChartDefinitions.ROW)
                .data(u.rowData);
            // Update rows to conform to the data.
            updateRowContainers.exit().remove(); // Remove rows that do not have a matching row in he data.
            updateRowContainers.enter().append('g') // Add rows for rows in the data which do not have elements.
                .classed(definitions_1.ObjectiveChartDefinitions.ROW, true);
            this.rows = rowsContainer.selectAll('.' + definitions_1.ObjectiveChartDefinitions.ROW); // Update the row field.
            var updateAlternativeLabels = alternativeLabelsContainer.selectAll('.' + definitions_1.ObjectiveChartDefinitions.ALTERNATIVE_LABEL)
                .data(u.valueChart.getAlternatives());
            // Update the alternative labels to conform to the data.
            updateAlternativeLabels.exit().remove(); // Remove alternative labels that no longer have a matching alternative in the data.
            updateAlternativeLabels.enter().append('text') // Add alternative labels for new alternatives.
                .classed(definitions_1.ObjectiveChartDefinitions.ALTERNATIVE_LABEL, true);
            this.alternativeLabels = alternativeLabelsContainer.selectAll('.' + definitions_1.ObjectiveChartDefinitions.ALTERNATIVE_LABEL); // Update the alternative outlines field.
            var updateBoxes = boxesContainer.selectAll('.' + definitions_1.ObjectiveChartDefinitions.ALTERNATIVE_BOX)
                .data(u.valueChart.getAlternatives());
            // Update the alternative boxes to conform to the data.
            updateBoxes.exit().remove();
            updateBoxes.enter().append('rect')
                .classed(definitions_1.ObjectiveChartDefinitions.ALTERNATIVE_BOX, true) // Remove alternative boxes that no longer have a matching alternative.
                .classed(definitions_1.ObjectiveChartDefinitions.CHART_ALTERNATIVE, true); // Add boxes for new alternatives.
            this.alternativeBoxes = boxesContainer.selectAll('.' + definitions_1.ObjectiveChartDefinitions.ALTERNATIVE_BOX);
            this.createObjectiveCells(this.rows);
        }
        /*
            @param objectiveRows - The selection of rows whose cells are to be created/updated.
            @returns {void}
            @description	Creates/Updates the cells that compose each row of the objective chart, and the bars for each user score in that cell (ie, in that intersection of Alternative and PrimitiveObjective).
                            It will add and delete cells and user score bars so that the objective chart is properly configured to its background data. Note that his method should NEVER be called directly
                            to updated to objective chart cells and user scores bars as it provides no way of setting the background data. createObjectiveRows should ALWAYS be used instead.
        */
        createObjectiveCells(objectiveRows) {
            // Create cells for any new objectives, or for new rows. Once again, if the graph is being create for the first time then this is all rows.
            var updateCells = objectiveRows.selectAll('.' + definitions_1.ObjectiveChartDefinitions.CELL)
                .data((d) => { return d.cells; });
            // Update cells to conform to the data.
            updateCells.exit().remove();
            updateCells.enter().append('g')
                .classed(definitions_1.ObjectiveChartDefinitions.CELL, true)
                .classed(definitions_1.ObjectiveChartDefinitions.CHART_CELL, true);
            this.cells = objectiveRows.selectAll('.' + definitions_1.ObjectiveChartDefinitions.CELL);
            // Create the bars for each new user score. Note that if this is a Individual ValueChart, there is only on bar in each cell, as there is only one user score for each objective value. 
            var updateUserScores = this.cells.selectAll('.' + definitions_1.ObjectiveChartDefinitions.USER_SCORE)
                .data((d) => { return d.userScores; });
            // Update user score bars to conform to the data. This is where user's are effectively added and deleted to/from the objective chart.
            updateUserScores.exit().remove();
            updateUserScores.enter().append('rect')
                .classed(definitions_1.ObjectiveChartDefinitions.USER_SCORE, true);
            this.userScores = this.cells.selectAll('.' + definitions_1.ObjectiveChartDefinitions.USER_SCORE);
            var updateWeightOutlines = this.cells.selectAll('.' + definitions_1.ObjectiveChartDefinitions.WEIGHT_OUTLINE)
                .data((d) => { return d.userScores; });
            // Update weight outlines to conform to the data. Note that weight outlines are only displayed for group ValueCharts.
            updateWeightOutlines.exit().remove();
            updateWeightOutlines.enter().append('rect')
                .classed(definitions_1.ObjectiveChartDefinitions.WEIGHT_OUTLINE, true);
            this.weightOutlines = this.cells.selectAll('.' + definitions_1.ObjectiveChartDefinitions.WEIGHT_OUTLINE);
            this.cells.selectAll('.' + definitions_1.ObjectiveChartDefinitions.DOMAIN_LABEL).remove();
            var updateDomainLabels = this.cells.selectAll('.' + definitions_1.ObjectiveChartDefinitions.DOMAIN_LABEL)
                .data((d) => { return [d]; });
            updateDomainLabels.exit().remove();
            // Update domain labels to conform to the data.
            updateDomainLabels.enter().append('text')
                .classed(definitions_1.ObjectiveChartDefinitions.DOMAIN_LABEL, true);
            this.domainLabels = this.cells.selectAll('.' + definitions_1.ObjectiveChartDefinitions.DOMAIN_LABEL);
        }
        /*
            @param u - The most recent RendererUpdate message that the ObjectiveChartRenderer has received.
            @returns {void}
            @description	Updates the data underlying the objective chart, and then positions and gives widths + heights to the elements created by the createObjectiveChart method.
                            It should be used to update the objective chart when the data underlying the it (u.rows) has changed, and the appearance of the objective chart needs to be updated to reflect
                            this change. It should NOT be used to initially render the objective chart, or change the view orientation of the objective chart. Use renderObjectiveChart for this purpose.
        */
        renderObjectiveChart(u) {
            // Position the objective chart.
            this.chart
                .attr('transform', 'translate(' + u.x + ',' + u.y + ')');
            // Update the data behind the row outlines 
            var rowOutlinesToUpdate = this.rowOutlines
                .data(u.rowData);
            // Update the data behind the rows.
            var rowsToUpdate = this.rows.data(u.rowData);
            // Update the data behind the alternative labels.
            var alternativeLabelsToUpdate = this.alternativeLabels.data(u.valueChart.getAlternatives());
            // Update the data behind the alternative boxes.
            var alternativeBoxesToUpdate = this.alternativeBoxes
                .data(u.valueChart.getAlternatives());
            // Update the data behind the cells.
            var cellsToUpdate = this.cells
                .data((d) => { return d.cells; });
            // Update the data behind the user score bars.
            var userScoresToUpdate = this.userScores
                .data((d, i) => { return d.userScores; });
            // Update the data behind the weight outlines. Recall that these are only displayed for group ValueCharts.
            var weightOutlinesToUpdate = this.weightOutlines
                .data((d, i) => { return d.userScores; });
            this.renderObjectiveChartRows(u, rowOutlinesToUpdate, rowsToUpdate, alternativeLabelsToUpdate, alternativeBoxesToUpdate, cellsToUpdate, userScoresToUpdate, weightOutlinesToUpdate);
            // Indicate that the objective chart is finished rendering.
            this.renderEventsService.objectiveChartDispatcher.next(1);
        }
        /*
            @param u - The most recent RendererUpdate message that the ObjectiveChartRenderer has received.
            @param rowOutlines - The selection of 'rect' elements that outline the rows to be rendered.
            @param rows - The selection of 'g' elements that are the rows to be rendered. These elements should contain more 'g' elements that are the cells to be rendered.
            @param alternativeLabels - The selection of 'text' elements for labeling alternatives. There should be one text element per alternative.
            @param alternativeBoxes - The selection of 'rect' elements to be positioned over each alternative's column in the objective chart.
            @param cells - The selection of 'g' elements that contain the user score 'rect' elements. There should be one 'g' element for each alternative in the ValueChart.
            @param userScores - The selection of 'rect' elements that are the user scores to be rendered.
            @param weightOutlines - The selection of 'rect' elements that are the weight outlines to be rendered for each user score in the summary chart.
            @returns {void}
            @description	Positions and gives widths + heights to the elements created by createObjectiveRows. Unlike in the summary chart we directly
                            position the row containers here because the positions of the scores (and therefore row containers) are are absolute. (no stacking).
                            Note that this method should NOT be called manually. updateObjectiveChart or renderObjectiveChart should called to re-render objective rows.
        */
        renderObjectiveChartRows(u, rowOutlines, rows, alternativeLabels, alternativeBoxes, cells, userScores, weightOutlines) {
            rowOutlines
                .attr('transform', (d, i) => {
                return this.rendererService.generateTransformTranslation(u.viewConfig.viewOrientation, 0, (u.rendererConfig.dimensionTwoScale(d.weightOffset))); // Position each of the rows based on the combined weights of the previous rows.
            })
                .attr(u.rendererConfig.dimensionOne, u.rendererConfig.dimensionOneSize)
                .attr(u.rendererConfig.dimensionTwo, (d) => {
                let maxObjectiveWeight = u.maximumWeightMap.getObjectiveWeight(d.objective.getId());
                return u.rendererConfig.dimensionTwoScale(maxObjectiveWeight); // Set the height of the row to be proportional to its weight.
            });
            rows
                .attr('transform', (d, i) => {
                return this.rendererService.generateTransformTranslation(u.viewConfig.viewOrientation, 0, (u.rendererConfig.dimensionTwoScale(d.weightOffset))); // Transform each row container to have the correct y (or x) position based on the combined weights of the previous rows.
            });
            var alternativeLabelCoordOneOffset = ((u.viewConfig.viewOrientation === types_1.ChartOrientation.Vertical) ? 20 : 40);
            var alternativeLabelCoordTwoOffset = 20;
            alternativeLabels
                .text((d) => { return d.getName(); })
                .attr(u.rendererConfig.coordinateOne, (d, i) => { return this.calculateCellCoordinateOne(d, i, u) + alternativeLabelCoordOneOffset; })
                .attr(u.rendererConfig.coordinateTwo, () => {
                return (u.viewConfig.viewOrientation === types_1.ChartOrientation.Vertical) ? u.rendererConfig.dimensionTwoSize + alternativeLabelCoordTwoOffset : alternativeLabelCoordTwoOffset;
            })
                .attr('alternative', (d) => { return d.getId(); });
            alternativeBoxes
                .attr(u.rendererConfig.dimensionOne, (d, i) => { return u.rendererConfig.dimensionOneSize / u.valueChart.getAlternatives().length; })
                .attr(u.rendererConfig.dimensionTwo, u.rendererConfig.dimensionTwoSize)
                .attr(u.rendererConfig.coordinateOne, (d, i) => { return this.calculateCellCoordinateOne(d, i, u); })
                .attr(u.rendererConfig.coordinateTwo, 0)
                .attr('alternative', (d) => { return d.getId(); })
                .attr('id', (d) => { return 'objective-' + d.getId() + '-box'; });
            this.renderObjectiveChartCells(u, cells, userScores, weightOutlines);
        }
        /*
            @param u - The most recent RendererUpdate message that the ObjectiveChartRenderer has received.
            @param cells - The selection of 'g' elements that contain the user score 'rect' elements. There should be one 'g' element for each alternative in the ValueChart.
            @param userScores - The selection of 'rect' elements that are the user scores to be rendered.
            @param weightOutlines - The selection of 'rect' elements that are the weight outlines to be rendered for each user score in the summary chart.
            @returns {void}
            @description	Positions and gives widths + heights to the elements created by createObjectiveCells.
                            Note that this method should NOT be called manually. updateObjectiveChart or renderObjectiveChart should called to re-render objective rows.
        */
        renderObjectiveChartCells(u, cells, userScores, weightOutlines) {
            cells
                .attr('transform', (d, i) => {
                let coordinateOne = this.calculateCellCoordinateOne(d, i, u);
                return this.rendererService.generateTransformTranslation(u.viewConfig.viewOrientation, coordinateOne, 0);
            })
                .attr('alternative', (d) => { return d.alternative.getId(); });
            var domainLabelCoord = 5;
            this.domainLabels
                .data((d) => { return [d]; })
                .text((d, i) => { return '' + d.value; })
                .attr(u.rendererConfig.coordinateOne, (u.rendererConfig.dimensionOneSize / u.valueChart.getAlternatives().length) / 3)
                .attr(u.rendererConfig.coordinateTwo, (d, i) => {
                let maxObjectiveWeight = 0;
                if (d.userScores.length > 0) {
                    maxObjectiveWeight = u.maximumWeightMap.getObjectiveWeight(d.userScores[0].objective.getId());
                }
                return (u.viewConfig.viewOrientation === types_1.ChartOrientation.Vertical) ? u.rendererConfig.dimensionTwoScale(maxObjectiveWeight) - domainLabelCoord : domainLabelCoord;
            });
            this.renderUserScores(u, userScores);
            this.renderWeightOutlines(u, weightOutlines);
        }
        /*
            @param u - The most recent RendererUpdate message that the ObjectiveChartRenderer has received.
            @param userScores - The selection of 'rect' elements that are the user scores to be rendered.
            @returns {void}
            @description	Positions and gives widths + heights to the elements to 'rect' elements used to display user score bars in the objective chart.
                            Note that this method should NOT be called manually. updateObjectiveChart or renderObjectiveChart should called to re-render objective rows.
        */
        renderUserScores(u, userScores) {
            userScores
                .attr(u.rendererConfig.dimensionOne, (d, i) => { return Math.max(this.calculateUserScoreDimensionOne(d, i, u) - this.USER_SCORE_SPACING, 0); })
                .attr(u.rendererConfig.dimensionTwo, this.calculateUserScoreDimensionTwo)
                .attr(u.rendererConfig.coordinateOne, (d, i) => { return (this.calculateUserScoreDimensionOne(d, i, u) * i) + (this.USER_SCORE_SPACING / 2); })
                .style('fill', (d, i) => {
                if (u.valueChart.isIndividual())
                    return d.objective.getColor();
                else
                    return d.user.color;
            });
            if (u.viewConfig.viewOrientation === types_1.ChartOrientation.Vertical) {
                userScores
                    .attr(u.rendererConfig.coordinateTwo, (d, i) => {
                    let maxObjectiveWeight = u.maximumWeightMap.getObjectiveWeight(d.objective.getId());
                    let userObjectiveWeight = d.user.getWeightMap().getObjectiveWeight(d.objective.getId());
                    let score = d.user.getScoreFunctionMap().getObjectiveScoreFunction(d.objective.getId()).getScore(d.value);
                    return u.rendererConfig.dimensionTwoScale(maxObjectiveWeight) - u.rendererConfig.dimensionTwoScale(score * userObjectiveWeight);
                });
            }
            else {
                userScores.attr(u.rendererConfig.coordinateTwo, 0);
            }
        }
        /*
            @param u - The most recent RendererUpdate message that the ObjectiveChartRenderer has received.
            @param weightOutlines - The selection of 'rect' elements that are the weight outlines to be rendered for each user score in the summary chart.
            @returns {void}
            @description	Positions and gives widths + heights to the elements to 'rect' elements used to user weight outlines in the objective chart. These outlines are only
                            displayed for group ValueCharts.
                            Note that this method should NOT be called manually. updateObjectiveChart or renderObjectiveChart should called to re-render objective rows.
        */
        renderWeightOutlines(u, weightOutlines) {
            weightOutlines
                .attr(u.rendererConfig.dimensionOne, (d, i) => { return Math.max(this.calculateUserScoreDimensionOne(d, i, u) - (this.USER_SCORE_SPACING + 1), 0); })
                .attr(u.rendererConfig.dimensionTwo, (d, i) => { return this.calculateWeightOutlineDimensionTwo(d, i); })
                .attr(u.rendererConfig.coordinateOne, (d, i) => { return (this.calculateUserScoreDimensionOne(d, i, u) * i) + ((this.USER_SCORE_SPACING + 1) / 2); })
                .style('stroke-dasharray', (d, i) => {
                let dimensionOne = (this.calculateUserScoreDimensionOne(d, i, u) - (this.USER_SCORE_SPACING + 1));
                let dimensionTwo = this.calculateWeightOutlineDimensionTwo(d, i);
                return (u.viewConfig.viewOrientation === types_1.ChartOrientation.Vertical) ?
                    (dimensionOne + dimensionTwo) + ', ' + dimensionOne
                    :
                        (dimensionTwo + dimensionOne + dimensionTwo) + ', ' + dimensionOne;
            });
            if (u.viewConfig.viewOrientation === types_1.ChartOrientation.Vertical) {
                weightOutlines
                    .attr(u.rendererConfig.coordinateTwo, (d, i) => {
                    let maxObjectiveWeight = u.maximumWeightMap.getObjectiveWeight(d.objective.getId());
                    return u.rendererConfig.dimensionTwoScale(maxObjectiveWeight) - this.calculateWeightOutlineDimensionTwo(d, i);
                });
            }
            else {
                weightOutlines.attr(u.rendererConfig.coordinateTwo, 0);
            }
            this.toggleWeightOutlines(u);
        }
        /*
            @param u - The most recent RendererUpdate message that the ObjectiveChartRenderer has received.
            @returns {void}
            @description	Display or hide the weight outlines depending on the whether the ValueChart is a group or individual chart.
        */
        toggleWeightOutlines(u) {
            if (u.valueChart.isIndividual()) {
                this.weightOutlines.style('display', 'none');
            }
            else {
                this.weightOutlines.style('display', 'block');
            }
        }
        /*
            @param displayDomainValues - Whether or not to display domain values on top of the objective chart cells.
            @returns {void}
            @description	Display or hide the domain labels for cells depending on the value of the displayDomainValues parameter.
        */
        toggleDomainLabels(displayDomainValues) {
            if (displayDomainValues) {
                this.domainLabels.style('display', 'block');
            }
            else {
                this.domainLabels.style('display', 'none');
            }
        }
    };
    ObjectiveChartRenderer = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [services_1.RendererService,
            services_2.RenderEventsService,
            interactions_1.SortAlternativesInteraction])
    ], ObjectiveChartRenderer);
    return ObjectiveChartRenderer;
})();
exports.ObjectiveChartRenderer = ObjectiveChartRenderer;
//# sourceMappingURL=ObjectiveChart.renderer.js.map