"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-05-24 16:34:28
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-08-16 16:58:49
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrimitiveObjective = void 0;
const ScoreFunction_1 = require("./ScoreFunction");
const DiscreteScoreFunction_1 = require("./DiscreteScoreFunction");
const ContinuousScoreFunction_1 = require("./ContinuousScoreFunction");
// Import Utilities:
const Formatter = require("../app/utilities/Formatter");
const _ = require("lodash");
/*
    A PrimitiveObjective is a criteria used to evaluate Alternatives in a decision that cannot, or should not, be broken down
    into further criteria. This is why it is called primitive. PrimitiveObjectives are a key component of a ValueChart.
    They are assigned weights by users to rank their importance relative to other PrimitiveObjectives, and given user defined
    score functions (see ScoreFunction below), which assign scores to every element in the PrimitiveObjective's domain. A
    PrimitiveObjective's domain is the range of values that an Alternative may assign to that objective.
*/
class PrimitiveObjective {
    // ========================================================================================
    // 									Constructor
    // ========================================================================================
    /*
        @param name - The name of the PrimitiveObjective.
        @param description - The description of the PrimitiveObjective.
        @returns {void}
        @description	Constructs a new PrimitiveObjective. This constructor only initializes the basic fields of the PrimitiveObjective.
                        A domain must be assigned separately using the getDomain method. The same goes for a color.
    */
    constructor(name, description) {
        this.name = name;
        this.description = description;
        this.objectiveType = 'primitive';
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
    getColor() {
        return this.color;
    }
    setColor(color) {
        this.color = color;
    }
    getDomainType() {
        if (this.domain) {
            return this.domain.type;
        }
        else {
            return "";
        }
    }
    getDomain() {
        return this.domain;
    }
    setDomain(domain) {
        this.domain = domain;
    }
    getDefaultScoreFunction() {
        if (this.defaultScoreFunction === undefined) {
            return this.getInitialScoreFunction(ScoreFunction_1.ScoreFunction.FLAT);
        }
        return this.defaultScoreFunction;
    }
    setDefaultScoreFunction(scoreFunction) {
        this.defaultScoreFunction = scoreFunction;
    }
    /*
        @param type - The type of function (for now, one of: flat, positive linear, negative linear).
        @returns {ScoreFunction}
        @description	Creates and returns a new score function of the specified type for this PrimitiveObjective's domain.
    */
    getInitialScoreFunction(type) {
        let scoreFunction;
        if (this.getDomainType() === 'categorical' || this.getDomainType() === 'interval') {
            scoreFunction = new DiscreteScoreFunction_1.DiscreteScoreFunction();
            scoreFunction.initialize(type, this.domain.getElements());
        }
        else {
            scoreFunction = new ContinuousScoreFunction_1.ContinuousScoreFunction(this.domain.getMinValue(), this.domain.getMaxValue());
            scoreFunction.initialize(type);
        }
        return scoreFunction;
    }
    /*
        @returns {PrimitiveObjective} - A PrimitiveObjective that is an exact copy of this PrimitiveObjective.
        @description	Returns a copy (AKA a memento) of the PrimitiveObjective. This copy is stored in a different memory location and will not be changed if the original
                        PrimitiveObjective is changed. This method should be used to create copies of a PrimitiveObjective when it needs to be preserved and stored.
    */
    getMemento() {
        // Create a new PrimitiveObjective object.
        var primitiveObjectiveCopy = new PrimitiveObjective(this.name, this.description);
        // Copy over all the properties from the PrimitiveObjective that is being copied. Note that this does NOT create a new domain Objective, it merely preservers the reference.
        Object.assign(primitiveObjectiveCopy, this);
        return primitiveObjectiveCopy;
    }
}
exports.PrimitiveObjective = PrimitiveObjective;
//# sourceMappingURL=PrimitiveObjective.js.map