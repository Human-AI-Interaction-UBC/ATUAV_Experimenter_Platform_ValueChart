"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-12-30 18:28:08
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-06-27 17:45:12
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
exports.InteractionOptionsComponent = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
const core_2 = require("@angular/core");
// Import Types:
const types_1 = require("../../../types");
/*
    The InteractionOptions component implements a UI widget for toggling ValueChart Visualization interactions on and off.
    It sets creates and outputs an InteractionConfig instance that can be directly input into the ValueChartDirective to set
    the visualization's interaction settings.

    This component is currently only used by the ValueChartViewer.
*/
let InteractionOptionsComponent = /** @class */ (() => {
    let InteractionOptionsComponent = class InteractionOptionsComponent {
        constructor() {
            this.interactionConfig = new core_2.EventEmitter(); // The event emitter that outputs a new InteractionConfig whenever 
            this.WeightResizeType = types_1.WeightResizeType;
            this.PumpType = types_1.PumpType;
            this.SortAlternativesType = types_1.SortAlternativesType;
        }
        // Whether or the not preference modifying interactions will be permitted. These interactions include:
        //	- The pump tool; - resizing weights by dragging; - adjusting score functions by dragging; 
        set setType(interactive) {
            this.interactive = interactive;
            this.config = {
                weightResizeType: this.interactive ? types_1.WeightResizeType.Neighbors : types_1.WeightResizeType.None,
                reorderObjectives: false,
                sortAlternatives: types_1.SortAlternativesType.None,
                pumpWeights: types_1.PumpType.None,
                setObjectiveColors: false,
                adjustScoreFunctions: this.interactive
            };
            this.updateInteractionConfig(this.config);
        }
        ;
        ngOnInit() {
            this.config = {
                weightResizeType: this.interactive ? types_1.WeightResizeType.Neighbors : types_1.WeightResizeType.None,
                reorderObjectives: false,
                sortAlternatives: types_1.SortAlternativesType.None,
                pumpWeights: types_1.PumpType.None,
                setObjectiveColors: false,
                adjustScoreFunctions: this.interactive
            };
            this.updateInteractionConfig(this.config);
        }
        updateInteractionConfig(configObject) {
            this.interactionConfig.emit(configObject);
        }
        // ================================ Handlers for User Interaction Controls ====================================
        setWeightResizeType(resizeType) {
            this.config.weightResizeType = resizeType;
            this.updateInteractionConfig(this.config);
        }
        toggleReorderObjectives(newVal) {
            this.config.reorderObjectives = newVal;
            // Turn off all other interactions.
            this.config.sortAlternatives = types_1.SortAlternativesType.None;
            this.config.pumpWeights = types_1.PumpType.None;
            this.config.setObjectiveColors = false;
            this.updateInteractionConfig(this.config);
        }
        toggleSortAlternatives(sortType) {
            this.config.sortAlternatives = (this.config.sortAlternatives === sortType && (sortType === types_1.SortAlternativesType.ByObjectiveScore || sortType === types_1.SortAlternativesType.Manually)) ? types_1.SortAlternativesType.None : sortType;
            if (sortType === types_1.SortAlternativesType.Alphabetically || sortType === types_1.SortAlternativesType.Default) {
                window.setTimeout(() => {
                    this.config.sortAlternatives = types_1.SortAlternativesType.None;
                }, 10);
            }
            // Turn off all other interactions.
            this.config.pumpWeights = types_1.PumpType.None;
            this.config.reorderObjectives = false;
            this.config.setObjectiveColors = false;
            this.updateInteractionConfig(this.config);
        }
        setPumpType(pumpType) {
            this.config.pumpWeights = (this.config.pumpWeights === pumpType) ? types_1.PumpType.None : pumpType;
            // Turn off all other interactions.
            this.config.sortAlternatives = types_1.SortAlternativesType.None;
            this.config.reorderObjectives = false;
            this.config.setObjectiveColors = false;
            this.updateInteractionConfig(this.config);
        }
        toggleSetObjectiveColors(newVal) {
            this.config.setObjectiveColors = newVal;
            // Turn off all other interactions.
            this.config.sortAlternatives = types_1.SortAlternativesType.None;
            this.config.pumpWeights = types_1.PumpType.None;
            this.config.reorderObjectives = false;
            this.updateInteractionConfig(this.config);
        }
    };
    __decorate([
        core_1.Input('interactive'),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], InteractionOptionsComponent.prototype, "setType", null);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], InteractionOptionsComponent.prototype, "interactionConfig", void 0);
    InteractionOptionsComponent = __decorate([
        core_1.Component({
            selector: 'InteractionOptions',
            templateUrl: './InteractionOptions.template.html',
            providers: []
        })
    ], InteractionOptionsComponent);
    return InteractionOptionsComponent;
})();
exports.InteractionOptionsComponent = InteractionOptionsComponent;
//# sourceMappingURL=InteractionOptions.component.js.map