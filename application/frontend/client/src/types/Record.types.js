"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-06-28 13:24:52
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-05-19 11:41:23
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoreFunctionRecord = exports.ObjectivesRecord = exports.AlternativesRecord = void 0;
// Import Libraries:
const _ = require("lodash");
class AlternativesRecord {
    constructor(alternatives) {
        this.alternatives = _.cloneDeep(alternatives);
    }
    getMemento() {
        return new AlternativesRecord(this.alternatives);
    }
}
exports.AlternativesRecord = AlternativesRecord;
class ObjectivesRecord {
    constructor(rootObjectives) {
        this.rootObjectives = [];
        rootObjectives.forEach((objective) => {
            this.rootObjectives.push(objective.getMemento());
        });
    }
    getMemento() {
        return new ObjectivesRecord(this.rootObjectives);
    }
}
exports.ObjectivesRecord = ObjectivesRecord;
class ScoreFunctionRecord {
    constructor(objectiveId, scoreFunction) {
        this.objectiveId = objectiveId;
        this.scoreFunction = scoreFunction.getMemento();
    }
    getMemento() {
        return new ScoreFunctionRecord(this.objectiveId, this.scoreFunction);
    }
}
exports.ScoreFunctionRecord = ScoreFunctionRecord;
//# sourceMappingURL=Record.types.js.map