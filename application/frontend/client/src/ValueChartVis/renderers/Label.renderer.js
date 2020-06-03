"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-06-07 13:39:52
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
exports.LabelRenderer = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
const Subject_1 = require("rxjs/Subject");
require("../../app/utilities/rxjs-operators");
// Import Application Classes:
const services_1 = require("../services");
const services_2 = require("../services");
const services_3 = require("../services");
const renderers_1 = require("../renderers");
const renderers_2 = require("../renderers");
const renderers_3 = require("../renderers");
const definitions_1 = require("../definitions");
const utilities_1 = require("../utilities");
const interactions_1 = require("../interactions");
const interactions_2 = require("../interactions");
const interactions_3 = require("../interactions");
const interactions_4 = require("../interactions");
// Import Model Classes:
const model_1 = require("../../model");
const types_1 = require("../../types");
// This class renders a ValueChart's hierarchical objective structure into labels for an objective chart. Each objective is rendered into a 
// rectangle whose width (or height depending on the orientation) is proportional to its weight. The rectangles are positioned in such a
// way that they act as labels for the objectives in the objective chart. It uses the ScoreFunctionRenderer class and its subclasses to render
// a plot of each primitive objective's score function with the label area.
let LabelRenderer = /** @class */ (() => {
    let LabelRenderer = class LabelRenderer {
        // This is cached for internal change detection purposes.
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        /*
            @returns {void}
            @description 	Used for Angular's dependency injection ONLY. It should not be used to do any initialization of the class.
                            This constructor should NOT be called manually. Angular will automatically handle the construction of this directive when it is used.
        */
        constructor(rendererScoreFunctionUtility, rendererService, renderEventsService, chartUndoRedoService, resizeWeightsInteraction, setObjectiveColorsInteraction, reorderObjectivesInteraction, sortAlternativesInteraction) {
            this.rendererScoreFunctionUtility = rendererScoreFunctionUtility;
            this.rendererService = rendererService;
            this.renderEventsService = renderEventsService;
            this.chartUndoRedoService = chartUndoRedoService;
            this.resizeWeightsInteraction = resizeWeightsInteraction;
            this.setObjectiveColorsInteraction = setObjectiveColorsInteraction;
            this.reorderObjectivesInteraction = reorderObjectivesInteraction;
            this.sortAlternativesInteraction = sortAlternativesInteraction;
            this.reordered = false; // A boolean flag indicating whether or not the objectives have been reordered since the last time they were rendered.
            this.labelSelections = {}; // The dictionary style object used to cache d3 selections of sibling labels - 
            // space that the label area is rendered in.
            this.scoreFunctionSubjects = {}; // The dictionary-style object of subjects used notify ScoreFunctionRenderers to re-render the score function plots.
            // The subjects are indexed by PrimitiveObjective IDs.
            this.scoreFunctionViewSubject = new Subject_1.Subject(); // The subject used to notify ScoreFunctionRenderers of view configuration changes.
            this.scoreFunctionInteractionSubject = new Subject_1.Subject(); // The subject used to notify ScoreFunctionRenderers of interaction configuration changes.
            this.weightsPlotSubjects = {};
            // ========================================================================================
            // 									Methods
            // ========================================================================================
            /*
                @param update - The RendererUpdate message sent to the LabelRenderer to initiate a re-rendering of the label area.
                @returns {void}
                @description	This method is used as the observer/handler of messages from the rendering pipeline and thus controls how and when the
                                label area is rendered.
            */
            this.valueChartChanged = (update) => {
                this.lastRendererUpdate = update;
                // If the root container is not defined, then the label area has never been rendered. We must create the label space for the first time.
                if (this.rootContainer == undefined) {
                    this.createLabelSpace(update);
                }
                // If the reordered flag is set or the update is structural, createLabels must be called in order to update the SVG structure of the label area.
                if (this.reordered || update.structuralUpdate) {
                    this.createLabels(update, update.labelData, this.labelContainer);
                }
                // Update the interactions, render the label space, and then apply the styles to the label space.
                this.updateInteractions(update);
                this.renderLabelSpace(update, update.labelData);
                this.applyStyles(update);
                // If the SVG elements needed to be updated or the orientation changed, then the interactions must also be updated.
                if (this.reordered || update.structuralUpdate || this.viewOrientation != update.viewConfig.viewOrientation) {
                    this.interactionsChanged(update.interactionConfig);
                    this.reordered = false;
                    this.viewOrientation = update.viewConfig.viewOrientation;
                }
            };
            /*
                @param interactionConfig - The interactionConfig message sent to the LabelRenderer to update the InteractionConfig.
                @returns {void}
                @description	This method is used as the observer/handler of messages from the interactions pipeline and thus controls how and when the
                                label area interactions are turned on and off.
            */
            this.interactionsChanged = (interactionConfig) => {
                this.resizeWeightsInteraction.togglePump(interactionConfig.pumpWeights, this.rootContainer.node().querySelectorAll('.' + definitions_1.LabelDefinitions.PRIMITIVE_OBJECTIVE_LABEL), this.lastRendererUpdate);
                this.resizeWeightsInteraction.toggleDragToResizeWeights(interactionConfig.weightResizeType, this.rootContainer, this.lastRendererUpdate);
                this.setObjectiveColorsInteraction.toggleSettingObjectiveColors(interactionConfig.setObjectiveColors, this.rootContainer.node());
                this.reorderObjectivesInteraction.toggleObjectiveReordering(interactionConfig.reorderObjectives, this.rootContainer, this.lastRendererUpdate)
                    .subscribe(this.handleObjectivesReordered);
                this.sortAlternativesInteraction.toggleSortAlternativesByObjectiveScore(interactionConfig.sortAlternatives == types_1.SortAlternativesType.ByObjectiveScore, this.rootContainer.node(), this.lastRendererUpdate);
                this.scoreFunctionInteractionSubject.next({ expandScoreFunctions: true, adjustScoreFunctions: this.lastRendererUpdate.interactionConfig.adjustScoreFunctions });
            };
            /*
                @param viewConfig - The viewConfig message sent to the LabelRenderer to update the InteractionConfig.
                @returns {void}
                @description	This method is used as the observer/handler of messages from the view configuration pipeline and thus controls how and when the
                                label area view options are turned on and off.
            */
            this.viewConfigChanged = (viewConfig) => {
                this.scoreFunctionViewSubject.next(viewConfig.displayScoreFunctionValueLabels);
                this.toggleDisplayScoreFunctions(viewConfig.displayScoreFunctions);
                this.toggleDisplayWeightsPlots(viewConfig.displayWeightDistributions);
                this.renderLabelSpace(this.lastRendererUpdate, this.lastRendererUpdate.labelData);
            };
            /*
                @param reordered - Whether or not the ValueChart's objectives have been reordered. If they have, then the label area will have a structural update
                                    next rendering cycle.
                @returns {void}
                @description	This method is used as the observer/handler of messages from the ReorderObjectivesInteraction that indicate whether or not the user has
                                changed the order of any objectives.
            */
            this.handleObjectivesReordered = (reordered) => {
                this.reordered = reordered;
            };
            /*
                @param u - The most recent RendererUpdate message.
                @returns {void}
                @description	Update the lastRendererUpdate fields of the interactions associated with the LabelRenderer with the most recent RendererUpdate message.
            */
            this.updateInteractions = (u) => {
                this.resizeWeightsInteraction.lastRendererUpdate = u;
                this.reorderObjectivesInteraction.lastRendererUpdate = u;
                this.sortAlternativesInteraction.lastRendererUpdate = u;
            };
            // ========================================================================================
            // 				Anonymous functions that are used enough to be made class fields
            // ========================================================================================
            this.determineLabelWidth = (d, u) => {
                if (u.reducedInformation) {
                    return 0;
                }
                else {
                    var offset = 0;
                    offset += ((u.viewConfig.displayScoreFunctions) ? this.labelWidth : 0);
                    offset += ((u.viewConfig.displayWeightDistributions) ? this.labelWidth : 0);
                    var retValue = (d.depthOfChildren === 0) ?
                        (this.lastRendererUpdate.rendererConfig.dimensionOneSize - offset) - (d.depth * this.labelWidth)
                        :
                            this.labelWidth;
                    return retValue;
                }
            };
            this.calculateMinLabelWidth = (labelData, dimensionOneSize, u) => {
                if (u.reducedInformation) {
                    let width = dimensionOneSize;
                    if (u.viewConfig.displayScoreFunctions && u.viewConfig.displayWeightDistributions)
                        width = width / 2;
                    return width;
                }
                else {
                    var maxDepthOfChildren = 0;
                    labelData.forEach((labelDatum) => {
                        if (labelDatum.depthOfChildren > maxDepthOfChildren)
                            maxDepthOfChildren = labelDatum.depthOfChildren;
                    });
                    maxDepthOfChildren += 1; // Add one for the root label.
                    maxDepthOfChildren += ((u.viewConfig.displayScoreFunctions) ? 1 : 0);
                    maxDepthOfChildren += ((u.viewConfig.displayWeightDistributions) ? 1 : 0);
                    return dimensionOneSize / maxDepthOfChildren;
                }
            };
        }
        /*
            @param u - The most recent RendererUpdate message received by the LabelRenderer.
            @returns {void}
            @description 	Creates the base containers and all elements for the labels of a ValueChart. It should be called when creating the labels for the first time
                            and when rebuilding them. The label area's recursive structure means that when objectives are added/deleted, or the order of objectives is changed,
                            the label area must be destroyed and reconstructed. This is partly because assigning different data to a label may change the number of children it has,
                            which requires a complete change in the structure of SVG elements.
        */
        createLabelSpace(u) {
            // Indicate that rendering of the label area is just starting.
            this.renderEventsService.labelsDispatcher.next(0);
            // Create the root container which will hold all label related SVG elements.
            this.rootContainer = u.el.append('g')
                .classed(definitions_1.LabelDefinitions.ROOT_CONTAINER, true);
            // Create the outline box for the label area. Append the styles here because they will not change.
            this.labelSpaceOutline = this.rootContainer.append('g')
                .classed(definitions_1.LabelDefinitions.OUTLINE_CONTAINER, true)
                .append('rect')
                .classed(definitions_1.LabelDefinitions.OUTLINE, true)
                .classed('valuechart-outline', true);
            // Create the container which will hold all labels.
            this.labelContainer = this.rootContainer.append('g')
                .classed(definitions_1.LabelDefinitions.LABELS_CONTAINER, true);
            // Recursively create the labels based on the Objective structure.
            this.labelWidth = this.calculateMinLabelWidth(u.labelData, u.rendererConfig.dimensionOneSize, u);
            this.createLabels(u, u.labelData, this.labelContainer);
        }
        /*
            @param u - The most recent RendererUpdate message received by the LabelRenderer.
            @param labelContainer - The container for the labels to be created. It is either: 1) this.labelContainer, or 2) The container of an already created label.
            @param labelData - The data for the new labels to create. Note that this data has a recursive (or nested) structure.
            @param parentName - Either the name of the parent objective of the label to be created, or LabelDefinitions.ROOT_CONTAINER_NAME if the objective is the root objective.
            @returns {void}
            @description 	Recursively creates labels for an array of Objectives that have been put into labelData format. Unlike other renderers, this method cannot
                            be used to update the existing label area to have a different structure. Instead, the label area must be deleted and rebuilt using createLabelSpace.
                            This method should NOT be called manually.
        */
        createLabels(u, labelData, labelContainer, parentName = definitions_1.LabelDefinitions.ROOT_CONTAINER_NAME) {
            this.labelSelections[parentName] = {};
            // Create a new container for each element in labelData.
            var updateLabelContainers = labelContainer.selectAll('.' + definitions_1.LabelDefinitions.LABEL_SUBCONTAINER).filter(function () {
                return this.parentElement == labelContainer.node();
            }).data(labelData);
            updateLabelContainers.exit().remove();
            var newLabelContainers = updateLabelContainers.enter().append('g')
                .attr('parent', parentName) // Set the name parent objective on the 'g', or LabelDefinitions.ROOT_CONTAINER_NAME if it has not parent objective. 
                .classed(definitions_1.LabelDefinitions.LABEL_SUBCONTAINER, true)
                .attr('id', (d) => { return 'label-' + d.objective.getId() + '-container'; });
            updateLabelContainers
                .attr('parent', parentName) // Set the name parent objective on the 'g', or LabelDefinitions.ROOT_CONTAINER_NAME if it has not parent objective. 
                .classed(definitions_1.LabelDefinitions.LABEL_SUBCONTAINER, true)
                .attr('id', (d) => { return 'label-' + d.objective.getId() + '-container'; });
            this.labelSelections[parentName].labelContainers = labelContainer.selectAll('g[parent=' + parentName + ']');
            // Append an outline rectangle for label container that was just created.
            newLabelContainers.append('rect');
            this.labelSelections[parentName].labelContainers.select('rect')
                .classed(definitions_1.LabelDefinitions.SUBCONTAINER_OUTLINE, true)
                .classed('valuechart-label-outline', true)
                .attr('id', (d) => { return 'label-' + d.objective.getId() + '-outline'; })
                .attr('parent', parentName);
            this.labelSelections[parentName].subContainerOutlines = this.labelSelections[parentName].labelContainers.select('.' + definitions_1.LabelDefinitions.SUBCONTAINER_OUTLINE);
            // Append the dividing line. This is what users are actually clicking on when they click and drag to change objective weights.
            newLabelContainers.append('line');
            this.labelSelections[parentName].labelContainers.select('line')
                .classed(definitions_1.LabelDefinitions.SUBCONTAINER_DIVIDER, true)
                .classed('valuechart-label-divider', true)
                .attr('id', (d) => { return 'label-' + d.objective.getId() + '-divider'; });
            this.labelSelections[parentName].dividers = this.labelSelections[parentName].labelContainers.select('.' + definitions_1.LabelDefinitions.SUBCONTAINER_DIVIDER);
            // Append a text element for each label container that was just created. These text elements will be the labels themselves.
            var updateLabelText = newLabelContainers.append('text');
            this.labelSelections[parentName].labelContainers.select('text')
                .classed(definitions_1.LabelDefinitions.SUBCONTAINER_TEXT, true)
                .classed('valuechart-label-text', true)
                .attr('id', (d) => { return 'label-' + d.objective.getId() + '-text'; });
            this.labelSelections[parentName].labelText = this.labelSelections[parentName].labelContainers.select('.' + definitions_1.LabelDefinitions.SUBCONTAINER_TEXT);
            // Append a tspan element to contain the objective's name, and weight.
            updateLabelText.append('tspan')
                .classed(definitions_1.LabelDefinitions.SUBCONTAINER_NAME, true);
            this.labelSelections[parentName].labelText.select('.' + definitions_1.LabelDefinitions.SUBCONTAINER_NAME)
                .attr('id', (d) => { return 'label-' + d.objective.getId() + '-name'; });
            this.labelSelections[parentName].nameText = this.labelSelections[parentName].labelText.select('.' + definitions_1.LabelDefinitions.SUBCONTAINER_NAME);
            // Append a tspan element to contain the objective's best and worst elements.
            updateLabelText.append('tspan')
                .classed(definitions_1.LabelDefinitions.SUBCONTAINER_BEST_WORST, true);
            this.labelSelections[parentName].labelText.select('.' + definitions_1.LabelDefinitions.SUBCONTAINER_BEST_WORST)
                .attr('id', (d) => { return 'label-' + d.objective.getId() + '-best-worst'; });
            this.labelSelections[parentName].bestWorstText = this.labelSelections[parentName].labelText.select('.' + definitions_1.LabelDefinitions.SUBCONTAINER_BEST_WORST);
            // Call createLabels on the children of each AbstractObjective in labelData. This is how the hierarchical structure is "parsed".
            labelData.forEach((labelDatum) => {
                var container = u.el.select('#label-' + labelDatum.objective.getId() + '-container');
                if (labelDatum.subLabelData) {
                    container.selectAll('.' + definitions_1.LabelDefinitions.SCORE_FUNCTION).remove(); // Delete any score functions attached to this container.
                    container.selectAll('.' + definitions_1.LabelDefinitions.WEIGHTS_PLOT).remove();
                    this.createLabels(u, labelDatum.subLabelData, container, labelDatum.objective.getId());
                }
                else {
                    container.selectAll('.' + definitions_1.LabelDefinitions.LABEL_SUBCONTAINER).remove();
                    u.el.select('#label-' + labelDatum.objective.getId() + '-outline')
                        .classed(definitions_1.LabelDefinitions.PRIMITIVE_OBJECTIVE_LABEL, true);
                    u.el.select('#label-' + labelDatum.objective.getId() + '-text')
                        .classed(definitions_1.LabelDefinitions.PRIMITIVE_OBJECTIVE_LABEL, true);
                    this.createScoreFunction(u, container, labelDatum.objective);
                    this.createWeightsPlot(u, container, labelDatum.objective);
                }
            });
            this.toggleDisplayWeightsPlots(this.lastRendererUpdate.viewConfig.displayWeightDistributions);
            this.toggleDisplayScoreFunctions(this.lastRendererUpdate.viewConfig.displayScoreFunctions);
        }
        /*
            @param u - The most recent RendererUpdate message received by the LabelRenderer.
            @param labelData - The data for the labels to be updated and then displayed. Note that this data has a recursive (or nested) structure.
            @param parentName - The name of the label root container. Should almost alway be LabelDefinitions.ROOT_CONTAINER_NAME.
            @returns {void}
            @description 	Updates the data behind the labels using the renderLabels method. This method is mainly used to handle changes to user assigned objective weights.
                            It should NOT be used to render the label space for the first time, or to render it in a different orientation. This is what renderLabelSpace is for.
        */
        renderLabelSpace(u, labelData, parentName = definitions_1.LabelDefinitions.ROOT_CONTAINER_NAME) {
            // Calculate the width of the labels that are going to be created based on width of the area available, and the greatest depth of the Objective Hierarchy
            this.labelWidth = this.calculateMinLabelWidth(labelData, u.rendererConfig.dimensionOneSize, u);
            // Position the root container for the label area. This positions all of its child elements as well.
            this.rootContainer
                .attr('transform', 'translate(' + u.x + ',' + u.y + ')');
            this.renderLabels(u, labelData, parentName);
            // Indicate that rendering of the label area is complete.
            this.renderEventsService.labelsDispatcher.next(1);
        }
        /*
            @param u - The most recent RendererUpdate message received by the LabelRenderer.
            @param labelData - The data for the labels that are being rendered.
            @param parentName - The id of the objective whose label is the parent of the labels rendered by this method. That is, the id of the objective whose label data
                                is the parent of the label data rendered by this method.
            @returns {void}
            @description 	Recursively positions and styles labels and their child labels until the hierarchy is fully parsed. This method can be used to update the data behind the
                            labels as well, allowing it to either update, or simply render the a label and its children. Note that this method should generally NOT
                            be called manually. Use updateLabelSpace if the goal is to update all labels, or renderLabelSpace if the label space must be rendered.
        */
        renderLabels(u, labelData, parentName) {
            this.labelSelections[parentName].labelContainers.data(labelData);
            // Calculate the weight offsets for this level of the Objective hierarchy, NOT counting children of other Abstract objectives at the same level.
            var weightOffsets = [];
            var weightSum = 0; // The weight offset for the first objective at this level is 0.
            for (var i = 0; i < labelData.length; i++) {
                weightOffsets[i] = weightSum;
                weightSum += labelData[i].weight;
            }
            this.renderLabelOutline(u, this.labelSelections[parentName].subContainerOutlines, weightOffsets); // Render the outlining rectangle.
            this.renderLabelText(u, this.labelSelections[parentName].labelText, weightOffsets, parentName); // Render the text within the label
            this.renderLabelDividers(u, this.labelSelections[parentName].dividers, weightOffsets);
            // Recursively render the labels that are children of this label (ie. the labels of the objectives that are children of those objectives in labelData)
            labelData.forEach((labelDatum, index) => {
                let scaledWeightOffset = u.rendererConfig.dimensionTwoScale(weightOffsets[index]); // Determine the y (or x) offset for this label's children based on its weight offset.
                if (labelDatum.depthOfChildren === 0) { // This label has no child labels.
                    let offset = this.determineLabelWidth(labelDatum, u);
                    let labelTransform = this.rendererService.generateTransformTranslation(u.viewConfig.viewOrientation, offset, scaledWeightOffset); // Generate the transformation.
                    this.labelSelections[labelDatum.objective.getId() + '-scorefunction'].scoreFunction.attr('transform', labelTransform);
                    // ONLY render the Score Functions if they are being displayed.
                    if (u.viewConfig.displayScoreFunctions) {
                        offset += this.labelWidth;
                        this.renderScoreFunction(u, labelDatum.objective, this.scoreFunctionSubjects[labelDatum.objective.getId() + '-scorefunction'], this.labelSelections[labelDatum.objective.getId() + '-scorefunction'].scoreFunction);
                    }
                    labelTransform = this.rendererService.generateTransformTranslation(u.viewConfig.viewOrientation, offset, scaledWeightOffset); // Generate the transformation.
                    this.labelSelections[labelDatum.objective.getId() + '-weightsplot'].weightsPlot.attr('transform', labelTransform);
                    if (u.viewConfig.displayWeightDistributions) {
                        this.renderWeightsPlot(u, labelDatum.objective, this.weightsPlotSubjects[labelDatum.objective.getId() + '-weightsplot'], this.labelSelections[labelDatum.objective.getId() + '-weightsplot'].weightsPlot);
                    }
                }
                else {
                    let offset = (u.reducedInformation) ? 0 : this.labelWidth;
                    let labelTransform = this.rendererService.generateTransformTranslation(u.viewConfig.viewOrientation, offset, scaledWeightOffset); // Generate the transformation.
                    this.labelSelections[labelDatum.objective.getId()].labelContainers.attr('transform', labelTransform); // Apply the transformation to the sub label containers who are children of this label so that they inherit its position.
                    this.renderLabels(u, labelDatum.subLabelData, labelDatum.objective.getId()); // Render the sub labels using the data update selection.
                }
            });
        }
        /*
            @param u - The most recent RendererUpdate message received by the LabelRenderer.
            @param labelOutlines - The selection of 'rect' elements that act as the outlines for a set of sibling labels.
            @param weightOffsets - An array of weight offsets that map to the elements in the selection of label outlines. This is array is used to determine the position of sibling labels relative to each other.
            @returns {void}
            @description 	Positions and styles the outlines of a set of sibling labels.
        */
        renderLabelOutline(u, labelOutlines, weightOffsets) {
            labelOutlines
                .attr(u.rendererConfig.dimensionOne, (d, i) => { return this.determineLabelWidth(d, u); })
                .attr(u.rendererConfig.coordinateOne, 0) // Have to set CoordinateOne to be 0, or when we re-render in a different orientation the switching of the width and height can cause an old value to be retained
                .attr(u.rendererConfig.dimensionTwo, (d, i) => {
                return Math.max(u.rendererConfig.dimensionTwoScale(d.weight) - 2, 0); // Determine the height (or width) as a function of the weight
            })
                .attr(u.rendererConfig.coordinateTwo, ((d, i) => {
                return u.rendererConfig.dimensionTwoScale(weightOffsets[i]); // Determine the y position (or x) offset from the top of the containing 'g' as function of the combined weights of the previous objectives. 
            }));
        }
        /*
            @param u - The most recent RendererUpdate message received by the LabelRenderer.
            @param labelTexts - The selection of 'text' elements that act as the label text for a set of sibling labels.
            @param weightOffsets - An array of weight offsets that map to the elements in the selection of label outlines. This is array is used to determine the position of sibling labels relative to each other.
            @param parentName - The id of the objective whose label is the parent of the label whose text is rendered by this method.
            @returns {void}
            @description 	Positions and styles the label text of a set of sibling labels. This includes rendering the name, weight (in percentage points), and best and worst elements.
        */
        renderLabelText(u, labelTexts, weightOffsets, parentName) {
            var textOffset = 5;
            // Determine the position of the text within the box depending on the orientation
            labelTexts.attr(u.rendererConfig.coordinateOne, () => {
                return (u.viewConfig.viewOrientation === types_1.ChartOrientation.Vertical) ? 10 : (this.labelWidth / 2);
            })
                .attr(u.rendererConfig.coordinateTwo, (d, i) => {
                return (u.viewConfig.viewOrientation === types_1.ChartOrientation.Vertical) ?
                    u.rendererConfig.dimensionTwoScale(weightOffsets[i]) + (u.rendererConfig.dimensionTwoScale(d.weight) / 2) + textOffset
                    :
                        u.rendererConfig.dimensionTwoScale(weightOffsets[i]) + (u.rendererConfig.dimensionTwoScale(d.weight) / 5) + textOffset;
            });
            this.labelSelections[parentName].nameText
                .text((d) => {
                // Round the weight number to have 2 decimal places only.
                return d.objective.getName() + ' (' + (Math.round((d.weight / u.maximumWeightMap.getWeightTotal()) * 1000) / 10) + '%)';
            });
            this.labelSelections[parentName].bestWorstText
                .attr('x', (d, i) => { return (u.viewConfig.viewOrientation === types_1.ChartOrientation.Vertical) ? 10 : u.rendererConfig.dimensionTwoScale(weightOffsets[i]) + (u.rendererConfig.dimensionTwoScale(d.weight) / 5) + textOffset; })
                .attr('dy', '1.2em')
                .text((d) => {
                var bestWorstText = '';
                if (d.objective.objectiveType === 'primitive' && u.valueChart.getType() === model_1.ChartType.Individual && u.usersToDisplay[0]) {
                    var scoreFunction = u.usersToDisplay[0].getScoreFunctionMap().getObjectiveScoreFunction(d.objective.getId());
                    bestWorstText = '\n [ best: ' + scoreFunction.bestElement + ', worst: ' + scoreFunction.worstElement + ' ]';
                }
                return bestWorstText;
            });
            if (u.reducedInformation) {
                labelTexts.style('display', 'none');
            }
            else {
                labelTexts.style('display', 'block');
            }
        }
        /*
            @param u - The most recent RendererUpdate message received by the LabelRenderer.
            @param labelDividers - The selection of 'line' elements that are to be rendered into label dividers.
            @param weightOffsets - An array of weight offsets that map to the elements in the selection of label outlines. This is array is used to determine the position of sibling labels relative to each other.
            @returns {void}
            @description 	Positions and styles the dividers between a set of sibling labels. These dividers are used to implement clicking and dragging to change objective weights, and are the click targets.
        */
        renderLabelDividers(u, labelDividers, weightOffsets) {
            var calculateDimensionTwoOffset = (d, i) => {
                return u.rendererConfig.dimensionTwoScale(weightOffsets[i]) - 2; // Determine the height (or width) as a function of the weight
            };
            labelDividers
                .attr(u.rendererConfig.coordinateOne + '1', 0)
                .attr(u.rendererConfig.coordinateOne + '2', (d, i) => {
                return (i === 0) ? 0 : this.determineLabelWidth(d, u);
            })
                .attr(u.rendererConfig.coordinateTwo + '1', calculateDimensionTwoOffset)
                .attr(u.rendererConfig.coordinateTwo + '2', calculateDimensionTwoOffset);
        }
        createWeightsPlot(u, labelContainer, objective) {
            this.labelSelections[objective.getId() + '-weightsplot'] = {};
            labelContainer.selectAll('.' + definitions_1.LabelDefinitions.WEIGHTS_PLOT).remove();
            // Create a container for the weights distribution plot.
            var weightsPlot = labelContainer.selectAll('.' + definitions_1.LabelDefinitions.WEIGHTS_PLOT)
                .data([objective]).enter().append('g')
                .classed(definitions_1.LabelDefinitions.WEIGHTS_PLOT, true)
                .attr('id', (d) => { return 'label-' + d.getId() + '-weightsplot'; });
            // Cache the weights distribution plot container selection using the id of corresponding PrimitiveObjective.
            this.labelSelections[objective.getId() + '-weightsplot'].weightsPlot = weightsPlot;
            var renderer = new renderers_3.ViolinRenderer();
            // Cache the renderer instance under the Primitive Objective ID.
            this.labelSelections[objective.getId() + '-weightsplot'].renderer = renderer;
            // Create a new Subject that will be used to pass renderer updates to the ScoreFunctionRenderer.
            var weightsPlotSubject = new Subject_1.Subject();
            weightsPlotSubject.map((update) => {
                update.el = weightsPlot;
                update.objective = objective;
                return update;
            }).map(this.rendererScoreFunctionUtility.produceWeightDistributionData)
                .map(this.rendererScoreFunctionUtility.produceViewConfig)
                .subscribe(renderer.weightsPlotChanged);
            // Cache the subject associated with the new ScoreFunctionPlot.
            this.weightsPlotSubjects[objective.getId() + '-weightsplot'] = weightsPlotSubject;
            // Render the Score Function for the first time. This is required to create the SVG elements/structure of the ScoreFunction plot.
            this.renderWeightsPlot(u, objective, this.weightsPlotSubjects[objective.getId() + '-weightsplot'], weightsPlot);
        }
        renderWeightsPlot(u, objective, weightsPlotSubject, weightsPlotContainer) {
            var width;
            var height;
            var weightOffset = 0;
            var objective;
            var objectiveWeight;
            objectiveWeight = u.maximumWeightMap.getObjectiveWeight(objective.getId());
            if (u.viewConfig.viewOrientation === types_1.ChartOrientation.Vertical) {
                width = this.labelWidth;
                height = this.lastRendererUpdate.rendererConfig.dimensionTwoScale(objectiveWeight);
            }
            else {
                width = this.lastRendererUpdate.rendererConfig.dimensionTwoScale(objectiveWeight);
                height = this.labelWidth;
            }
            weightsPlotSubject.next({
                width: width,
                height: height,
                users: u.usersToDisplay,
                structuralUpdate: u.structuralUpdate,
                viewOrientation: u.viewConfig.viewOrientation
            });
        }
        /*
            @param u - The most recent RendererUpdate message received by the LabelRenderer.
            @param labelContainer - The 'g' element that contains the label whose ScoreFunction is to be created.
            @param objective - The PrimitveObjective for which to create a ScoreFunction plot.
            @returns {void}
            @description 	Creates a score function plot for the input PrimitiveObjective a instance of ScoreFunctionRenderer.
        */
        createScoreFunction(u, labelContainer, objective) {
            this.labelSelections[objective.getId() + '-scorefunction'] = {};
            labelContainer.selectAll('.' + definitions_1.LabelDefinitions.SCORE_FUNCTION).remove();
            // Create a container for the score function plot.
            var scoreFunction = labelContainer.selectAll('.' + definitions_1.LabelDefinitions.SCORE_FUNCTION)
                .data([objective]).enter().append('g')
                .classed(definitions_1.LabelDefinitions.SCORE_FUNCTION, true)
                .attr('id', (d) => { return 'label-' + d.getId() + '-scorefunction'; });
            // Cache the score function plot container selection using the id of corresponding PrimitiveObjective.
            this.labelSelections[objective.getId() + '-scorefunction'].scoreFunction = scoreFunction;
            // Instantiate the correct ScoreFunctionRenderer.
            var renderer;
            if (objective.getDomainType() === 'categorical' || objective.getDomainType() === 'interval')
                renderer = new renderers_1.DiscreteScoreFunctionRenderer(this.chartUndoRedoService);
            else
                renderer = new renderers_2.ContinuousScoreFunctionRenderer(this.chartUndoRedoService);
            // Cache the renderer instance under the Primitive Objective ID.
            this.labelSelections[objective.getId() + '-scorefunction'].renderer = renderer;
            // Create a new Subject that will be used to pass renderer updates to the ScoreFunctionRenderer.
            var scoreFunctionSubject = new Subject_1.Subject();
            scoreFunctionSubject.map((sfU) => {
                sfU.el = scoreFunction;
                sfU.objective = objective;
                return sfU;
            }).map(this.rendererScoreFunctionUtility.produceScoreFunctionData)
                .map(this.rendererScoreFunctionUtility.produceViewConfig)
                .subscribe(renderer.scoreFunctionChanged);
            // Cache the subject associated with the new ScoreFunctionPlot.
            this.scoreFunctionSubjects[objective.getId() + '-scorefunction'] = scoreFunctionSubject;
            this.scoreFunctionViewSubject.subscribe(renderer.viewConfigChanged);
            this.scoreFunctionInteractionSubject.map((interactionConfig) => { return { adjustScoreFunctions: (interactionConfig.adjustScoreFunctions && !objective.getDefaultScoreFunction().immutable), expandScoreFunctions: interactionConfig.expandScoreFunctions }; })
                .subscribe(renderer.interactionConfigChanged);
            // Render the Score Function for the first time. This is required to create the SVG elements/structure of the ScoreFunction plot.
            this.renderScoreFunction(u, objective, this.scoreFunctionSubjects[objective.getId() + '-scorefunction'], scoreFunction);
        }
        /*
            @param u - The most recent RendererUpdate message received by the LabelRenderer.
            @param objective - The PrimitveObjective whose ScoreFunction plot is to be rendered.
            @param scoreFunctionSubject - The Subject associated with the ScoreFunction plot that is going to be rendered. This is used to send the RendererUpdate message.
            @param scoreFunctionContainer - The 'g' element that contains the ScoreFunction plot.
            @returns {void}
            @description 	Uses the ScoreFunctionRenderer and its subclasses to position and give widths + heights to the score functions created by the createScoreFunctions method.
        */
        renderScoreFunction(u, objective, scoreFunctionSubject, scoreFunctionContainer) {
            var data = u.valueChart.getAllPrimitiveObjectives();
            var width;
            var height;
            var weightOffset = 0;
            var objective;
            var objectiveWeight;
            objectiveWeight = u.maximumWeightMap.getObjectiveWeight(objective.getId());
            if (u.viewConfig.viewOrientation === types_1.ChartOrientation.Vertical) {
                width = this.labelWidth;
                height = this.lastRendererUpdate.rendererConfig.dimensionTwoScale(objectiveWeight);
            }
            else {
                width = this.lastRendererUpdate.rendererConfig.dimensionTwoScale(objectiveWeight);
                height = this.labelWidth;
            }
            var scoreFunctions = [];
            var colors = [];
            u.usersToDisplay.forEach((user) => {
                scoreFunctions.push(user.getScoreFunctionMap().getObjectiveScoreFunction(objective.getId()));
                colors.push(user.color);
            });
            scoreFunctionSubject.next({
                width: width,
                height: height,
                interactionConfig: { adjustScoreFunctions: (u.interactionConfig.adjustScoreFunctions && !objective.getDefaultScoreFunction().immutable), expandScoreFunctions: true },
                scoreFunctions: scoreFunctions,
                colors: colors,
                viewOrientation: u.viewConfig.viewOrientation,
                individual: u.valueChart.isIndividual()
            });
            this.scoreFunctionViewSubject.next(u.viewConfig.displayScoreFunctionValueLabels);
        }
        /*
            @param u - The most recent RendererUpdate message received by the LabelRenderer.
            @returns {void}
            @description 	Apply the styles the elements of the label area. Note that this only applies styles which actively depend on the value of the RendererUpdate.
                            Other style are applied using CSS classes.
        */
        applyStyles(u) {
            this.rootContainer.selectAll('.' + definitions_1.LabelDefinitions.SUBCONTAINER_OUTLINE)
                .style('fill', 'white')
                .style('stroke', (d) => {
                // PrimitiveObjective's should have their own color unless the ValueChart has multiple users. Abstract Objectives should always be gray.
                return (d.depthOfChildren === 0 && u.valueChart.isIndividual()) ? d.objective.getColor() : 'gray';
            });
            var bestWorstText = this.rootContainer.selectAll('.' + definitions_1.LabelDefinitions.SUBCONTAINER_BEST_WORST);
            if (u.valueChart.isIndividual()) {
                bestWorstText
                    .style('display', 'block');
            }
            else {
                bestWorstText
                    .style('display', 'none');
            }
        }
        /*
            @param displayScoreFunctionPlots - whether or no ScoreFunction plots should be displayed.
            @returns {void}
            @description 	Toggles ScoreFunctionPlots on or off by showing/hiding them using 'display'. This should is called automatically whenever the viewConfig changes.
        */
        toggleDisplayScoreFunctions(displayScoreFunctions) {
            if (displayScoreFunctions) {
                this.rootContainer.selectAll('.' + definitions_1.LabelDefinitions.SCORE_FUNCTION).style('display', 'block');
            }
            else {
                this.rootContainer.selectAll('.' + definitions_1.LabelDefinitions.SCORE_FUNCTION).style('display', 'none');
            }
        }
        /*
            @param displayScoreFunctionPlots - whether or no ScoreFunction plots should be displayed.
            @returns {void}
            @description 	Toggles ScoreFunctionPlots on or off by showing/hiding them using 'display'. This should is called automatically whenever the viewConfig changes.
        */
        toggleDisplayWeightsPlots(displayWeightsPlots) {
            if (displayWeightsPlots) {
                this.rootContainer.selectAll('.' + definitions_1.LabelDefinitions.WEIGHTS_PLOT).style('display', 'block');
            }
            else {
                this.rootContainer.selectAll('.' + definitions_1.LabelDefinitions.WEIGHTS_PLOT).style('display', 'none');
            }
        }
    };
    LabelRenderer = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [utilities_1.RendererScoreFunctionUtility,
            services_2.RendererService,
            services_1.RenderEventsService,
            services_3.ChartUndoRedoService,
            interactions_1.ResizeWeightsInteraction,
            interactions_2.SetObjectiveColorsInteraction,
            interactions_3.ReorderObjectivesInteraction,
            interactions_4.SortAlternativesInteraction])
    ], LabelRenderer);
    return LabelRenderer;
})();
exports.LabelRenderer = LabelRenderer;
//# sourceMappingURL=Label.renderer.js.map