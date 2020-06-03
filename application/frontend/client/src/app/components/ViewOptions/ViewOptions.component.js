"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-06-03 10:00:29
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-06-27 17:43:50
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
exports.ViewOptionsComponent = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
const core_2 = require("@angular/core");
// Import Types:
const types_1 = require("../../../types");
const model_1 = require("../../../model");
/*
    The ViewOptions component implements a UI widget for toggling ValueChart Visualization view options on and off.
    It sets creates and outputs a ViewConfig instance that can be directly input into the ValueChartDirective to set
    the visualization's view settings.

    This component is currently only used by the ValueChartViewer.
*/
let ViewOptionsComponent = /** @class */ (() => {
    let ViewOptionsComponent = class ViewOptionsComponent {
        constructor() {
            this.ChartType = model_1.ChartType;
            this.viewConfig = new core_2.EventEmitter();
            this.ChartOrientation = types_1.ChartOrientation;
            this.reducedInformation = false;
            this.reducedInfo = new core_2.EventEmitter();
        }
        ngOnInit() {
            this.config = {
                viewOrientation: types_1.ChartOrientation.Vertical,
                scaleAlternatives: true,
                displayScoreFunctions: false,
                displayWeightDistributions: false,
                displayTotalScores: true,
                displayScales: false,
                displayDomainValues: false,
                displayScoreFunctionValueLabels: false,
                displayAverageScoreLines: false
            };
            this.updateViewConfig(this.config);
        }
        updateViewConfig(configObject) {
            this.viewConfig.emit(configObject);
        }
        setReducedInformation(reducedInformation) {
            this.reducedInformation = reducedInformation;
            this.reducedInfo.emit(this.reducedInformation);
        }
        setOrientation(viewOrientation) {
            this.config.viewOrientation = viewOrientation;
            this.updateViewConfig(this.config);
        }
        setScaleAlternatives(scaleAlternatives) {
            this.config.scaleAlternatives = scaleAlternatives;
            this.updateViewConfig(this.config);
        }
        setDisplayScoreFunctions(newVal) {
            this.config.displayScoreFunctions = newVal;
            this.updateViewConfig(this.config);
        }
        setDisplayWeightDistributions(newVal) {
            this.config.displayWeightDistributions = newVal;
            this.updateViewConfig(this.config);
        }
        setDisplayDomainValues(newVal) {
            this.config.displayDomainValues = newVal;
            this.updateViewConfig(this.config);
        }
        setDisplayScales(newVal) {
            this.config.displayScales = newVal;
            this.updateViewConfig(this.config);
        }
        setDisplayTotalScores(newVal) {
            this.config.displayTotalScores = newVal;
            this.updateViewConfig(this.config);
        }
        setDisplayScoreFunctionValueLabels(newVal) {
            this.config.displayScoreFunctionValueLabels = newVal;
            this.updateViewConfig(this.config);
        }
        setDisplayAverageScoreLines(newVal) {
            this.config.displayAverageScoreLines = newVal;
            this.updateViewConfig;
        }
    };
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], ViewOptionsComponent.prototype, "viewConfig", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Number)
    ], ViewOptionsComponent.prototype, "chartType", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], ViewOptionsComponent.prototype, "reducedInfo", void 0);
    ViewOptionsComponent = __decorate([
        core_1.Component({
            selector: 'ViewOptions',
            templateUrl: './ViewOptions.template.html',
            providers: []
        }),
        __metadata("design:paramtypes", [])
    ], ViewOptionsComponent);
    return ViewOptionsComponent;
})();
exports.ViewOptionsComponent = ViewOptionsComponent;
//# sourceMappingURL=ViewOptions.component.js.map