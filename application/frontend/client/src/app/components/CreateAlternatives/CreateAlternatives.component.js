"use strict";
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
exports.CreateAlternativesComponent = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
const Observable_1 = require("rxjs/Observable");
require("../../utilities/rxjs-operators");
// Import Application Classes:
const services_1 = require("../../services");
const services_2 = require("../../services");
const services_3 = require("../../services");
const Formatter = require("../../utilities/Formatter");
const model_1 = require("../../../model");
/*
    This component defines the UI controls for creating and editing the Alternatives of a ValueChart.
    It consists of an Angular table where each row is bound to an Alternative object in the ValueChart.
*/
let CreateAlternativesComponent = /** @class */ (() => {
    let CreateAlternativesComponent = class CreateAlternativesComponent {
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        /*
            @returns {void}
            @description 	Used for Angular's dependency injection ONLY. It should not be used to do any initialization of the class.
                            This constructor will be called automatically when Angular constructs an instance of this class prior to dependency injection.
        */
        constructor(valueChartService, creationStepsService, validationService) {
            this.valueChartService = valueChartService;
            this.creationStepsService = creationStepsService;
            this.validationService = validationService;
            // Validation fields:
            this.validationTriggered = false; // Specifies whether or not validation has been triggered (this happens when the user attempts to navigate)
        }
        // ========================================================================================
        // 									Methods
        // ========================================================================================
        // ================================ Life-cycle Methods ====================================
        /*
            @returns {void}
            @description 	Initializes CreateAlternatives. ngOnInit is only called ONCE by Angular.
                            Calling ngOnInit should be left to Angular. Do not call it manually.
        */
        ngOnInit() {
            this.creationStepsService.observables[this.creationStepsService.ALTERNATIVES] = new Observable_1.Observable((subscriber) => {
                subscriber.next(this.validate());
                subscriber.complete();
            });
            this.valueChart = this.valueChartService.getValueChart();
            this.alternatives = {};
            this.alternativesCount = 0;
            this.errorMessages = [];
            if (this.valueChart.getAlternatives().length > 0) {
                for (let alt of this.valueChart.getAlternatives()) {
                    this.alternatives[this.alternativesCount] = alt;
                    this.alternativesCount++;
                }
                this.validationTriggered = this.validate();
            }
        }
        /*
            @returns {void}
            @description   Destroys CreateAlternatives. ngOnDestroy is only called ONCE by Angular when the user navigates to a route which
                    requires that a different component is displayed in the router-outlet.
        */
        ngOnDestroy() {
            // Convert temporary structures to ValueChart structures
            let alternatives = [];
            for (let altID of this.altKeys()) {
                alternatives.push((this.alternatives[altID]));
            }
            this.valueChart.setAlternatives(alternatives);
        }
        // ================================ Alternatives Table Methods ====================================
        /*
            @returns {string}
            @description 	Returns text for Objective column header.
                            (Includes the range for continuous domain Objectives.)
        */
        getColumnHeader(obj) {
            if (obj.getDomainType() === 'continuous') {
                return obj.getName() + " (min: " + obj.getDomain().getMinValue() + ", max: " + obj.getDomain().getMaxValue() + ")";
            }
            else {
                return obj.getName();
            }
        }
        /*
            @returns {Array<string{}}
            @description 	Gets all Alternative IDs.
        */
        altKeys() {
            return Object.keys(this.alternatives);
        }
        /*
            @returns {Array<string{}}
            @description 	Gets all Alternative names.
        */
        getNames() {
            let names = [];
            for (let altID of this.altKeys()) {
                names.push(this.alternatives[altID].getName());
            }
            return names;
        }
        /*
            @returns {string[]}
            @description 	Gets all Alternative names in ID format. (Right now, it just removes whitespace.)
        */
        getFormattedNames() {
            return this.getNames().map(x => Formatter.nameToID(x));
        }
        /*
            @returns {void}
            @description 	Adds a new, blank Alternative to alternatives.
                            (This has the effect of inserting a new row.)
        */
        addEmptyAlternative() {
            this.alternatives[this.alternativesCount] = new model_1.Alternative("", "");
            this.alternativesCount++;
            this.resetErrorMessages();
        }
        /*
            @returns {void}
            @description 	Deletes an Alternative
        */
        deleteAlternative(altID) {
            delete this.alternatives[altID];
            this.resetErrorMessages();
        }
        /*
            @returns {number}
            @description 	Converts str to a number.
        */
        toNumber(str) {
            return Number(str);
        }
        // ================================ Validation Methods ====================================
        /*
            @returns {boolean}
            @description 	Checks validity of alternatives structure in the chart.
        */
        validate() {
            this.validationTriggered = true;
            this.setErrorMessages();
            return this.errorMessages.length === 0;
        }
        /*
            @returns {boolean}
            @description 	Converts ObjectiveRow structure into ValueChart objective, then validates the objective structure of the ValueChart.
        */
        setErrorMessages() {
            // Convert temporary structures to ValueChart structures
            let alternatives = [];
            for (let altID of this.altKeys()) {
                alternatives.push((this.alternatives[altID]));
            }
            this.valueChart.setAlternatives(alternatives);
            // Validate
            this.errorMessages = this.validationService.validateAlternatives(this.valueChart);
        }
        /*
            @returns {void}
            @description 	Resets error messages if validation has already been triggered.
                            (This is done whenever the user makes a change to the chart. This way, they get feedback while repairing errors.)
        */
        resetErrorMessages() {
            if (this.validationTriggered) {
                this.setErrorMessages();
            }
        }
    };
    CreateAlternativesComponent = __decorate([
        core_1.Component({
            selector: 'CreateAlternatives',
            templateUrl: './CreateAlternatives.template.html',
        }),
        __metadata("design:paramtypes", [services_1.ValueChartService,
            services_2.CreationStepsService,
            services_3.ValidationService])
    ], CreateAlternativesComponent);
    return CreateAlternativesComponent;
})();
exports.CreateAlternativesComponent = CreateAlternativesComponent;
//# sourceMappingURL=CreateAlternatives.component.js.map