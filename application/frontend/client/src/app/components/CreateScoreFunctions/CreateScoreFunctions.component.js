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
exports.CreateScoreFunctionsComponent = void 0;
const core_1 = require("@angular/core");
const _ = require("lodash");
const Observable_1 = require("rxjs/Observable");
require("../../utilities/rxjs-operators");
// Import Application Classes:
const services_1 = require("../../services");
const services_2 = require("../../services");
const services_3 = require("../../services");
const services_4 = require("../../services");
const services_5 = require("../../services");
const services_6 = require("../../services");
const guards_1 = require("../../guards");
const ValueChartVis_1 = require("../../../ValueChartVis");
const ValueChartVis_2 = require("../../../ValueChartVis");
const model_1 = require("../../../model");
const model_2 = require("../../../model");
const model_3 = require("../../../model");
const model_4 = require("../../../model");
// Import Types:
const types_1 = require("../../../types");
const types_2 = require("../../../types");
/*
  This component defines the UI controls for defining the ScoreFunctions for a ValueChart.
  It uses the ScoreFunctionDirective to render the plots.
*/
let CreateScoreFunctionsComponent = /** @class */ (() => {
    let CreateScoreFunctionsComponent = class CreateScoreFunctionsComponent {
        // ========================================================================================
        //                   Constructor
        // ========================================================================================
        /*
          @returns {void}
          @description   Used for Angular's dependency injection ONLY. It should not be used to do any initialization of the class.
                  This constructor will be called automatically when Angular constructs an instance of this class prior to dependency injection.
        */
        constructor(valueChartService, creationStepsService, updateValueChartService, rendererScoreFunctionUtility, currentUserService, validationService, userNotificationService, userGuard) {
            this.valueChartService = valueChartService;
            this.creationStepsService = creationStepsService;
            this.updateValueChartService = updateValueChartService;
            this.rendererScoreFunctionUtility = rendererScoreFunctionUtility;
            this.currentUserService = currentUserService;
            this.validationService = validationService;
            this.userNotificationService = userNotificationService;
            this.userGuard = userGuard;
            // ========================================================================================
            //                   Fields
            // ========================================================================================
            this.ChartOrientation = types_1.ChartOrientation;
            this.ScoreFunction = model_3.ScoreFunction;
            this.services = {}; // Services container to pass to ScoreFunctionDirective
            // Validation fields:
            this.validationTriggered = false;
        }
        // ========================================================================================
        //                   Methods
        // ========================================================================================
        // ================================ Life-cycle Methods ====================================
        /*
          @returns {void}
          @description   Initializes CreateScoreFunctions. ngOnInit is only called ONCE by Angular.
                  Calling ngOnInit should be left to Angular. Do not call it manually.
        */
        ngOnInit() {
            this.creationStepsService.observables[this.creationStepsService.PREFERENCES] = new Observable_1.Observable((subscriber) => {
                subscriber.next(this.validate());
                subscriber.complete();
            });
            this.services.chartUndoRedoService = new ValueChartVis_1.ChartUndoRedoService();
            this.services.rendererScoreFunctionUtility = this.rendererScoreFunctionUtility;
            this.selectedObjective = this.valueChartService.getValueChart().getAllPrimitiveObjectives()[0].getName();
            this.creationStepsService.visitedScoreFunctions.push(this.selectedObjective);
            this.latestDefaults = {};
            // Initialize user
            let newUser = false;
            if (!this.valueChartService.getValueChart().isMember(this.currentUserService.getUsername())) {
                let user = new model_1.User(this.currentUserService.getUsername());
                user.setScoreFunctionMap(new model_2.ScoreFunctionMap());
                user.setWeightMap(new model_4.WeightMap());
                this.updateValueChartService.completeScoreFunctions(this.valueChartService.getValueChart().getAllPrimitiveObjectives(), user);
                this.valueChartService.getValueChart().setUser(user);
                newUser = true;
            }
            this.user = this.valueChartService.getValueChart().getUser(this.currentUserService.getUsername());
            // Record the current user object if no record exists yet.
            if (!this.userGuard.getUserRecord()) {
                this.userGuard.setUserRecord(_.cloneDeep(this.user));
            }
            // Initialize latest defaults and best/worst outcomes
            this.initialBestOutcomes = {};
            this.initialWorstOutcomes = {};
            for (let obj of this.valueChartService.getValueChart().getMutableObjectives()) {
                this.initialBestOutcomes[obj.getName()] = this.user.getScoreFunctionMap().getObjectiveScoreFunction(obj.getId()).bestElement;
                this.initialWorstOutcomes[obj.getName()] = this.user.getScoreFunctionMap().getObjectiveScoreFunction(obj.getId()).worstElement;
                this.latestDefaults[obj.getName()] = "default";
            }
            if (!newUser) {
                this.validate();
            }
        }
        /*
          @returns {void}
          @description   Destroys CreateScoreFunctions. ngOnDestroy is only called ONCE by Angular when the user navigates to a route which
                  requires that a different component is displayed in the router-outlet.
        */
        ngOnDestroy() {
            // Clear weight map if best or worst outcome has changed
            if (this.user.getWeightMap().getWeightTotal() > 0) {
                for (let obj of this.valueChartService.getValueChart().getMutableObjectives()) {
                    let newBestOutcome = this.user.getScoreFunctionMap().getObjectiveScoreFunction(obj.getId()).bestElement;
                    let newWorstOutcome = this.user.getScoreFunctionMap().getObjectiveScoreFunction(obj.getId()).worstElement;
                    if (newBestOutcome !== this.initialBestOutcomes[obj.getName()] || newWorstOutcome !== this.initialWorstOutcomes[obj.getName()]) {
                        this.userNotificationService.displayWarnings([this.updateValueChartService.BEST_WORST_OUTCOME_CHANGED]);
                        break;
                    }
                }
            }
        }
        // ================================ Default Function Selection Methods ====================================
        /*
          @returns {void}
          @description   Reinitializes the score function to the selected default.
                         (Currently called when user selects a new default from the dropdown or clicks 'Reset').
        */
        resetScoreFunction() {
            let obj = this.getObjectiveByName(this.selectedObjective);
            if (this.latestDefaults[this.selectedObjective] === 'default') {
                this.user.getScoreFunctionMap().getObjectiveScoreFunction(obj.getId()).setElementScoreMap(_.cloneDeep(obj.getDefaultScoreFunction().getElementScoreMap()));
            }
            else if (obj.getDomainType() === 'categorical' || obj.getDomainType() === 'interval') {
                let elements = obj.getDomain().getElements();
                this.user.getScoreFunctionMap().getObjectiveScoreFunction(obj.getId()).initialize(this.latestDefaults[this.selectedObjective], elements);
            }
            else {
                this.user.getScoreFunctionMap().getObjectiveScoreFunction(obj.getId()).initialize(this.latestDefaults[this.selectedObjective]);
            }
        }
        // ================================ Validation Methods ====================================
        /*
        @returns {boolean}
        @description   Checks validity of score functions.
      */
        validate() {
            this.validationTriggered = true;
            this.errorMessages = this.validationService.validateScoreFunctions(this.valueChartService.getValueChart(), this.user);
            return this.errorMessages.length === 0;
        }
        // ================================ Helper Methods ====================================
        /*
         @returns {void}
         @description   Resets error messages if validation has already been triggered.
                 (This is done whenever the user makes a change to the chart. This way, they get feedback while repairing errors.)
       */
        resetErrorMessages() {
            if (this.validationTriggered) {
                this.errorMessages = this.validationService.validateScoreFunctions(this.valueChartService.getValueChart(), this.user);
            }
        }
        getObjectiveByName(name) {
            for (let obj of this.valueChartService.getValueChart().getAllPrimitiveObjectives()) {
                if (obj.getName() === name) {
                    return obj;
                }
            }
            throw "Objective not found";
        }
        getScoreFunctionForObjective(objName) {
            return this.user.getScoreFunctionMap().getObjectiveScoreFunction(this.getObjectiveByName(objName).getId());
        }
        // Apply unvisited styles to objective in select list if it is mutable, has not been visisted yet, 
        // and the user is creating a new chart or joining (i.e., it is their first time through)
        isUnvisited(objName) {
            return (!this.getScoreFunctionForObjective(objName).immutable && this.creationStepsService.visitedScoreFunctions.indexOf(objName) === -1
                && (this.creationStepsService.getCreationPurpose() === types_2.CreatePurpose.NewValueChart || this.creationStepsService.getCreationPurpose() === types_2.CreatePurpose.NewUser));
        }
    };
    CreateScoreFunctionsComponent = __decorate([
        core_1.Component({
            selector: 'CreateScoreFunctions',
            templateUrl: './CreateScoreFunctions.template.html',
            providers: [ValueChartVis_2.RendererScoreFunctionUtility]
        }),
        __metadata("design:paramtypes", [services_3.ValueChartService,
            services_1.CreationStepsService,
            services_2.UpdateValueChartService,
            ValueChartVis_2.RendererScoreFunctionUtility,
            services_4.CurrentUserService,
            services_5.ValidationService,
            services_6.UserNotificationService,
            guards_1.UserGuard])
    ], CreateScoreFunctionsComponent);
    return CreateScoreFunctionsComponent;
})();
exports.CreateScoreFunctionsComponent = CreateScoreFunctionsComponent;
//# sourceMappingURL=CreateScoreFunctions.component.js.map