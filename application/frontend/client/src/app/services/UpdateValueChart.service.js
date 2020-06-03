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
exports.UpdateValueChartService = void 0;
const core_1 = require("@angular/core");
const _ = require("lodash");
/*
    This class provides two types of methods:
        1. Check for differences between an old and new chart structure and generate messages describing these changes.
           (These are used to notify users of changes to the chart when it is updated by the creator.)
        2. Update the ValueChart alternatives and preferences to align with the objectives.
*/
let UpdateValueChartService = /** @class */ (() => {
    let UpdateValueChartService = class UpdateValueChartService {
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        /*
            @returns {void}
            @description 	Used for Angular's dependency injection ONLY. It should not be used to do any initialization of the class.
                            This constructor will be called automatically when Angular constructs an instance of this class prior to dependency injection.
        */
        constructor() {
            // ========================================================================================
            // 									Fields
            // ========================================================================================
            this.CREATOR_CHANGED = "The ValueChart owner has been changed to: ";
            this.DESCRIPTION_CHANGED = "The ValueChart's description has been changed to: ";
            this.NAME_CHANGED = "The ValueChart's name has been changed to: ";
            this.PASSWORD_CHANGED = "The ValueChart's password has been changed to: ";
            this.TYPE_CHANGED = "The type of the ValueChart has been changed to: ";
            this.ALTERNATIVE_ADDED = "A new alternative has been added to the ValueChart: ";
            this.ALTERNATIVE_REMOVED = "An alternative has been removed from the ValueChart: ";
            this.ALTERNATIVE_CHANGED = "An existing alternative has been modified: ";
            this.ALTERNATIVES_REORDERED = "The alternatives have been reordered.";
            this.OBJECTIVE_ADDED = "A new objective has been added to the ValueChart: ";
            this.OBJECTIVE_REMOVED = "An objective has been removed from the ValueChart: ";
            this.OBJECTIVE_CHANGED = "An existing objective has been modified: ";
            this.OBJECTIVES_REORDERED = "The objectives have been reordered.";
            this.BEST_WORST_OUTCOME_CHANGED = "The best/worst outcomes on some Objectives have changed. You may want to revisit your weights.";
            this.SCORE_FUNCTIONS_RESET = "Your score functions for the following Objectives have been reset to default: ";
            this.NEW_SCORE_FUNCTION_ELEMENTS = "New elements have been added to your score functions for the following Objectives: ";
            this.NEW_OBJECTIVE_WEIGHTS = "The following Objectives have been added to your chart with weight 0: ";
        }
        // ========================================================================================
        // 									Methods
        // ========================================================================================
        getValueChartChanges(oldStructure, newStructure) {
            var changeList = [];
            changeList = changeList.concat(this.getBasicDetailsChanges(oldStructure, newStructure));
            changeList = changeList.concat(this.getObjectivesChanges(oldStructure, newStructure));
            changeList = changeList.concat(this.getAlternativesChanges(oldStructure, newStructure));
            return changeList;
        }
        getBasicDetailsChanges(oldStructure, newStructure) {
            var changeList = [];
            if (oldStructure.getCreator() !== newStructure.getCreator()) {
                oldStructure.setCreator(newStructure.getCreator());
                changeList.push(this.CREATOR_CHANGED + newStructure.getCreator());
            }
            if (oldStructure.getDescription() !== newStructure.getDescription()) {
                oldStructure.setDescription(newStructure.getDescription());
                changeList.push(this.DESCRIPTION_CHANGED + newStructure.getDescription());
            }
            if (oldStructure.getName() !== newStructure.getName()) {
                oldStructure.setName(newStructure.getName());
                changeList.push(this.NAME_CHANGED + newStructure.getName());
            }
            if (oldStructure.getType() !== newStructure.getType()) {
                oldStructure.setType(newStructure.getType());
                changeList.push(this.TYPE_CHANGED + newStructure.getType());
            }
            if (oldStructure.password !== newStructure.password) {
                oldStructure.password = newStructure.password;
                changeList.push(this.PASSWORD_CHANGED + newStructure.password);
            }
            oldStructure._id = newStructure._id;
            return changeList;
        }
        getObjectivesChanges(oldStructure, newStructure) {
            var changeList = [];
            var newObjectives = newStructure.getAllObjectives();
            var oldObjectives = oldStructure.getAllObjectives();
            // Get all objectives in newStructure that are different from those in oldStructure. 
            var differences = _.differenceWith(newObjectives, oldObjectives, this.compareObjectives);
            differences.forEach((objective) => {
                let oldIndex = _.findIndex(oldObjectives, ['id', objective.getId()]);
                if (oldIndex === -1) { // Was the objective in the old structure?
                    changeList.push(this.OBJECTIVE_ADDED + objective.getName());
                }
                else {
                    changeList.push(this.OBJECTIVE_CHANGED + objective.getName());
                }
            });
            // Get all objectives in the oldStructure that are not in the new structure (by the 'id' property).
            var deletedObjectives = _.differenceBy(oldObjectives, newObjectives, 'id');
            deletedObjectives.forEach((objective) => {
                changeList.push(this.OBJECTIVE_REMOVED + objective.getName());
            });
            if (differences.length == 0 && deletedObjectives.length == 0 && !_.isEqual(newObjectives, oldObjectives))
                changeList.push(this.OBJECTIVES_REORDERED);
            oldStructure.setRootObjectives(newStructure.getRootObjectives());
            return changeList;
        }
        getAlternativesChanges(oldStructure, newStructure) {
            var changeList = [];
            var newAlternatives = newStructure.getAlternatives();
            var oldAlternatives = oldStructure.getAlternatives();
            // Get all alternatives in newStructure that are different from those in oldStructure. 
            var differences = _.differenceWith(newAlternatives, oldAlternatives, this.compareAlternatives);
            differences.forEach((alternative) => {
                if (_.findIndex(oldAlternatives, ['id', alternative.getId()]) === -1) // Was the alternative in the old structure?
                    changeList.push(this.ALTERNATIVE_ADDED + alternative.getName());
                else
                    changeList.push(this.ALTERNATIVE_CHANGED + alternative.getName());
            });
            // Get all alternatives in the oldStructure that are not in the new structure (by the 'id' property).
            var deletedAlternatives = _.differenceBy(oldAlternatives, newAlternatives, 'id');
            deletedAlternatives.forEach((alternative) => {
                changeList.push(this.ALTERNATIVE_REMOVED + alternative.getName());
            });
            if (differences.length == 0 && deletedAlternatives.length == 0 && !_.isEqual(newAlternatives.map(alt => alt.getId()), oldAlternatives.map(alt => alt.getId())))
                changeList.push(this.ALTERNATIVES_REORDERED);
            oldStructure.setAlternatives(newStructure.getAlternatives());
            return changeList;
        }
        compareObjectives(a, b) {
            if (a.objectiveType === 'primitive' || b.objectiveType === 'primitive')
                return _.isEqual(a, b);
            else {
                let aCopy = _.clone(a);
                let bCopy = _.clone(b);
                aCopy.setDirectSubObjectives([]);
                bCopy.setDirectSubObjectives([]);
                return _.isEqual(aCopy, bCopy); // Check if the immediate properties are the same.
            }
        }
        compareAlternatives(a, b) {
            let aCopy = _.cloneDeep(a);
            let bCopy = _.cloneDeep(b);
            let differentKeys = _.xor(a.getObjectiveKeys(), b.getObjectiveKeys());
            // Ignore new or removed values due to new or removed objectives.
            differentKeys.forEach((key) => {
                aCopy.setObjectiveValue(key, null);
                bCopy.setObjectiveValue(key, null);
            });
            return _.isEqual(aCopy, bCopy);
        }
        // ================================ Clean-up Alternatives ====================================
        /*
            @returns {string[]}
            @description 	Repairs alternatives to align with the Objectives in the chart.
        */
        cleanUpAlternatives(valueChart) {
            let primitiveObjectives = valueChart.getAllPrimitiveObjectives();
            let alternatives = valueChart.getAlternatives();
            this.removeAlternativeEntries(primitiveObjectives, alternatives);
            this.cleanAlternativeValues(primitiveObjectives, alternatives);
        }
        /*
            @returns {void}
            @description 	 Removes Alternative entries for Objectives that are not in the chart.
        */
        removeAlternativeEntries(primitiveObjectives, alternatives) {
            let objIds = primitiveObjectives.map((objective) => { return objective.getId(); });
            for (let alt of alternatives) {
                for (let key of alt.getObjectiveKeys()) {
                    if (objIds.indexOf(key) === -1) {
                        alt.removeObjective(key);
                    }
                }
            }
        }
        /*
            @returns {void}
            @description 	 Checks each Alternative's outcome on each Objective.
                             (1) Clears if no longer in range.
                             (2) Converts to type to number for continuous domain and string otherwise (this is needed in case the domain type was changed).
        */
        cleanAlternativeValues(primitiveObjectives, alternatives) {
            for (let obj of primitiveObjectives) {
                for (let alt of alternatives) {
                    if (obj.getDomainType() === "continuous") {
                        let dom = obj.getDomain();
                        let altVal = Number(alt.getObjectiveValue(obj.getId()));
                        if (isNaN(altVal) || altVal < dom.getMinValue() || altVal > dom.getMaxValue()) {
                            alt.removeObjective(obj.getId());
                        }
                        else {
                            alt.setObjectiveValue(obj.getId(), altVal);
                        }
                    }
                    else {
                        let altVal = String(alt.getObjectiveValue(obj.getId()));
                        if (obj.getDomain().getElements().indexOf(altVal) === -1) {
                            alt.removeObjective(obj.getId());
                        }
                        else {
                            alt.setObjectiveValue(obj.getId(), altVal);
                        }
                    }
                }
            }
        }
        // ================================ Clean-up Preferences ====================================
        /*
            @returns {string[]}
            @description 	Removes all elements from the user's preference model that should not be there.
                            This includes score functions and weights for non-existent Objectives and scores for non-existent domain elements.
                            Resets score functions if any of the following have changed: domain type, min, max, interval.
        */
        cleanUpUserPreferences(valueChart, user) {
            let warnings = [];
            let primitiveObjectives = valueChart.getAllPrimitiveObjectives();
            let resetScoreFunctions = [];
            let bestWorstChanged = false;
            this.removeScoreFunctions(primitiveObjectives, user);
            this.removeWeights(primitiveObjectives, user);
            for (let obj of valueChart.getAllPrimitiveObjectives()) {
                if (user.getScoreFunctionMap().getObjectiveScoreFunction(obj.getId())) {
                    let scoreFunction = user.getScoreFunctionMap().getObjectiveScoreFunction(obj.getId());
                    // Reset score functions in any of the following cases:
                    //	(1) Domain type was changed from categorical/interval to continuous
                    //	(2) Domain type was changed from  continuous to categorical/interval
                    //	(3)	Domain type is continuous and max or min was changed
                    // It may be possible to do something more clever in the future that preserves parts of the previous score function
                    if (obj.getDomainType() === 'continuous' || scoreFunction.type === 'continuous') {
                        if (!_.isEqual(scoreFunction.getAllElements(), obj.getDefaultScoreFunction().getAllElements())) {
                            user.getScoreFunctionMap().setObjectiveScoreFunction(obj.getId(), _.cloneDeep(obj.getDefaultScoreFunction()));
                            resetScoreFunctions.push(obj.getName());
                        }
                    }
                    if (this.checkBestWorstChanged(scoreFunction, user.getScoreFunctionMap().getObjectiveScoreFunction(obj.getId()))) {
                        bestWorstChanged = true;
                    }
                }
            }
            if (resetScoreFunctions.length > 0) {
                warnings.push(this.SCORE_FUNCTIONS_RESET + resetScoreFunctions.join(", "));
            }
            // Only warn if some weights have already been set
            if (bestWorstChanged && user.getWeightMap().getWeightTotal() !== 0) {
                warnings.push((this.BEST_WORST_OUTCOME_CHANGED));
            }
            return warnings.concat(this.completePreferences(primitiveObjectives, user));
        }
        /*
            @returns {void}
            @description 	Removes score functions for Objectives that are not in the chart.
        */
        removeScoreFunctions(primitiveObjectives, user) {
            let objIds = primitiveObjectives.map((objective) => { return objective.getId(); });
            for (let key of user.getScoreFunctionMap().getAllScoreFunctionKeys()) {
                if (objIds.indexOf(key) === -1) {
                    user.getScoreFunctionMap().removeObjectiveScoreFunction(key);
                }
            }
        }
        /*
            @returns {void}
            @description 	Removes weights for Objectives that are not in the chart.
        */
        removeWeights(primitiveObjectives, user) {
            let objIds = primitiveObjectives.map((objective) => { return objective.getId(); });
            let error = 1e-8 * primitiveObjectives.length;
            let renormalize = user.getWeightMap().getWeightTotal() > 1 - error && user.getWeightMap().getWeightTotal() < 1 + error;
            let elementIterator = user.getWeightMap().getInternalWeightMap().keys();
            let iteratorElement = elementIterator.next();
            let size = 0;
            while (iteratorElement.done === false) {
                if (objIds.indexOf(iteratorElement.value) === -1) {
                    user.getWeightMap().removeObjectiveWeight(iteratorElement.value);
                }
                iteratorElement = elementIterator.next();
                size++;
            }
            if (renormalize) {
                user.getWeightMap().normalize();
            }
        }
        /*
            @returns {booleain}
            @description 	Checks if the best/worst elements of oldScoreFunction are the same as those of the current score function.
                            Returns true iff they have changed.
        */
        checkBestWorstChanged(oldScoreFunction, newScoreFunction) {
            return (oldScoreFunction.bestElement !== newScoreFunction.bestElement || oldScoreFunction.worstElement !== newScoreFunction.worstElement);
        }
        // ================================ Complete Preferences ====================================
        /*
            @returns {string[]}
            @description 	Adds missing elements to the user's preference model.
                            This includes score functions and weights for all Objectives and scores for all domain elements.
        */
        completePreferences(primitiveObjectives, user) {
            let warnings = [];
            warnings = warnings.concat(this.completeScoreFunctions(primitiveObjectives, user));
            // Only insert missing weights if all weights are already set
            let error = 1e-8 * primitiveObjectives.length;
            if (user.getWeightMap().getWeightTotal() > 1 - error && user.getWeightMap().getWeightTotal() < 1 + error) {
                warnings = warnings.concat(this.completeWeights(primitiveObjectives, user));
            }
            return warnings;
        }
        /*
            @returns {string[]}
            @description 	Initializes and completes user's score functions to align with the Objectives in the chart.
        */
        completeScoreFunctions(primitiveObjectives, user) {
            let warnings = [];
            let completed = [];
            let reset = [];
            for (let obj of primitiveObjectives) {
                // Make sure there is a score function for every Objective (initialized to default)
                if (!user.getScoreFunctionMap().getObjectiveScoreFunction(obj.getId())) {
                    user.getScoreFunctionMap().setObjectiveScoreFunction(obj.getId(), _.cloneDeep(obj.getDefaultScoreFunction()));
                }
                // Set immutable score functions to be an exact replica of the default
                else if (obj.getDefaultScoreFunction().immutable
                    && !_.isEqual(user.getScoreFunctionMap().getObjectiveScoreFunction(obj.getId()), obj.getDefaultScoreFunction())) {
                    user.getScoreFunctionMap().setObjectiveScoreFunction(obj.getId(), _.cloneDeep(obj.getDefaultScoreFunction()));
                    reset.push(obj.getName());
                }
                else {
                    let scoreFunction = user.getScoreFunctionMap().getObjectiveScoreFunction(obj.getId());
                    // Make sure score functions are complete
                    if (this.updateScoreFunctionElements(obj.getDefaultScoreFunction(), scoreFunction)) {
                        completed.push(obj.getName());
                    }
                }
            }
            if (reset.length > 0) {
                warnings.push(this.SCORE_FUNCTIONS_RESET + reset.join(", "));
            }
            if (completed.length > 0) {
                warnings.push(this.NEW_SCORE_FUNCTION_ELEMENTS + completed.join(", "));
            }
            return warnings;
        }
        /*
            @returns {boolean}
            @description 	Updates the score function elements to be identical to the default score function elements (including order).
                            Returns true iff new elements were inserted.
        */
        updateScoreFunctionElements(defaultScoreFunction, scoreFunction) {
            let completed = false;
            let elementScoreMap = new Map();
            let elements = defaultScoreFunction.getAllElements();
            for (let elt of elements) {
                if (scoreFunction.getScore(elt) === undefined) {
                    elementScoreMap.set(elt, defaultScoreFunction.getScore(elt));
                    completed = true;
                }
                else {
                    elementScoreMap.set(elt, scoreFunction.getScore(elt));
                }
            }
            scoreFunction.setElementScoreMap(elementScoreMap);
            return completed;
        }
        /*
            @returns {string[]}
            @description 	Inserts missing Objective weights, initialized to 0
        */
        completeWeights(primitiveObjectives, user) {
            let warnings = [];
            let addedWeights = [];
            for (let obj of primitiveObjectives) {
                if (user.getWeightMap().getObjectiveWeight(obj.getId()) === undefined) {
                    user.getWeightMap().setObjectiveWeight(obj.getId(), 0.0);
                    addedWeights.push(obj.getName());
                }
            }
            if (addedWeights.length > 0) {
                warnings.push(this.NEW_OBJECTIVE_WEIGHTS + addedWeights.join(", "));
            }
            return warnings;
        }
    };
    UpdateValueChartService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [])
    ], UpdateValueChartService);
    return UpdateValueChartService;
})();
exports.UpdateValueChartService = UpdateValueChartService;
//# sourceMappingURL=UpdateValueChart.service.js.map