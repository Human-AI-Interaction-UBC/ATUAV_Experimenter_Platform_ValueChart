"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-05-24 17:33:12
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-08-16 16:58:50
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractObjective = void 0;
const Formatter = require("../app/utilities/Formatter");
const _ = require("lodash");
/*
    A abstract objective is a criteria used to evaluate alternatives in a decision that can be broken down into further criteria.
    This is why it is called abstract. Abstract objectives are a key component of a ValueChart. They are used to create the arbitrary hierarchy
    of objectives that users use to evaluate Alternatives in a ValueChart. Note that Abstract Objectives do not have domains
    because are composed of more Abstract and Primitive Objectives. They also do not have colors.
*/
class AbstractObjective {
    // ========================================================================================
    // 									Constructor
    // ========================================================================================
    /*
        @param name - The name of the AbstractObjective.
        @param description - The description of the AbstractObjective.
        @returns {void}
        @description	Constructs a new AbstractObjective. This constructor only initializes the basic fields of the AbstractObjective.
                        Note that subObjectives must be manually added to the subObjectives array using the addSubObjective or setDirectSubObjectives methods.
    */
    constructor(name, description) {
        this.name = name;
        this.description = description;
        this.objectiveType = 'abstract';
        this.subObjectives = [];
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
    setDirectSubObjectives(objectives) {
        this.subObjectives = objectives;
    }
    addSubObjective(objective) {
        this.subObjectives.push(objective);
    }
    removeSubObjective(objective) {
        var objectiveIndex = this.subObjectives.indexOf(objective);
        if (objectiveIndex !== -1) {
            this.subObjectives.splice(objectiveIndex, 1);
        }
    }
    getDirectSubObjectives() {
        return this.subObjectives;
    }
    /*
        @returns {Objective[]} - The unordered collection of all objectives that are below this objective in the hierarchy. Ie. This objectives children, their children and their children's chidlren, etc.
        @description	Recursively parses the hierarchy of objectives below the AbstractObjective to discover and return all its children.
    */
    getAllSubObjectives() {
        var subObjectives = [];
        this.subObjectives.forEach((objective) => {
            subObjectives.push(objective);
            if (objective.objectiveType === 'abstract') {
                Array.prototype.push.apply(subObjectives, objective.getAllSubObjectives());
            }
        });
        return subObjectives;
    }
    /*
        @returns {Objective[]} - The unordered collection of all PrimitiveObjectives that are below this objective in the hierarchy.
        @description	Recursively parses the hierarchy of objectives below the AbstractObjective to discover all its children. A filter
                        is then applied to this collection so that only Primitive Objectives are returned. Note that the order in which this
                        array is returned is not well defined..
    */
    getAllPrimitiveSubObjectives() {
        var subObjectives = [];
        this.subObjectives.forEach((objective) => {
            subObjectives.push(objective);
            if (objective.objectiveType === 'abstract') {
                Array.prototype.push.apply(subObjectives, objective.getAllSubObjectives());
            }
        });
        subObjectives = subObjectives.filter((objective) => {
            return objective.objectiveType === 'primitive';
        });
        return subObjectives;
    }
    /*
        @returns {AbstractObjective} - A AbstractObjective that is an exact copy of this AbstractObjective.
        @description	Returns a copy (AKA a memento) of the AbstractObjective. This copy is stored in a different memory location and will not be changed if the original
                        AbstractObjective is changed. This method should be used to create copies of a AbstractObjective when it needs to be preserved and stored. Note that
                        this method recursively copies all the Objectives which are children of this objective using their getMemento methods.
    */
    getMemento() {
        // Create a new AbstractObjective object.
        var abstractObjectiveCopy = new AbstractObjective(this.name, this.description);
        // Copy over all the properties from the AbstractObjective that is being copied. Note that this does NOT create a new domain Objective, it merely preservers the reference.
        Object.assign(abstractObjectiveCopy, this);
        var subObjectives = [];
        // Create copies of each of the child objectives.
        for (var i = 0; i < this.subObjectives.length; i++) {
            subObjectives[i] = this.subObjectives[i].getMemento();
        }
        abstractObjectiveCopy.setDirectSubObjectives(subObjectives);
        return abstractObjectiveCopy;
    }
}
exports.AbstractObjective = AbstractObjective;
//# sourceMappingURL=AbstractObjective.js.map