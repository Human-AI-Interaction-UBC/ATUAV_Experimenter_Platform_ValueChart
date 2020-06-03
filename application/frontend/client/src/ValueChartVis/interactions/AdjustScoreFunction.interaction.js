"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2017-05-11 15:57:10
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-07-18 13:22:30
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
exports.AdjustScoreFunctionInteraction = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
// Import Libraries:
const d3 = require("d3");
// Import Application Classes
const services_1 = require("../services");
const types_1 = require("../../types");
/*
    This class contains all the logic for adjusting user ScoreFunctions by implementing interactions for the ScoreFunction plots.
    For discrete ScoreFunction plots, the tops of the bars in the bar chart are made dragable when the interaction is turned on.
    This allows them to be moved up and down and thus permits adjusting the discrete score function.
    For continuous ScoreFunction plots, the so-called "knots" become tragable. This allows the user to create/adjust a piecewise linear function
    that expresses their scorefunction.
*/
let AdjustScoreFunctionInteraction = /** @class */ (() => {
    let AdjustScoreFunctionInteraction = class AdjustScoreFunctionInteraction {
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        /*
            @returns {void}
            @description 	Used for Angular's dependency injection ONLY. It should not be used to do any initialization of the class.
                            This constructor will be called automatically when Angular constructs an instance of this class prior to dependency injection.
        */
        constructor(chartUndoRedoService) {
            this.chartUndoRedoService = chartUndoRedoService;
            this.handleDrag = (d, i) => {
                var score;
                // Convert the y position of the mouse into a score by using the inverse of the scale used to convert scores into y positions:
                if (this.lastRendererUpdate.viewOrientation === types_1.ChartOrientation.Vertical) {
                    // Subtract the event y form the offset to obtain the y value measured from the bottom of the plot.
                    score = this.lastRendererUpdate.heightScale.invert(this.lastRendererUpdate.rendererConfig.independentAxisCoordinateTwo - d3.event[this.lastRendererUpdate.rendererConfig.coordinateTwo]);
                }
                else {
                    // No need to do anything with offsets here because x is already left to right.
                    score = this.lastRendererUpdate.heightScale.invert(d3.event[this.lastRendererUpdate.rendererConfig.coordinateTwo]);
                }
                score = Math.max(0, Math.min(score, 1)); // Normalize the score to be between 0 and 1.
                d.scoreFunction.setElementScore(d.element, score);
            };
        }
        // ========================================================================================
        // 									Methods
        // ========================================================================================
        /*
            @param adjustScoreFunctions - Whether dragging to alter a user's score function should be enabled.
            @param chartElements - The selection of chart elements that will become (or stop being) dragable depending on the value of adjustScoreFunctions.
            @param rendererUpdate - The most recent ScoreFunctionUpdate object.
            @returns {void}
            @description	This method toggles the interaction that allows clicking and dragging on scatter plot points to alter a user's score function.
        */
        toggleDragToChangeScore(adjustScoreFunctions, chartElement, rendererUpdate) {
            this.lastRendererUpdate = rendererUpdate;
            this.adjustScoreFunctions = adjustScoreFunctions;
            var dragToResizeScores = d3.drag();
            if (adjustScoreFunctions) {
                dragToResizeScores.on('start', (d, i) => {
                    // Save the current state of the ScoreFunction.
                    this.chartUndoRedoService.saveScoreFunctionRecord(d.scoreFunction, this.lastRendererUpdate.objective);
                });
                dragToResizeScores.on('drag', this.handleDrag);
            }
            // Set the drag listeners on the point elements.
            chartElement.call(dragToResizeScores);
            // Set the cursor style for the points to indicate that they are drag-able (if dragging was enabled).
            chartElement.style('cursor', () => {
                if (!adjustScoreFunctions) {
                    return 'auto';
                }
                else {
                    return (this.lastRendererUpdate.viewOrientation === types_1.ChartOrientation.Vertical) ? 'ns-resize' : 'ew-resize';
                }
            });
        }
    };
    AdjustScoreFunctionInteraction = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [services_1.ChartUndoRedoService])
    ], AdjustScoreFunctionInteraction);
    return AdjustScoreFunctionInteraction;
})();
exports.AdjustScoreFunctionInteraction = AdjustScoreFunctionInteraction;
//# sourceMappingURL=AdjustScoreFunction.interaction.js.map