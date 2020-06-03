"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-06-27 15:53:36
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-07-10 17:06:49
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
exports.ChangeDetectionService = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
// Import libraries:
const _ = require("lodash");
let ChangeDetectionService = /** @class */ (() => {
    let ChangeDetectionService = class ChangeDetectionService {
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        /*
            @returns {void}
            @description	Used for Angular's dependency injection. This constructor should NOT be called manually. Angular will automatically handle the construction of this service when it is injected.
        */
        constructor() {
            this.viewConfigRecord = {}; // Copy of the previous view config. Its fields should equal those of the viewConfig object in RendererConfigUtility unless a change has taken place.
            this.interactionConfigRecord = {}; // Copy of the previous interaction config. Its fields should equal those of the interactionConfig object in ValueChartDirective unless a change has taken place.
        }
        // ========================================================================================
        // 									Methods
        // ========================================================================================
        /*
            @param valueChart - the ValueChart to be copied for use in future comparisons.
            @param width - the width of the area in which to render the ValueChart; to be copied for future comparisons.
            @param height - the width of the area in which to render the ValueChart; to be copied for future comparisons.
            @param viewConfig - the viewConfig object submitted to the ValueChartDirective; to be copied for future comparisons.
            @param interactionConfig - the viewConfig object submitted to the ValueChartDirective; to be copied for future comparisons.
            @param usersToDisplay - the list of users to be rendered.
            @returns {void}
            @description	Creates deep copies of the inputs to the ValueChartDirective and saves them into class fields. It should be used to initiate
                            change detection and must be called before the change detection methods in this class.
        */
        startChangeDetection(valueChart, width, height, viewConfig, interactionConfig, reducedInformation, usersToDisplay) {
            this.valueChartRecord = _.cloneDeep(valueChart);
            this.widthRecord = _.clone(width);
            this.heightRecord = _.clone(height);
            this.chartTypeRecord = _.clone(valueChart.getType());
            this.viewConfigRecord = _.cloneDeep(viewConfig);
            this.interactionConfigRecord = _.cloneDeep(interactionConfig);
            this.usersToDisplayRecord = _.cloneDeep(usersToDisplay);
            this.reducedInformationRecord = _.clone(reducedInformation);
        }
        /*
            @param valueChart - the current ValueChart to check for changes.
            @param viewConfig - the current viewConfig to check for changes.
            @param interactionConfig - the current interactionConfig to check for changes.
            @param renderRequired - whether or not a renderer instance has indicated that it must be re-rendered for some reason.
            @returns {boolean} - whether or not changes have occurred.
            @description	Deep compares the method inputs against saved records to determine if there are any changes since the last time detectChanges was called (or since startChangeDetection)
                            if detectChanges has not yet been called. startChangeDetection should be used to initialize change detection before using this method.
                            detectChanges should be used to detect changes that require an entire re-rendering of the ValueChart.
        */
        detectChanges(valueChart, viewConfig, interactionConfig, reducedInformation, renderRequired) {
            var valueChartChanged = !_.isEqual(valueChart.getUsers(), this.valueChartRecord.getUsers());
            var chartTypeChanged = !_.isEqual(valueChart.getType(), this.chartTypeRecord);
            var viewOrientationChanged = this.viewConfigRecord.viewOrientation !== viewConfig.viewOrientation;
            var scaleAlternativesChanged = this.viewConfigRecord.scaleAlternatives !== viewConfig.scaleAlternatives;
            var scoreFunctionDisplayChanged = this.viewConfigRecord.displayScoreFunctions !== viewConfig.displayScoreFunctions;
            var weightDistributionsDisplayChanged = this.viewConfigRecord.displayWeightDistributions !== viewConfig.displayWeightDistributions;
            var reducedInformationChanged = this.reducedInformationRecord != reducedInformation;
            if (valueChartChanged)
                this.valueChartRecord = _.cloneDeep(valueChart);
            this.chartTypeRecord = _.clone(valueChart.getType());
            this.reducedInformationRecord = _.clone(reducedInformation);
            return valueChartChanged || chartTypeChanged || viewOrientationChanged || scaleAlternativesChanged || scoreFunctionDisplayChanged || weightDistributionsDisplayChanged || reducedInformationChanged || renderRequired;
        }
        /*
            @param valueChart - the current ValueChart to check for changes.
            @param usersToDisplay - the list of users to be rendered.
            @returns {boolean} - whether or not changes have occurred.
            @description	Deep compares the method inputs against saved records to determine if there are any changes since the last time detectStructuralChanges was called (or since startChangeDetection)
                            This method detects structural changes to the ValueChartDirective inputs. These are changes that require updates to the SVG structure of the visualizations in addition to
                            re-rendering.
        */
        detectStructuralChanges(valueChart, usersToDisplay) {
            var usersToDisplayChanged = usersToDisplay.length !== this.usersToDisplayRecord.length;
            var alternativesChanged = !_.isEqual(valueChart.getAlternatives(), this.valueChartRecord.getAlternatives());
            var objectivesChanged = !_.isEqual(valueChart.getRootObjectives(), this.valueChartRecord.getRootObjectives());
            if (usersToDisplayChanged || alternativesChanged || objectivesChanged) {
                this.usersToDisplayRecord = _.cloneDeep(usersToDisplay);
                this.valueChartRecord = _.cloneDeep(valueChart);
            }
            return usersToDisplayChanged || alternativesChanged || objectivesChanged;
        }
        /*
            @param width - the current width to be checked for changes.
            @param height - the current height to be checked for changes.
            @param viewConfig - the current viewConfiguration. Only the scaleAlternatives setting of this configuration object matters.
            @returns {boolean} - whether or not changes have occurred.
            @description 	Compares the current width and height against saved records to determined if they have changed since the last comparison.
                            It also compares the scaleAlternatives field to determine if it has changed. This is because changes in scaleAlternatives require changes in the size
                            of the visualization's base SVG element.
                            This method is separate from detectChanges because width/height changes must be handled differently form changes that simply require re-rendering.
        */
        detectWidthHeightChanges(width, height, viewConfig) {
            var widthHeightChanges = this.widthRecord !== width || this.heightRecord !== height;
            var scaleAlternativesChanged = this.viewConfigRecord.scaleAlternatives !== viewConfig.scaleAlternatives;
            this.widthRecord = _.clone(width);
            this.heightRecord = _.clone(height);
            return widthHeightChanges || scaleAlternativesChanged;
        }
        /*
            @param viewConfig -  the current viewConfig object to check for changes.
            @returns {boolean} - whether or not changes have occurred.
            @description	Compares the current veiwConfig object against a saved record to determine if changes have occurred.
        */
        detectViewConfigChanges(viewConfig) {
            var viewConfigChanged = !_.isEqual(this.viewConfigRecord, viewConfig);
            this.viewConfigRecord = _.cloneDeep(viewConfig);
            return viewConfigChanged;
        }
        /*
            @param interactionConfig - the current interactionConfig object to check for changes.
            @returns {boolean} - whether or not changes have occurred.
            @description	Compares the current interactionConfig object against a saved record to determine if changes have occurred.
        */
        detectInteractionConfigChanges(interactionConfig) {
            var interactionConfigChanged = !_.isEqual(this.interactionConfigRecord, interactionConfig);
            this.interactionConfigRecord = _.cloneDeep(interactionConfig);
            return interactionConfigChanged;
        }
    };
    ChangeDetectionService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [])
    ], ChangeDetectionService);
    return ChangeDetectionService;
})();
exports.ChangeDetectionService = ChangeDetectionService;
//# sourceMappingURL=ChangeDetection.service.js.map