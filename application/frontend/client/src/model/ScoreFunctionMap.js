"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-05-27 10:20:53
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2016-08-22 16:14:41
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoreFunctionMap = void 0;
/*
    This class is used to map a User's ScoreFunctions to their corresponding objectives. It is wrapper around the Map class that provides
    additional functionality for retrieving ScoreFucntions.
*/
class ScoreFunctionMap {
    // ========================================================================================
    // 									Constructor
    // ========================================================================================
    /*
        @returns {void}
        @description	Constructs a new ScoreFunctionmap. This constructor only initializes the internal map object of the ScoreFunctionMap.
                        ScoreFunctions must be mapped to objective names manually using the setObjectiveScoreFunction() method.
    */
    constructor() {
        this.scoreFunctions = new Map();
    }
    // ========================================================================================
    // 									Methods
    // ========================================================================================
    /*
        @returns {ScoreFunction[]} - An array of all the ScoreFunctions stored by the ScoreFunctionMap.
        @description	Retrieves all the ScoreFunctions stored within the ScoreFunctionMap by iterating over the internal map object.
    */
    getAllScoreFunctions() {
        var scoreFunctions = [];
        var scoreFunctionIterator = this.scoreFunctions.values();
        var iteratorElement = scoreFunctionIterator.next();
        while (iteratorElement.done === false) {
            scoreFunctions.push(iteratorElement.value);
            iteratorElement = scoreFunctionIterator.next();
        }
        return scoreFunctions;
    }
    /*
        @returns {ScoreFunction[]} - An array of all the ScoreFunctions stored by the ScoreFunctionMap with names of their corresponding objectives.
        @description	Retrieves all the ScoreFunctions along with their names of they objectives their are mapped to by iterating over the internal map object.
    */
    getAllKeyScoreFunctionPairs() {
        var scoreFunctionKeyPairs = [];
        var scoreFunctionIterator = this.scoreFunctions.keys();
        var iteratorElement = scoreFunctionIterator.next();
        while (iteratorElement.done === false) {
            scoreFunctionKeyPairs.push({ key: iteratorElement.value, scoreFunction: this.scoreFunctions.get(iteratorElement.value) });
            iteratorElement = scoreFunctionIterator.next();
        }
        return scoreFunctionKeyPairs;
    }
    getAllScoreFunctionKeys() {
        var keys = [];
        var scoreFunctionIterator = this.scoreFunctions.keys();
        var iteratorElement = scoreFunctionIterator.next();
        while (iteratorElement.done === false) {
            keys.push(iteratorElement.value);
            iteratorElement = scoreFunctionIterator.next();
        }
        return keys;
    }
    getObjectiveScoreFunction(objectiveId) {
        return this.scoreFunctions.get(objectiveId);
    }
    setObjectiveScoreFunction(objectiveId, ScoreFunction) {
        this.scoreFunctions.set(objectiveId, ScoreFunction);
    }
    removeObjectiveScoreFunction(objectiveId) {
        this.scoreFunctions.delete(objectiveId);
    }
}
exports.ScoreFunctionMap = ScoreFunctionMap;
//# sourceMappingURL=ScoreFunctionMap.js.map