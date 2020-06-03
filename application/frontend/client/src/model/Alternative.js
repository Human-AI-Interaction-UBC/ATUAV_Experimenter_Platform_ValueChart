"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-05-25 16:41:41
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-08-16 16:58:49
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Alternative = void 0;
// Import Utility Classes:
const Formatter = require("../app/utilities/Formatter");
const _ = require("lodash");
/*
    This class is the data representation of a decision option in a ValueChart. It uses an internal map object to associate
    decision consequences with PrimitiveObjectives in the ValueChart. Each instance of the Alternative class must be a complete
    mapping of a consequence to each PrimitiveObjective in the ValueChart to be valid, and each consequence must be within the
    domain of the corresponding PrimitiveObjective. It is best to think about Alternatives as points in the consequence space
    defined by the ValueChart's set of PrimitiveObjectives.
*/
class Alternative {
    // ========================================================================================
    // 									Constructor
    // ========================================================================================
    /*
        @param name - The name of the Alternative.
        @param description - The description of the Alternative.
        @returns {void}
        @description	Constructs a new Alternative with no consequences. Objective consequences for the new
                        Alternative must he added manually using the setObjectiveValue method.
    */
    constructor(name, description) {
        this.name = name;
        this.description = description;
        this.objectiveValues = new Map();
        this.id = _.uniqueId(Formatter.nameToID(this.name) + '_');
    }
    // ========================================================================================
    // 									Methods
    // ========================================================================================
    getId() {
        return this.id;
    }
    getName() {
        return this.name;
    }
    setName(name) {
        this.name = name;
    }
    getDescription() {
        return this.description;
    }
    setDescription(description) {
        this.description = description;
    }
    getObjectiveValue(objectiveId) {
        return this.objectiveValues.get(objectiveId);
    }
    /*
        @returns {{ objectiveId: string, value: string | number }[]} - The collection of the Alternative's consequence paired with the associated objective's id.
        @description	Iterates over the objectiveValues to return an array of objective ids paired with the Alternative's
                        consequence for that objective.
    */
    getAllObjectiveValuePairs() {
        var objectiveValuePairs = [];
        var mapIterator = this.objectiveValues.keys();
        var iteratorElement = mapIterator.next();
        while (iteratorElement.done === false) {
            objectiveValuePairs.push({ objectiveId: iteratorElement.value, value: this.objectiveValues.get(iteratorElement.value) });
            iteratorElement = mapIterator.next();
        }
        return objectiveValuePairs;
    }
    getObjectiveKeys() {
        var objectiveKeys = [];
        var mapIterator = this.objectiveValues.keys();
        var iteratorElement = mapIterator.next();
        while (iteratorElement.done === false) {
            objectiveKeys.push(iteratorElement.value);
            iteratorElement = mapIterator.next();
        }
        return objectiveKeys;
    }
    setObjectiveValue(objectiveId, value) {
        this.objectiveValues.set(objectiveId, value);
    }
    removeObjective(objectiveId) {
        this.objectiveValues.delete(objectiveId);
    }
}
exports.Alternative = Alternative;
//# sourceMappingURL=Alternative.js.map