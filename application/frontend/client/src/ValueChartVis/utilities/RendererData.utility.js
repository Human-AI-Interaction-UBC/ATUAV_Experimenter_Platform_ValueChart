"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-06-03 10:09:41
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-07-08 16:13:51
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
exports.RendererDataUtility = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
const model_1 = require("../../model");
const types_1 = require("../../types");
/*
    This class contains methods for converting a RendererUpdate message into a format suitable for d3.
    The produceMaximumWeightMap, produceRowData, and produceLabelData methods provide a mechanism for creating
    and attachning maximumWieightMaps, RowData, and LabelData from and to RendererUpdate objects. These method are
    usually not called manually; instead they are used as a part of a rendering pipeline that is created in ValueChartDirective.
*/
let RendererDataUtility = /** @class */ (() => {
    let RendererDataUtility = class RendererDataUtility {
        // The labelData are cached here in order to improve rendering performance.
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        /*
            @returns {void}
            @description 	Used for Angular's dependency injection ONLY. Unfortunately we are forced to assign handlers to the Undo/Redo services event emitters in this
                            method.
                            This constructor will be called automatically when Angular constructs an instance of this class prior to dependency injection.
        */
        constructor() {
            // ========================================================================================
            // 									Methods
            // ========================================================================================
            /*
                @param u - the RendererUpdate object used to produce a maximumWeightMap.
                @returns {RendererUpdate}
                @description Produces a WeightMap made up of the maximum user assigned weights for each PrimitiveObjective.
                             This maximum WeightMap is then attached the input RendererUpdate, u, which is returned.
                             This method is generally used as a part of the rendering pipeline created in ValueChartDirective.
            */
            this.produceMaximumWeightMap = (u) => {
                if (u.reducedInformation) {
                    u.maximumWeightMap = u.valueChart.getDefaultWeightMap();
                    let objectives = u.valueChart.getAllPrimitiveObjectives();
                    objectives.forEach((objective) => {
                        u.maximumWeightMap.setObjectiveWeight(objective.getId(), 1 / objectives.length);
                    });
                }
                // Return the default WeightMap if there are no users.
                else if (u.usersToDisplay.length == 0)
                    u.maximumWeightMap = u.valueChart.getDefaultWeightMap();
                // If there is only one user then the maximum WeightMap is that user's WeightMap
                else if (u.usersToDisplay.length == 1) {
                    u.maximumWeightMap = u.usersToDisplay[0].getWeightMap();
                }
                else
                    // There is more than one user and the maximum weight must be calculated.
                    u.maximumWeightMap = this.generateMaximumWeightMap(u);
                return u;
            };
            /*
                @param u - the RendererUpdate object used to produce rowData.
                @returns {RendererUpdate}
                @description Produces rowData using the input RendererUpdate object.
                             The rowData is then attached to the the input RendererUpdate, u, which is returned.
                             This method is generally used as a part of the rendering pipeline created in ValueChartDirective.
            */
            this.produceRowData = (u) => {
                u.rowData = this.generateRowData(u);
                ;
                this.computeStackedBarOffsets(u);
                return u;
            };
            /*
                @param u - the RendererUpdate object used to produce labelData.
                @returns {RendererUpdate}
                @description Produces labelData using the input RendererUpdate object.
                             The labelData is then attached to the the input RendererUpdate, u, which is returned.
                             This method is generally used as a part of the rendering pipeline created in ValueChartDirective.
            */
            this.produceLabelData = (u) => {
                // Re-generate the label data if it is undefined, or if the root labelDatum is undefined.
                if (!this.labelData || !this.labelData[0] || u.structuralUpdate) {
                    this.generateLabelData(u);
                }
                this.labelData.forEach((labelDatum) => {
                    this.updateLabelDataWeights(u, labelDatum);
                });
                u.labelData = this.labelData;
                return u;
            };
        }
        // ================================ Data Creation and Update Methods  ====================================
        /*
            @param u - THe rendererUpdate object from which to generate the maximumWeightMap.
            @returns {WeightMap} - A WeightMap where each objective weight is the maximum weight assigned to that objective by any user in chart.
            @description	Iterates over the ValueChart's collection of users to determine the maximum weight assigned to each primitive objective
                            by any user. These maximum weights are then inserted into a new WeightMap, the so called maximum WeightMap. If there is only
                            one user the in ValueChart, that user's weight map is simply returned. If there are no users, the default weight map is returned.
                            The maximum weight map is to determine label heights by the LabelRenderer, and row heights by the objective chart renderer.
        */
        generateMaximumWeightMap(u) {
            var maximumWeightMap = new model_1.WeightMap();
            var primitiveObjectives = u.valueChart.getAllPrimitiveObjectives();
            var combinedWeights = Array(primitiveObjectives.length).fill(0);
            if (u.usersToDisplay) {
                u.usersToDisplay.forEach((user) => {
                    if (user.getWeightMap()) {
                        let objectiveWeights = user.getWeightMap().getObjectiveWeights(primitiveObjectives);
                        for (var i = 0; i < objectiveWeights.length; i++) {
                            if (combinedWeights[i] < objectiveWeights[i]) {
                                combinedWeights[i] = objectiveWeights[i];
                            }
                        }
                    }
                });
                for (var i = 0; i < primitiveObjectives.length; i++) {
                    maximumWeightMap.setObjectiveWeight(primitiveObjectives[i].getId(), combinedWeights[i]);
                }
            }
            return maximumWeightMap;
        }
        /*
            @param u - The rendererUpdate object from which to generate the LabelData.
            @returns {void}
            @description	Generates the LabelData from the input RendererUpdate object and assigns it to the labelData field of the service.
        */
        generateLabelData(u) {
            this.labelData = [];
            u.valueChart.getRootObjectives().forEach((objective) => {
                this.labelData.push(this.getLabelDatum(u, objective, 0));
            });
        }
        /*
            @param u - The rendererUpdate object from which to generate the RowData.
            @returns {rowData}
            @description	Generates the RowData from the input RendererUpdate object and returns it.
        */
        generateRowData(u) {
            var weightOffset = 0;
            var rowData = [];
            u.valueChart.getAllPrimitiveObjectives().forEach((objective, index) => {
                rowData.push({
                    objective: objective,
                    weightOffset: weightOffset,
                    cells: this.generateCellData(u, objective)
                });
                weightOffset += u.maximumWeightMap.getObjectiveWeight(objective.getId());
            });
            return rowData;
        }
        /*
            @param u - The rendererUpdate object from which to generate the CellData.
            @param objective - the objective for which the cell data is to be created.
            @returns {void}
            @description	Generates the CellData for the given objective and from the input RendererUpdate object and then returns it.
        */
        generateCellData(u, objective) {
            var users = u.usersToDisplay;
            var cellData = u.valueChart.getAlternativeValuesforObjective(objective);
            cellData.forEach((objectiveValue) => {
                objectiveValue.userScores = [];
                for (var i = 0; i < users.length; i++) {
                    var userScore = {
                        objective: objective,
                        user: users[i],
                        value: objectiveValue.value
                    };
                    objectiveValue.userScores.push(userScore);
                }
            });
            return cellData;
        }
        getLabelDatum(u, objective, depth) {
            var labelData;
            if (objective.objectiveType === 'abstract') {
                var weight = 0;
                var children = [];
                var maxDepthOfChildren = 0;
                objective.getDirectSubObjectives().forEach((subObjective) => {
                    let labelDatum = this.getLabelDatum(u, subObjective, depth + 1);
                    weight += labelDatum.weight;
                    if (labelDatum.depthOfChildren > maxDepthOfChildren)
                        maxDepthOfChildren = labelDatum.depthOfChildren;
                    children.push(labelDatum);
                });
                labelData = { 'objective': objective, 'weight': weight, 'subLabelData': children, 'depth': depth, 'depthOfChildren': maxDepthOfChildren + 1 };
            }
            else if (objective.objectiveType === 'primitive') {
                labelData = { 'objective': objective, 'weight': u.maximumWeightMap.getObjectiveWeight(objective.getId()), 'depth': depth, 'depthOfChildren': 0 };
            }
            return labelData;
        }
        // ================================ Private Helpers for Updating Data ====================================
        // Note that the following methods perform IN-PLACE updates.
        /*
            @returns {void}
            @description	Updates the weight score offset assigned to each cell in each row of the rowData field. These offsets are required to position
                            the cells each column of the summary chart so that they appear to be stacked upon each other. This method should usually be called
                            via the updateAllValueChartData instead of being used directly.
        */
        computeStackedBarOffsets(u) {
            var rowDataCopy = u.rowData.slice(0, u.rowData.length);
            // In the vertical orientation rows are rendered going to down; rows with smaller indices are rendered above those with larger indices. 
            // This means that rows with smaller indices must be stacked above rows with larger indices in the stacked bar chart. So in the vertical
            // orientation we must reverse the order in which we calculate offsets. Otherwise, the earlier rows will have smaller offsets and the
            // stacked bar chart will be rendered in reverse. This is not a problem in the horizontal orientation since rows are rendered left to right
            // in that configuration, meaning that the default row order can be used to calculate offsets.
            if (u.viewConfig.viewOrientation === types_1.ChartOrientation.Vertical) {
                rowDataCopy.reverse();
            }
            for (var i = 0; i < rowDataCopy.length; i++) {
                var currentRow = rowDataCopy[i];
                for (var j = 0; j < currentRow.cells.length; j++) {
                    var currentCell = currentRow.cells[j];
                    for (var k = 0; k < currentCell.userScores.length; k++) {
                        var currentUserScore = currentCell.userScores[k];
                        var previousWeightedScore;
                        var previousOffset;
                        if (i === 0) {
                            previousOffset = 0;
                            previousWeightedScore = 0;
                        }
                        else {
                            let previousUserScore = rowDataCopy[i - 1].cells[j].userScores[k];
                            let scoreFunction = previousUserScore.user.getScoreFunctionMap().getObjectiveScoreFunction(previousUserScore.objective.getId());
                            previousWeightedScore = scoreFunction.getScore(previousUserScore.value) * previousUserScore.user.getWeightMap().getObjectiveWeight(previousUserScore.objective.getId());
                            previousOffset = previousUserScore.offset;
                        }
                        currentUserScore.offset = previousOffset + previousWeightedScore;
                    }
                }
            }
        }
        updateLabelDataWeights(u, labelDatum) {
            if (labelDatum.depthOfChildren !== 0) {
                labelDatum.weight = 0;
                labelDatum.subLabelData.forEach((subLabelDatum) => {
                    this.updateLabelDataWeights(u, subLabelDatum);
                    labelDatum.weight += subLabelDatum.weight;
                });
            }
            else {
                labelDatum.weight = u.maximumWeightMap.getObjectiveWeight(labelDatum.objective.getId());
            }
        }
    };
    RendererDataUtility = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [])
    ], RendererDataUtility);
    return RendererDataUtility;
})();
exports.RendererDataUtility = RendererDataUtility;
//# sourceMappingURL=RendererData.utility.js.map