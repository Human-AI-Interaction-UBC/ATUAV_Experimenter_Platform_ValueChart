"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-07-12 16:46:23
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-07-19 12:11:42
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
exports.ScoreFunctionDirective = void 0;
const core_1 = require("@angular/core");
// d3
const d3 = require("d3");
const _ = require("lodash");
const Subject_1 = require("rxjs/Subject");
require("../../app/utilities/rxjs-operators");
const ValueChartVis_1 = require("../../ValueChartVis");
const ValueChartVis_2 = require("../../ValueChartVis");
const ValueChartVis_3 = require("../../ValueChartVis");
const model_1 = require("../../model");
const types_1 = require("../../types");
let ScoreFunctionDirective = /** @class */ (() => {
    let ScoreFunctionDirective = class ScoreFunctionDirective {
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        /*
            @returns {void}
            @description 	Used for Angular's dependency injection ONLY. It should not be used to do any initialization of the class.
                            This constructor will be called automatically when Angular constructs an instance of this class prior to dependency injection.
        */
        constructor() { }
        // ========================================================================================
        // 									Methods
        // ========================================================================================
        set services(value) {
            this.chartUndoRedoService = value.chartUndoRedoService;
        }
        ngOnInit() {
            this.scoreFunctionPlotContainer = d3.select('.expanded-score-function');
            this.rendererScoreFunctionUtility = new ValueChartVis_3.RendererScoreFunctionUtility();
            this.initChangeDetection();
            this.initScoreFunctionPlot();
        }
        initChangeDetection() {
            this.previousScoreFunctions = _.cloneDeep(this.scoreFunctions);
            this.previousObjectiveToDisplay = _.cloneDeep(this.objective);
            this.previousEnableInteraction = _.clone(this.enableInteraction);
        }
        initScoreFunctionPlot() {
            if (this.objective.getDomainType() === 'continuous') {
                this.scoreFunctionRenderer = new ValueChartVis_2.ContinuousScoreFunctionRenderer(this.chartUndoRedoService);
            }
            else {
                this.scoreFunctionRenderer = new ValueChartVis_1.DiscreteScoreFunctionRenderer(this.chartUndoRedoService);
            }
            this.scoreFunctionSubject = new Subject_1.Subject();
            this.interactionSubject = new Subject_1.Subject();
            this.rendererSubscription = this.scoreFunctionSubject.map((sfU) => {
                sfU.el = this.scoreFunctionPlotContainer;
                sfU.objective = this.objective;
                return sfU;
            }).map(this.rendererScoreFunctionUtility.produceScoreFunctionData)
                .map(this.rendererScoreFunctionUtility.produceViewConfig)
                .subscribe(this.scoreFunctionRenderer.scoreFunctionChanged);
            this.interactionSubject.subscribe(this.scoreFunctionRenderer.interactionConfigChanged);
            this.scoreFunctionSubject.next({
                width: this.width,
                height: this.height,
                colors: this.colors,
                scoreFunctions: this.scoreFunctions,
                viewOrientation: this.viewOrientation,
                interactionConfig: { expandScoreFunctions: false, adjustScoreFunctions: this.enableInteraction },
                individual: this.individual
            });
            this.interactionSubject.next({ expandScoreFunctions: false, adjustScoreFunctions: this.enableInteraction });
        }
        ngDoCheck() {
            if (this.previousObjectiveToDisplay.getName() !== this.objective.getName()) {
                this.rendererSubscription.unsubscribe();
                this.previousObjectiveToDisplay = _.cloneDeep(this.objective);
                this.initScoreFunctionPlot();
            }
            if (this.enableInteraction !== this.previousEnableInteraction) {
                this.interactionSubject.next({ expandScoreFunctions: false, adjustScoreFunctions: this.enableInteraction });
                this.previousEnableInteraction = _.clone(this.enableInteraction);
            }
            if (!_.isEqual(this.previousScoreFunctions, this.scoreFunctions)) {
                this.scoreFunctionSubject.next({
                    width: this.width,
                    height: this.height,
                    interactionConfig: { expandScoreFunctions: false, adjustScoreFunctions: this.enableInteraction },
                    colors: this.colors,
                    scoreFunctions: this.scoreFunctions,
                    viewOrientation: this.viewOrientation,
                    individual: this.individual
                });
                this.previousScoreFunctions = _.cloneDeep(this.scoreFunctions);
                // If this is a sub window, update the parent window in response to the changes.
                if (window.opener) {
                    window.opener.angularAppRef.tick();
                }
            }
        }
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], ScoreFunctionDirective.prototype, "scoreFunctions", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], ScoreFunctionDirective.prototype, "colors", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", model_1.PrimitiveObjective)
    ], ScoreFunctionDirective.prototype, "objective", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Number)
    ], ScoreFunctionDirective.prototype, "width", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Number)
    ], ScoreFunctionDirective.prototype, "height", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Number)
    ], ScoreFunctionDirective.prototype, "viewOrientation", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], ScoreFunctionDirective.prototype, "individual", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], ScoreFunctionDirective.prototype, "enableInteraction", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [Object])
    ], ScoreFunctionDirective.prototype, "services", null);
    ScoreFunctionDirective = __decorate([
        core_1.Directive({
            selector: 'ScoreFunction'
        }),
        __metadata("design:paramtypes", [])
    ], ScoreFunctionDirective);
    return ScoreFunctionDirective;
})();
exports.ScoreFunctionDirective = ScoreFunctionDirective;
//# sourceMappingURL=ScoreFunction.directive.js.map