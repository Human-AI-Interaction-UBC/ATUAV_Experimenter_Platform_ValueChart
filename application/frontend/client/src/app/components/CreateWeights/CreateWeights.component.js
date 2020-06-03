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
exports.CreateWeightsComponent = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
const Observable_1 = require("rxjs/Observable");
require("../../utilities/rxjs-operators");
// Import Application Classes:
const services_1 = require("../../services");
const services_2 = require("../../services");
const services_3 = require("../../services");
const services_4 = require("../../services");
const services_5 = require("../../services");
const model_1 = require("../../../model");
const model_2 = require("../../../model");
const model_3 = require("../../../model");
/*
  This component defines the UI for eliciting weights with SMARTER.
  It consists of two tables: one that shows the worst/best outcomes for each unranked Objective,
                             and another that lists the currently ranked Objectives in order of rank.
*/
let CreateWeightsComponent = /** @class */ (() => {
    let CreateWeightsComponent = class CreateWeightsComponent {
        // ========================================================================================
        //                   Constructor
        // ========================================================================================
        /*
        @returns {void}
        @description   Used for Angular's dependency injection ONLY. It should not be used to do any initialization of the class.
                This constructor will be called automatically when Angular constructs an instance of this class prior to dependency injection.
        */
        constructor(currentUserService, valueChartService, creationStepsService, validationService, updateValueChartService) {
            this.currentUserService = currentUserService;
            this.valueChartService = valueChartService;
            this.creationStepsService = creationStepsService;
            this.validationService = validationService;
            this.updateValueChartService = updateValueChartService;
            this.updateWeights = false; // Indicates whether or not the weights should be computed and set on validate or destroy.
            // True if user changes weights in any way (clicking on a row or clicking "Reset Weights").
            // This is to ensure that previously-made adjustments to weights are preserved.
            // Validation fields:
            this.validationTriggered = false;
        }
        // ========================================================================================
        // 									Methods
        // ========================================================================================
        // ================================ Life-cycle Methods ====================================
        /*
            @returns {void}
            @description 	Initializes CreateWeights. ngOnInit is only called ONCE by Angular.
                            Calling ngOnInit should be left to Angular. Do not call it manually.
        */
        ngOnInit() {
            this.creationStepsService.observables[this.creationStepsService.PRIORITIES] = new Observable_1.Observable((subscriber) => {
                subscriber.next(this.validate());
                subscriber.complete();
            });
            this.rankedObjectives = [];
            this.isRanked = {};
            // Initialize user
            let newUser = false;
            if (!this.valueChartService.getValueChart().isMember(this.currentUserService.getUsername())) {
                let user = new model_1.User(this.currentUserService.getUsername());
                user.setScoreFunctionMap(new model_3.ScoreFunctionMap());
                user.setWeightMap(new model_2.WeightMap());
                this.updateValueChartService.completeScoreFunctions(this.valueChartService.getValueChart().getAllPrimitiveObjectives(), user);
                this.valueChartService.getValueChart().setUser(user);
            }
            this.user = this.valueChartService.getValueChart().getUser(this.currentUserService.getUsername());
            // If weight map is empty, set all Objectives to unranked
            if (this.user.getWeightMap().getWeightTotal() === 0) {
                for (let obj of this.valueChartService.getValueChart().getAllPrimitiveObjectives()) {
                    this.isRanked[obj.getId()] = false;
                }
            }
            // Weights have already been set by the user
            else {
                let objectives = this.valueChartService.getValueChart().getAllPrimitiveObjectives();
                let weights = this.user.getWeightMap().getObjectiveWeights(objectives);
                let pairs = objectives.map(function (e, i) { return [objectives[i], weights[i]]; });
                let sortedPairs = pairs.sort(this.compareObjectivesByWeight);
                for (let pair of sortedPairs) {
                    if (pair[1] === undefined) {
                        this.isRanked[pair[0].getId()] = false;
                    }
                    else {
                        this.rankObjective(pair[0], false);
                    }
                }
                this.validate();
            }
        }
        /*
            @returns {void}
            @description   Destroys CreateWeights. ngOnDestroy is only called ONCE by Angular when the user navigates to a route which
                    requires that a different component is displayed in the router-outlet.
        */
        ngOnDestroy() {
            // Update weight map
            if (this.updateWeights) {
                this.user.setWeightMap(this.getWeightMapFromRanks());
            }
        }
        // ================================ SMARTER Methods ====================================
        /*
            @returns {string}
            @description 	Returns instruction text based on current stage of ranking.
        */
        getPrioritiesText() {
            if (this.rankedObjectives.length === 0) {
                return "Imagine the worst case scenario highlighted in red. Click on the objective you would most prefer to change from the worst to the best based on the values in the table below.";
            }
            else if (this.rankedObjectives.length < this.valueChartService.getValueChart().getAllPrimitiveObjectives().length) {
                return "From the remaining objectives, which would you prefer to change next from the worst value to the best value?";
            }
            else {
                return "All done! Click 'View Chart' to proceed.";
            }
        }
        /*
            @returns {number}
            @description 	Comparator function for Objective weights.
                            Returns 1 if the first is ranked above the second, 0 if they are ranked the same (should never happen), and -1 otherwise.
                            This is used to sort the ranked Objectives table.
        */
        compareObjectivesByWeight(pair1, pair2) {
            if (pair1[1] < pair2[1]) {
                return 1;
            }
            else if (pair1[1] === pair2[1]) {
                return 0;
            }
            else {
                return -1;
            }
        }
        /*
            @returns {string or number}
            @description 	Gets best Alternative outcome for Objective. Used to fill the Best Outcome column.
        */
        getBestOutcome(objId) {
            let bestOutcome;
            let bestOutcomeScore = 0;
            let scoreFunction = this.user.getScoreFunctionMap().getObjectiveScoreFunction(objId);
            for (let alt of this.valueChartService.getValueChart().getAlternatives()) {
                let outcome = alt.getObjectiveValue(objId);
                let outcomeScore = scoreFunction.getScore(outcome);
                if (outcomeScore > bestOutcomeScore) {
                    bestOutcome = outcome;
                    bestOutcomeScore = outcomeScore;
                }
            }
            if (bestOutcome === undefined) {
                bestOutcome = this.getWorstOutcome(objId);
            }
            return bestOutcome;
        }
        /*
            @returns {string or number}
            @description 	Gets worst Alternative outcome for Objective. Used to fill the Worst Outcome column.
        */
        getWorstOutcome(objId) {
            let worstOutcome;
            let worstOutcomeScore = 1;
            let scoreFunction = this.user.getScoreFunctionMap().getObjectiveScoreFunction(objId);
            for (let alt of this.valueChartService.getValueChart().getAlternatives()) {
                let outcome = alt.getObjectiveValue(objId);
                let outcomeScore = scoreFunction.getScore(outcome);
                if (outcomeScore < worstOutcomeScore) {
                    worstOutcome = outcome;
                    worstOutcomeScore = outcomeScore;
                }
            }
            if (worstOutcome === undefined) {
                worstOutcome = this.getBestOutcome(objId);
            }
            return worstOutcome;
        }
        /*
            @returns {string}
            @description 	Returns unit string to append to best/worst outcome.
        */
        getUnitString(obj) {
            if (obj.getDomainType() === 'continuous' && obj.getDomain().unit) {
                return " " + (obj.getDomain().unit);
            }
            return "";
        }
        /*
            @returns {PrimitiveObjective[]}
            @description 	Gets all PrimitiveObjectives that haven't been ranked.
        */
        getUnrankedObjectives() {
            let unrankedObjectives = [];
            for (let obj of this.valueChartService.getValueChart().getAllPrimitiveObjectives()) {
                if (!this.isRanked[obj.getId()]) {
                    unrankedObjectives.push(obj);
                }
            }
            return unrankedObjectives;
        }
        /*
            @returns {void}
            @description 	Ranks an Objective by adding it to rankedObjectives.
                            Its rank is its index in rankedObjectives.
                            Parameter 'clicked' indicates whether or not this was called by a user clicking on a row
        */
        rankObjective(obj, clicked) {
            this.rankedObjectives.push(obj);
            this.isRanked[obj.getId()] = true;
            if (clicked) {
                this.updateWeights = true;
            }
        }
        /*
            @returns {void}
            @description 	Clears current ranking and sets all Objectives to unranked.
        */
        resetRanks() {
            for (let obj of this.valueChartService.getValueChart().getAllPrimitiveObjectives()) {
                this.isRanked[obj.getId()] = false;
            }
            this.rankedObjectives = [];
            this.updateWeights = true;
        }
        // ================================ Ranks-to-Weights Methods ====================================
        /*
            @returns {WeightMap}
            @description 	Converts ranks to weights as described in Barron and Barret, 1996.
        */
        getWeightMapFromRanks() {
            let weights = new model_2.WeightMap();
            let rank = 1;
            let numObjectives = this.valueChartService.getValueChart().getAllPrimitiveObjectives().length;
            for (let obj of this.rankedObjectives) {
                let weight = this.computeSum(rank, numObjectives) / numObjectives;
                weights.setObjectiveWeight(obj.getId(), weight);
                rank++;
            }
            return weights;
        }
        /*
            @returns {WeightMap}
            @description 	Computes summation described in Barron and Barret, 1996.
        */
        computeSum(k, K) {
            let sum = 0.0;
            let i = k;
            while (i <= K) {
                sum += 1 / i;
                i++;
            }
            return sum;
        }
        // ================================ Validation Methods ====================================
        /*
            @returns {boolean}
            @description 	Checks validity of the weights.
        */
        validate() {
            this.validationTriggered = true;
            this.setErrorMessages();
            return this.errorMessages.length === 0;
        }
        /*
            @returns {boolean}
            @description 	Recomputes the weights based on the rankings, then validates the weights.
        */
        setErrorMessages() {
            // Update weight map
            if (this.updateWeights) {
                this.user.setWeightMap(this.getWeightMapFromRanks());
            }
            // Validate
            this.errorMessages = this.validationService.validateWeights(this.valueChartService.getValueChart(), this.user);
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
    CreateWeightsComponent = __decorate([
        core_1.Component({
            selector: 'CreateWeights',
            templateUrl: './CreateWeights.template.html',
        }),
        __metadata("design:paramtypes", [services_3.CurrentUserService,
            services_1.ValueChartService,
            services_2.CreationStepsService,
            services_4.ValidationService,
            services_5.UpdateValueChartService])
    ], CreateWeightsComponent);
    return CreateWeightsComponent;
})();
exports.CreateWeightsComponent = CreateWeightsComponent;
//# sourceMappingURL=CreateWeights.component.js.map