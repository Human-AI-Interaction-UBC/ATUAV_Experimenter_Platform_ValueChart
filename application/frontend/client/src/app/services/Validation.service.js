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
exports.ValidationService = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
// Import Application Classes:
const Formatter = require("../utilities/Formatter");
// Import Model Classes:
const model_1 = require("../../model");
/*
    This class validates a ValueChart object to ensure that the data adheres to certain rules.

    It assumes that all data model fields are defined.
    It is the job of parsers to check that all required fields are present (e.g. every PrimitiveObjective has a Domain).
*/
let ValidationService = /** @class */ (() => {
    let ValidationService = class ValidationService {
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
            // 									Fields
            // ========================================================================================
            // Move these?
            // Yes, these should be moved to their own file - aaron.
            this.NAME_MISSING = "Chart must have a name.";
            this.NAME_INVALID = "Chart name contains disallowed characters.";
            this.PASSWORD_MISSING = "Chart must have a password.";
            this.PASSWORD_INVALID = "Chart password may not contain spaces.";
            this.TYPE_INVALID = "Individual charts may only contain preferences for the creator.";
            this.NO_PRIMITIVE_OBJECTIVES = "The chart must have at least one basic Objective.";
            this.OBJECTIVE_NAMES_MISSING = "Every Objective must have a name.";
            this.OBJECTIVE_NAMES_NOT_UNIQUE = "Objective names must be unique.";
            this.OBJECTIVE_NAMES_INVALID = "The following Objective names contain disallowed characters: ";
            this.CHILDLESS_ABSTRACT_OBJECTIVE = "Every parent Objective must have at least one child. Please fix: ";
            this.CATEGORY_NAMES_INVALID = "Category names contain disallowed characters. Please change: ";
            this.TOO_FEW_CATEGORIES = "Categorical domains must have at least two categories. Please fix: ";
            this.CONT_DOMAIN_INCOMPLETE = "Continuous domains must have a min and a max. Please fix ";
            this.INTERVAL_DOMAIN_INCOMPLETE = "Interval domains must have a min, max, and interval. Please fix: ";
            this.RANGE_INVALID = "Min must be less than max. Please fix: ";
            this.INTERVAL_INVALID = "Interval must be a positive factor of max - min. Please fix: ";
            this.DEFAULT_SCORE_FUNCTION_INCOMPLETE = "Please complete default score function for: ";
            this.DEFAULT_SCORE_FUNCTION_RANGE_INVALID = "Fixed default score functions must range from 0 to 1.  Please fix score functions for: ";
            this.NO_ALTERNATIVES = "Chart must have at least one Alternative.";
            this.ALTERNATIVE_NAMES_MISSING = "Every Alternative must have a name.";
            this.ALTERNATIVE_NAMES_NOT_UNIQUE = "Alternative names must be unique.";
            this.ALTERNATIVE_NAMES_INVALID = "The following Alternative names contain disallowed characters: ";
            this.OBJECTIVE_OUTCOMES_MISSING = "Every Alternative must have an outcome on every Objective. Please supply: ";
            this.OBJECTIVE_OUTCOMES_INVALID = "Objective outcomes must fall within the specified range. Please fix: ";
            this.SCORE_FUNCTIONS_MISSING = "Please define a score function for: ";
            this.SCORE_FUNCTIONS_INCOMPLETE = "Please complete score function for: ";
            this.SCORE_FUNCTION_MIN_INVALID = "The worst outcome must have a score of 0. Please fix score functions for: ";
            this.SCORE_FUNCTION_MAX_INVALID = "The best outcome must have a score of 1. Please fix score functions for: ";
            this.WEIGHTS_MISSING = "Please supply weights for: ";
            this.WEIGHTS_SUM_INVALID = "Weights must sum to 1.";
            this.WEIGHTS_RANGE_INVALID = "Weights must be between 0 and 1. Please fix weights for: ";
            this.ALLOWED_CHARACTERS = "(Allowed: alphanumeric, spaces, underscores, hyphens, commas, and periods.)";
        }
        // ========================================================================================
        // 									Methods
        // ========================================================================================
        /*
            @returns {string[]}
            @description 	Validates the whole chart.
                            Returns a list of error messages.
        */
        validate(valueChart) {
            return this.validateStructure(valueChart).concat(this.validateUsers(valueChart));
        }
        // ================================ VALIDATE CHART STRUCTURE ====================================
        /*
            @returns {string[]}
            @description 	Validates the chart structure (basic info, objectives, and alternatives).
                            Returns a list of error messages.
        */
        validateStructure(valueChart) {
            return this.validateBasicInfo(valueChart).concat(this.validateObjectives(valueChart), this.validateAlternatives(valueChart));
        }
        // ================================ Validate Basic Info ====================================
        validateBasicInfo(valueChart) {
            let errorMessages = [];
            if (!this.hasName(valueChart)) {
                errorMessages.push(this.NAME_MISSING);
            }
            else if (!this.nameValid(valueChart)) {
                errorMessages.push(this.NAME_INVALID);
            }
            if (!this.hasPassword(valueChart)) {
                errorMessages.push(this.PASSWORD_MISSING);
            }
            else if (!this.passwordValid(valueChart)) {
                errorMessages.push(this.PASSWORD_INVALID);
            }
            if (!this.typeValid(valueChart)) {
                errorMessages.push(this.TYPE_INVALID);
            }
            return errorMessages;
        }
        /*
            @returns {boolean}
            @description 	Returns true iff the name is non-empty.
        */
        hasName(valueChart) {
            let regex = new RegExp("^[\\s\\w-,.]+$");
            return (valueChart.getName() !== undefined && valueChart.getName() !== "");
        }
        /*
            @returns {boolean}
            @description 	Returns true iff the name contains only alphanumeric characters, spaces, hyphens, and underscores.
        */
        nameValid(valueChart) {
            let regex = new RegExp("^[\\s\\w-,.]*$");
            return (valueChart.getName().search(regex) !== -1);
        }
        /*
            @returns {boolean}
            @description 	Returns true iff the password is non-empty.
        */
        hasPassword(valueChart) {
            let regex = new RegExp("^[\\s\\w-,.]+$");
            return (valueChart.password !== undefined && valueChart.password !== "");
        }
        /*
            @returns {boolean}
            @description 	Returns true iff the password contains no spaces.
        */
        passwordValid(valueChart) {
            let regex = new RegExp("^[^\\s]*$");
            return (valueChart.password.search(regex) !== -1);
        }
        /*
            @returns {boolean}
            @description 	Returns true iff the chart type is valid given the users.
        */
        typeValid(valueChart) {
            if (valueChart.getType() === model_1.ChartType.Individual) {
                let numUsers = valueChart.getUsers().length;
                if (numUsers > 1 || (numUsers === 1 && !valueChart.isMember(valueChart.getCreator()))) {
                    return false;
                }
            }
            return true;
        }
        // ================================ Validate Objectives ====================================
        validateObjectives(valueChart) {
            let errorMessages = [];
            if (!this.hasPrimitiveObjectives(valueChart)) {
                errorMessages.push(this.NO_PRIMITIVE_OBJECTIVES);
            }
            if (!this.allObjectivesHaveNames(valueChart)) {
                errorMessages.push(this.OBJECTIVE_NAMES_MISSING);
            }
            if (!this.allObjectiveNamesUnique(valueChart)) {
                errorMessages.push(this.OBJECTIVE_NAMES_NOT_UNIQUE);
            }
            let invalidNames = this.invalidObjectiveNames(valueChart);
            if (invalidNames.length > 0) {
                errorMessages.push(this.OBJECTIVE_NAMES_INVALID.concat(invalidNames.join(', ')));
            }
            let childless = this.childlessAbstractObjectives(valueChart);
            if (childless.length > 0) {
                errorMessages.push(this.CHILDLESS_ABSTRACT_OBJECTIVE.concat(childless.join(', ')));
            }
            let invalidCats = this.invalidCategoryNames(valueChart);
            if (invalidCats.length > 0) {
                errorMessages.push(this.CATEGORY_NAMES_INVALID.concat(invalidCats.join('; ')));
            }
            let tooFewCats = this.fewerThanTwoCategories(valueChart);
            if (tooFewCats.length > 0) {
                errorMessages.push(this.TOO_FEW_CATEGORIES.concat(tooFewCats.join(', ')));
            }
            let contIncomplete = this.continuousIncomplete(valueChart);
            if (contIncomplete.length > 0) {
                errorMessages.push(this.CONT_DOMAIN_INCOMPLETE.concat(contIncomplete.join(', ')));
            }
            let intervalIncomplete = this.intervalIncomplete(valueChart);
            if (intervalIncomplete.length > 0) {
                errorMessages.push(this.INTERVAL_DOMAIN_INCOMPLETE.concat(intervalIncomplete.join(', ')));
            }
            let rangeInvalid = this.rangeInvalid(valueChart);
            if (rangeInvalid.length > 0) {
                errorMessages.push(this.RANGE_INVALID.concat(rangeInvalid.join(', ')));
            }
            let intervalInvalid = this.intervalInvalid(valueChart);
            if (intervalInvalid.length > 0) {
                errorMessages.push(this.INTERVAL_INVALID.concat(intervalInvalid.join(', ')));
            }
            if (!valueChart.isIndividual()) {
                let defaultScoreFunctionIncomplete = this.defaultScoreFunctionIncomplete(valueChart);
                if (defaultScoreFunctionIncomplete.length > 0) {
                    errorMessages.push(this.DEFAULT_SCORE_FUNCTION_INCOMPLETE.concat(defaultScoreFunctionIncomplete.join(', ')));
                }
                let defaultScoreFunctionRangeInvalid = this.defaultScoreFunctionRangeInvalid(valueChart);
                if (defaultScoreFunctionRangeInvalid.length > 0) {
                    errorMessages.push(this.DEFAULT_SCORE_FUNCTION_RANGE_INVALID.concat(defaultScoreFunctionRangeInvalid.join(', ')));
                }
            }
            return errorMessages;
        }
        /*
            @returns {boolean}
            @description 	Returns true iff there is at least one primitive Objective.
        */
        hasPrimitiveObjectives(valueChart) {
            return valueChart.getAllPrimitiveObjectives().length > 0;
        }
        /*
            @returns {boolean}
            @description 	Returns true iff every Objective has a name that isn't the empty string.
        */
        allObjectivesHaveNames(valueChart) {
            return valueChart.getAllObjectives().map(obj => obj.getName()).indexOf("") === -1;
        }
        /*
            @returns {boolean}
            @description 	Returns true iff all Objective names are unique after converting to ID format.
        */
        allObjectiveNamesUnique(valueChart) {
            let formattedNames = valueChart.getAllObjectives().map(obj => obj.getName()).map(x => Formatter.nameToID(x));
            return formattedNames.length === (new Set(formattedNames).size);
        }
        /*
            @returns {string[]}
            @description 	Returns list of invalid Objective names.
                            (Names may only contain alphanumeric characters, spaces, hyphens, and underscores.)
        */
        invalidObjectiveNames(valueChart) {
            let objectives = [];
            let regex = new RegExp("^[\\s\\w-,.]*$");
            for (let name of valueChart.getAllObjectives().map(obj => obj.getName())) {
                if (name.search(regex) === -1) {
                    objectives.push(name);
                }
            }
            return objectives;
        }
        /*
            @returns {string[]}
            @description 	Returns the names of childless abstract Objectives.
        */
        childlessAbstractObjectives(valueChart) {
            let objectives = [];
            for (let obj of valueChart.getAllObjectives()) {
                if (obj.objectiveType === 'abstract' && obj.getAllSubObjectives().length < 1) {
                    objectives.push(obj.getName());
                }
            }
            return objectives;
        }
        /*
            @returns {string[]}
            @description 	Returns the names of Objectives with invalid category names.
        */
        invalidCategoryNames(valueChart) {
            let objectives = [];
            let regex = new RegExp("^[\\s\\w-,.]+$");
            for (let obj of valueChart.getAllPrimitiveObjectives()) {
                let cats = [];
                if (obj.getDomainType() === 'categorical') {
                    for (let category of obj.getDomain().getElements()) {
                        if (category.search(regex) === -1) {
                            cats.push(obj.getName());
                        }
                    }
                }
                if (cats.length > 0) {
                    objectives.push(obj.getName() + ": " + cats.join(', '));
                }
            }
            return objectives;
        }
        /*
            @returns {string[]}
            @description 	Returns the names of Objectives with fewer than two categories.
        */
        fewerThanTwoCategories(valueChart) {
            let objectives = [];
            for (let obj of valueChart.getAllPrimitiveObjectives()) {
                if (obj.getDomainType() === 'categorical' &&
                    obj.getDomain().getElements().length < 2) {
                    objectives.push(obj.getName());
                }
            }
            return objectives;
        }
        /*
            @returns {string[]}
            @description 	Returns the names of Objectives with incomplete continuous domains.
        */
        continuousIncomplete(valueChart) {
            let objectives = [];
            for (let obj of valueChart.getAllPrimitiveObjectives()) {
                if (obj.getDomainType() === 'continuous') {
                    let dom = obj.getDomain();
                    if (dom.getMaxValue() === undefined || dom.getMinValue() === undefined
                        || isNaN(dom.getMaxValue()) || isNaN(dom.getMinValue())) {
                        objectives.push(obj.getName());
                    }
                }
            }
            return objectives;
        }
        /*
            @returns {string[]}
            @description 	Returns the names of Objectives with incomplete interval domains.
        */
        intervalIncomplete(valueChart) {
            let objectives = [];
            for (let obj of valueChart.getAllPrimitiveObjectives()) {
                if (obj.getDomainType() === 'interval') {
                    let dom = obj.getDomain();
                    if (dom.getMaxValue() === undefined || dom.getMinValue() === undefined || dom.getInterval() === undefined
                        || isNaN(dom.getMaxValue()) || isNaN(dom.getMinValue()) || isNaN(dom.getInterval())) {
                        objectives.push(obj.getName());
                    }
                }
            }
            return objectives;
        }
        /*
            @returns {string[]}
            @description 	Returns the names of Objectives with invalid range (min must be less than max).
        */
        rangeInvalid(valueChart) {
            let objectives = [];
            for (let obj of valueChart.getAllPrimitiveObjectives()) {
                if (obj.getDomainType() === 'continuous' || obj.getDomainType() === 'interval') {
                    let dom = obj.getDomain();
                    if (dom.getMinValue() >= dom.getMaxValue()) {
                        objectives.push(obj.getName());
                    }
                }
            }
            return objectives;
        }
        /*
            @returns {string[]}
            @description 	Returns the names of Objectives with an invalid interval
                            (interval must be a positive factor of range).
        */
        intervalInvalid(valueChart) {
            let objectives = [];
            for (let obj of valueChart.getAllPrimitiveObjectives()) {
                if (obj.getDomainType() === 'interval') {
                    let dom = obj.getDomain();
                    if (dom.getInterval() <= 0 || (dom.getMaxValue() - dom.getMinValue()) % dom.getInterval() !== 0) {
                        objectives.push(obj.getName());
                    }
                }
            }
            return objectives;
        }
        /*
        @returns {string[]}
        @description 	Returns names of Objectives whose default score functions are not complete.
                        (i.e. they are missing scores for some domain elements).
    */
        defaultScoreFunctionIncomplete(valueChart) {
            let objectives = [];
            for (let obj of valueChart.getAllPrimitiveObjectives()) {
                if (obj.getDomainType() === 'categorical' || obj.getDomainType() === 'interval') {
                    let scoreFunction = obj.getDefaultScoreFunction();
                    let elements = [];
                    for (let elt of obj.getDomain().getElements()) {
                        if (scoreFunction.getScore(elt) === undefined) {
                            elements.push(elt);
                        }
                    }
                    if (elements.length > 0) {
                        objectives.push(obj.getName());
                    }
                }
            }
            return objectives;
        }
        /*
            @returns {string[]}
            @description 	Returns names of Objectives with immutable default score functions that do not range from 0 to 1.
        */
        defaultScoreFunctionRangeInvalid(valueChart) {
            let objectives = [];
            for (let obj of valueChart.getAllPrimitiveObjectives()) {
                if (obj.getDefaultScoreFunction().immutable) {
                    let scoreFunction = obj.getDefaultScoreFunction();
                    if (scoreFunction.getScore(scoreFunction.bestElement) !== 1 || scoreFunction.getScore(scoreFunction.worstElement) !== 0) {
                        objectives.push(obj.getName());
                    }
                }
            }
            return objectives;
        }
        // ================================ Validate Alternatives ====================================
        validateAlternatives(valueChart) {
            let errorMessages = [];
            if (!this.hasAlternatives(valueChart)) {
                errorMessages.push(this.NO_ALTERNATIVES);
            }
            if (!this.allAlternativesHaveNames(valueChart)) {
                errorMessages.push(this.ALTERNATIVE_NAMES_MISSING);
            }
            if (!this.allAlternativeNamesUnique(valueChart)) {
                errorMessages.push(this.ALTERNATIVE_NAMES_NOT_UNIQUE);
            }
            let invalidNames = this.invalidAlternativeNames(valueChart);
            if (invalidNames.length > 0) {
                errorMessages.push(this.ALTERNATIVE_NAMES_INVALID.concat(invalidNames.join(', ')));
            }
            let missingOutcomes = this.missingObjectiveOutcomes(valueChart);
            if (missingOutcomes.length > 0) {
                errorMessages.push(this.OBJECTIVE_OUTCOMES_MISSING.concat(missingOutcomes.join('; ')));
            }
            let invalidOutcomes = this.invalidOutcomes(valueChart);
            if (invalidOutcomes.length > 0) {
                errorMessages.push(this.OBJECTIVE_OUTCOMES_INVALID.concat(invalidOutcomes.join('; ')));
            }
            return errorMessages;
        }
        /*
            @returns {boolean}
            @description 	Returns true iff there is at least one Alternative.
        */
        hasAlternatives(valueChart) {
            return valueChart.getAlternatives().length > 0;
        }
        /*
            @returns {boolean}
            @description 	Returns true iff every Alternative has a name that isn't the empty string.
        */
        allAlternativesHaveNames(valueChart) {
            for (let alt of valueChart.getAlternatives()) {
                if (alt.getName() === "") {
                    return false;
                }
            }
            return true;
        }
        /*
            @returns {boolean}
            @description 	Returns true iff all Alternatives names are unique after converting to ID format.
        */
        allAlternativeNamesUnique(valueChart) {
            let alternatives = [];
            for (let alt of valueChart.getAlternatives()) {
                alternatives.push(alt.getName());
            }
            let formattedNames = alternatives.map(x => Formatter.nameToID(x));
            return formattedNames.length === (new Set(formattedNames)).size;
        }
        /*
            @returns {string[]}
            @description 	Returns list of invalid Alternative names.
                            (Names may only contain alphanumeric characters, spaces, hyphens, and underscores.)
        */
        invalidAlternativeNames(valueChart) {
            let alternatives = [];
            let regex = new RegExp("^[\\s\\w-,.]*$");
            for (let alt of valueChart.getAlternatives()) {
                if (alt.getName().search(regex) === -1) {
                    alternatives.push(alt.getName());
                }
            }
            return alternatives;
        }
        /*
            @returns {string[]}
            @description 	Returns names of Alternatives that are missing outcomes on at least one Objective.
        */
        missingObjectiveOutcomes(valueChart) {
            let alternatives = [];
            for (let alt of valueChart.getAlternatives()) {
                let objectives = [];
                for (let obj of valueChart.getAllPrimitiveObjectives()) {
                    if (alt.getObjectiveValue(obj.getId()) === undefined) {
                        objectives.push(obj.getName());
                    }
                }
                if (objectives.length > 0) {
                    alternatives.push(alt.getName() + ": " + objectives.join(', '));
                }
            }
            return alternatives;
        }
        /*
            @returns {string[]}
            @description 	Returns a list of formatted strings for each Alternative that has an invalid outcome on at least one Objective.
                            (Each string contains the Alternative name followed by a list of Objectives with invalid outcomes.)
        */
        invalidOutcomes(valueChart) {
            let alternatives = [];
            for (let alt of valueChart.getAlternatives()) {
                let objectives = [];
                for (let obj of valueChart.getAllPrimitiveObjectives()) {
                    let objValue = alt.getObjectiveValue(obj.getId());
                    if (objValue !== undefined) {
                        if (obj.getDomainType() === 'continuous') {
                            let dom = obj.getDomain();
                            if (objValue > dom.getMaxValue() || objValue < dom.getMinValue()) {
                                objectives.push(obj.getName());
                            }
                        }
                        else if (obj.getDomainType() === 'interval') {
                            let dom = obj.getDomain();
                            if (objValue > dom.getMaxValue() || objValue < dom.getMinValue()
                                || ((objValue - dom.getMinValue()) % dom.getInterval()) !== 0) {
                                objectives.push(obj.getName());
                            }
                        }
                        else if (obj.getDomainType() === 'categorical') {
                            let dom = obj.getDomain();
                            if (dom.getElements().indexOf(String(objValue)) === -1) {
                                objectives.push(obj.getName());
                            }
                        }
                    }
                }
                if (objectives.length > 0) {
                    alternatives.push(alt.getName() + ": " + objectives.join(', '));
                }
            }
            return alternatives;
        }
        // ================================ VALIDATE CHART USERS ====================================
        /*
            @returns {string[]}
            @description 	Validates the chart users.
                            Returns a list of error messages.
        */
        validateUsers(valueChart) {
            let errorMessages = [];
            let userErrorMessages = [];
            for (let user of valueChart.getUsers()) {
                userErrorMessages = this.validateUser(valueChart, user);
                if (userErrorMessages.length > 0) {
                    errorMessages.push(user.getUsername() + ":\n - " + userErrorMessages.join("\n - "));
                }
            }
            return errorMessages;
        }
        /*
            @returns {string[]}
            @description 	Validates a specified user in the chart.
                            Returns a list of error messages.
        */
        validateUser(valueChart, user) {
            return this.validateScoreFunctions(valueChart, user).concat(this.validateWeights(valueChart, user));
        }
        /*
            @returns {string[]}
            @description 	Returns the usernames of invalid users in the chart.
        */
        getInvalidUsers(valueChart) {
            let invalidUsers = [];
            for (let user of valueChart.getUsers()) {
                if (this.validateUser(valueChart, user).length > 0) {
                    invalidUsers.push(user.getUsername());
                }
            }
            return invalidUsers;
        }
        // ================================ Validate ScoreFunctions ====================================
        validateScoreFunctions(valueChart, user) {
            let errorMessages = [];
            let missingScoreFunctions = this.missingScoreFunctions(valueChart, user);
            if (missingScoreFunctions.length > 0) {
                errorMessages.push(this.SCORE_FUNCTIONS_MISSING.concat(missingScoreFunctions.join(', ')));
            }
            let incompleteScoreFunctions = this.incompleteScoreFunctions(valueChart, user);
            if (incompleteScoreFunctions.length > 0) {
                errorMessages.push(this.SCORE_FUNCTIONS_INCOMPLETE.concat(incompleteScoreFunctions.join(', ')));
            }
            let invalidScoreFunctionMinimum = this.invalidScoreFunctionMinimum(valueChart, user);
            if (invalidScoreFunctionMinimum.length > 0) {
                errorMessages.push(this.SCORE_FUNCTION_MIN_INVALID.concat(invalidScoreFunctionMinimum.join(', ')));
            }
            let invalidScoreFunctionMaximum = this.invalidScoreFunctionMaximum(valueChart, user);
            if (invalidScoreFunctionMaximum.length > 0) {
                errorMessages.push(this.SCORE_FUNCTION_MAX_INVALID.concat(invalidScoreFunctionMaximum.join(', ')));
            }
            return errorMessages;
        }
        /*
            @returns {string[]}
            @description 	Returns names of Objectives that are missing a score function for user.
        */
        missingScoreFunctions(valueChart, user) {
            let objectives = [];
            let scoreFunctionMap = user.getScoreFunctionMap();
            for (let obj of valueChart.getAllPrimitiveObjectives()) {
                if (scoreFunctionMap === undefined || scoreFunctionMap.getObjectiveScoreFunction(obj.getId()) === undefined) {
                    objectives.push(obj.getName());
                }
            }
            return objectives;
        }
        /*
            @returns {string[]}
            @description 	Returns names of Objectives whose score functions are not complete for user
                            (i.e. they are missing scores for some domain elements).
        */
        incompleteScoreFunctions(valueChart, user) {
            let objectives = [];
            let scoreFunctionMap = user.getScoreFunctionMap();
            if (scoreFunctionMap) {
                for (let obj of valueChart.getAllPrimitiveObjectives()) {
                    if (obj.getDomainType() === 'categorical' || obj.getDomainType() === 'interval') {
                        let scoreFunction = scoreFunctionMap.getObjectiveScoreFunction(obj.getId());
                        if (scoreFunction) {
                            let elements = [];
                            for (let elt of obj.getDomain().getElements()) {
                                if (scoreFunction.getScore(elt) === undefined) {
                                    elements.push(elt);
                                }
                            }
                            if (elements.length > 0) {
                                objectives.push(obj.getName());
                            }
                        }
                    }
                }
            }
            return objectives;
        }
        /*
            @returns {string[]}
            @description 	Returns names of Objectives whose score functions for user do not have a minimum score of 0.
        */
        invalidScoreFunctionMinimum(valueChart, user) {
            let objectives = [];
            let scoreFunctionMap = user.getScoreFunctionMap();
            if (scoreFunctionMap) {
                for (let obj of valueChart.getAllPrimitiveObjectives()) {
                    let scoreFunction = scoreFunctionMap.getObjectiveScoreFunction(obj.getId());
                    if (scoreFunction) {
                        if (scoreFunction.getScore(scoreFunction.worstElement) !== 0) {
                            objectives.push(obj.getName());
                        }
                    }
                }
            }
            return objectives;
        }
        /*
            @returns {string[]}
            @description 	Returns names of Objectives whose score functions for user do not have a maximum score of 1.
        */
        invalidScoreFunctionMaximum(valueChart, user) {
            let objectives = [];
            let scoreFunctionMap = user.getScoreFunctionMap();
            if (scoreFunctionMap) {
                for (let obj of valueChart.getAllPrimitiveObjectives()) {
                    let scoreFunction = scoreFunctionMap.getObjectiveScoreFunction(obj.getId());
                    if (scoreFunction) {
                        if (scoreFunction.getScore(scoreFunction.bestElement) !== 1) {
                            objectives.push(obj.getName());
                        }
                    }
                }
            }
            return objectives;
        }
        // ================================ Validate Weights ====================================
        validateWeights(valueChart, user) {
            let errorMessages = [];
            let missingWeights = this.missingWeights(valueChart, user);
            if (missingWeights.length > 0) {
                errorMessages.push(this.WEIGHTS_MISSING.concat(missingWeights.join('; ')));
            }
            let invalidWeightSum = this.invalidWeightSum(valueChart, user);
            if (invalidWeightSum) {
                errorMessages.push(this.WEIGHTS_SUM_INVALID);
            }
            let invalidWeightRange = this.invalidWeightRange(valueChart, user);
            if (invalidWeightRange.length > 0) {
                errorMessages.push(this.WEIGHTS_RANGE_INVALID.concat(invalidWeightRange.join('; ')));
            }
            return errorMessages;
        }
        /*
            @returns {string[]}
            @description 	Returns names of Objectives that are missing a weight for user.
        */
        missingWeights(valueChart, user) {
            let weightMap = user.getWeightMap();
            let objectives = [];
            for (let obj of valueChart.getAllPrimitiveObjectives()) {
                if (weightMap === undefined || weightMap.getObjectiveWeight(obj.getId()) === undefined) {
                    objectives.push(obj.getName());
                }
            }
            return objectives;
        }
        /*
            @returns {boolean}
            @description 	Returns true iff weights for user sum to 1 within margin of error.
        */
        invalidWeightSum(valueChart, user) {
            let error = 1e-8 * valueChart.getAllPrimitiveObjectives().length;
            let weightMap = user.getWeightMap();
            if (weightMap && (weightMap.getWeightTotal() < 1 - error || weightMap.getWeightTotal() > 1 + error)) {
                return true;
            }
            return false;
        }
        /*
            @returns {string[]}
            @description 	Returns names of Objectives that have invalid weights for user
                            (i.e. not between 0 and 1).
        */
        invalidWeightRange(valueChart, user) {
            let objectives = [];
            let weightMap = user.getWeightMap();
            if (weightMap) {
                for (let obj of valueChart.getAllPrimitiveObjectives()) {
                    if (weightMap.getObjectiveWeight(obj.getId()) < 0 || weightMap.getObjectiveWeight(obj.getId()) > 1) {
                        objectives.push(obj.getName());
                    }
                }
            }
            return objectives;
        }
    };
    ValidationService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [])
    ], ValidationService);
    return ValidationService;
})();
exports.ValidationService = ValidationService;
//# sourceMappingURL=Validation.service.js.map