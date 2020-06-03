"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-05-25 14:41:41
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-07-06 14:01:46
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValueChart = exports.ChartType = void 0;
const WeightMap_1 = require("./WeightMap");
// Import Utility Classes:
const Formatter = require("../app/utilities/Formatter");
// Import Libraries:
const _ = require("lodash");
/*
    This class is the representation of all of a ValueChart's internal data. It uses the Alternative class to represent the decision options
    in a ValueChart, a hierarchical structure of of Objectives to represent criteria for the decision, and an array of Users to represent
    user preferences. The ValueChart class is actually both a structural and preference class because of this array of users. A ValueChart
    with one user is referred to as a "individual" ValueChart, while a ValueChart with multiple users is referred to as a "group" ValueChart.
    These ValueCharts sub-types are rendered differently by the ValueChartDirective, but data-wise differ only in the number of users.
    A ValueChart with no users is a called a ValueChart structure and is used when new users join a ValueChart and require ONLY its structural
    elements.
*/
var ChartType;
(function (ChartType) {
    ChartType[ChartType["Individual"] = 0] = "Individual";
    ChartType[ChartType["Group"] = 1] = "Group";
})(ChartType = exports.ChartType || (exports.ChartType = {}));
;
class ValueChart {
    // ========================================================================================
    // 									Constructor
    // ========================================================================================
    /*
        @param name - The name of the ValueChart.
        @param description - The description of the ValueChart.
        @param creator - The username of the user who created the ValueChart.
        @param users - The collections of users in the ValueChart.
        @returns {void}
        @description	Constructs a new ValueChart. This constructor only initializes the basic fields of the ValueChart.
                        Alternatives, objectives, and possibly users must be set manually before the ValueChart is complete,
                        and can be used.
    */
    constructor(name, description, creator, users) {
        this.name = name;
        this.description = description;
        this.creator = creator;
        this.rootObjectives = [];
        this.alternatives = [];
        this.users = [];
        this.fname = Formatter.nameToID(this.name);
        if (users) {
            this.users = users;
        }
    }
    // ========================================================================================
    // 									Methods
    // ========================================================================================
    // Note that methods that are simple getters/setters, or modifiers are not commented as they are self-explanatory.
    getType() {
        return this.type;
    }
    setType(type) {
        this.type = type;
    }
    getFName() {
        return this.fname;
    }
    setFName(fname) {
        this.fname = fname;
    }
    getName() {
        return this.name;
    }
    setName(name) {
        this.name = name;
        this.fname = Formatter.nameToID(this.name);
    }
    getDescription() {
        return this.description;
    }
    setDescription(description) {
        this.description = description;
    }
    getCreator() {
        return this.creator;
    }
    setCreator(creator) {
        this.creator = creator;
    }
    isIndividual() {
        return this.type === ChartType.Individual;
    }
    getRootObjectives() {
        return this.rootObjectives;
    }
    setRootObjectives(objectives) {
        this.rootObjectives = objectives;
    }
    addRootObjective(objective) {
        if (this.rootObjectives.indexOf(objective) === -1) {
            this.rootObjectives.push(objective);
        }
    }
    removeRootObjective(objective) {
        var objectiveIndex = this.rootObjectives.indexOf(objective);
        if (objectiveIndex !== -1) {
            this.rootObjectives.splice(objectiveIndex, 1);
        }
    }
    /*
        @returns {Objective[]} - An array of all objectives in the ValueChart. This array is NOT ordered.
        @description	Parses the ValueChart's hierarchical objective structure to find every objective (both primitive and abstract).
    */
    getAllObjectives() {
        var objectives = this.rootObjectives.slice(); // Slice clones the array and returns a reference to this clone.		
        for (var i = 0; i < this.rootObjectives.length; i++) {
            if (this.rootObjectives[i].objectiveType === 'abstract') {
                objectives = objectives.concat(this.rootObjectives[i].getAllSubObjectives()); // (<AbstractObjective> objective) is the casting syntax for TypeScript
            }
        }
        return objectives;
    }
    /*
        @returns {Objective[]} - An array of all primitive objectives in the ValueChart. This array is NOT ordered.
        @description	Parses the ValueChart's hierarchical objective structure to find every primitive objective.
    */
    getAllPrimitiveObjectives() {
        var primitiveObjectives = [];
        var objectives;
        for (var i = 0; i < this.rootObjectives.length; i++) {
            if (this.rootObjectives[i].objectiveType === 'abstract') {
                // (<AbstractObjective> objective) is the casting syntax for TypeScript
                objectives = this.rootObjectives[i].getAllSubObjectives();
                objectives = objectives.filter((value) => {
                    return value.objectiveType === 'primitive';
                });
                primitiveObjectives = primitiveObjectives.concat(objectives);
            }
            else {
                primitiveObjectives.push(this.rootObjectives[i]);
            }
        }
        return primitiveObjectives;
    }
    /*
        @returns {PrimitiveObjective[]}
        @description   Returns Objectives whose default score functions are mutable.
    */
    getMutableObjectives() {
        return this.getAllPrimitiveObjectives().filter(obj => !obj.getDefaultScoreFunction().immutable);
    }
    /*
        @returns {string[]}
        @description   Returns map from Objective ids to names.
    */
    getObjectiveIdToNameMap() {
        let objectiveMap = {};
        for (let obj of this.getAllPrimitiveObjectives()) {
            objectiveMap[obj.getId()] = obj.getName();
        }
        return objectiveMap;
    }
    /*
        @returns {string[]}
        @description   Returns map from Objective names to ids.
    */
    getObjectiveNameToIdMap() {
        let objectiveMap = {};
        for (let obj of this.getAllPrimitiveObjectives()) {
            objectiveMap[obj.getName()] = obj.getId();
        }
        return objectiveMap;
    }
    /*
        @returns {ValueChart}
        @description   Returns a shallow copy of the ValueChart containing no users.
    */
    getValueChartStructure() {
        let structure = new ValueChart(this.name, this.description, this.creator);
        structure.setAlternatives(this.alternatives);
        structure.setRootObjectives(this.rootObjectives);
        return structure;
    }
    // Alternative Related Methods:
    getAlternatives() {
        return this.alternatives;
    }
    setAlternatives(alternatives) {
        this.alternatives = alternatives;
    }
    addAlternative(alternative) {
        if (this.alternatives.indexOf(alternative) === -1) {
            this.alternatives.push(alternative);
        }
    }
    removeAlternative(alternative) {
        var alternativeIndex = this.alternatives.indexOf(alternative);
        if (alternativeIndex !== -1) {
            this.alternatives.splice(alternativeIndex, 1);
        }
    }
    /*
        @returns {(string | number, alternative)[]} - An array of the given objective's domains values that are the consequences of Alternatives paired with the alternative.
        @description	Iterates over the ValueChart's collection of alternatives to retrieve the array of all alternative consequences for a
                        give objective. The alternative is paired with its consequence in the array so that the connection between
                        domain value and alternative is not lost.
    */
    getAlternativeValuesforObjective(objective) {
        var alternativeValues = [];
        this.alternatives.forEach((alternative) => {
            alternativeValues.push({ value: alternative.getObjectiveValue(objective.getId()), alternative: alternative });
        });
        return alternativeValues;
    }
    // User Relation Methods:
    getUsers() {
        return this.users;
    }
    setUsers(users) {
        this.users = users;
    }
    setUser(newUser) {
        var userIndex = this.users.findIndex((user) => {
            return newUser.getUsername() === user.getUsername();
        });
        if (userIndex === -1) {
            this.users.push(newUser);
        }
        else {
            this.users[userIndex] = newUser;
        }
    }
    getUser(username) {
        var user = this.users.filter((user) => {
            return user.getUsername() === username;
        })[0];
        return user;
    }
    isMember(username) {
        return !_.isNil(this.getUser(username));
    }
    removeUser(userToDelete) {
        var index = this.users.findIndex((currentUser) => {
            return userToDelete.getUsername() === currentUser.getUsername();
        });
        if (index !== -1) {
            this.users.splice(index, 1);
        }
    }
    /*
        @returns {WeightMap} - The default WeightMap.
        @description	Create a default weight map for the Objective hierarchy with evenly distributed weights
    */
    getDefaultWeightMap() {
        let weightMap = new WeightMap_1.WeightMap();
        this.initializeDefaultWeightMap(this.getRootObjectives(), weightMap, 1);
        return weightMap;
    }
    /*
        @returns {void}
        @description	Helper method for getDefaultWeightMap(). Recursively add entries to the WeightMap.
    */
    initializeDefaultWeightMap(objectives, weightMap, parentWeight) {
        let weight = parentWeight * 1.0 / objectives.length;
        for (let obj of objectives) {
            if (obj.objectiveType === 'abstract') {
                this.initializeDefaultWeightMap(obj.getDirectSubObjectives(), weightMap, weight);
            }
            else {
                weightMap.setObjectiveWeight(obj.getId(), weight);
            }
        }
    }
}
exports.ValueChart = ValueChart;
//# sourceMappingURL=ValueChart.js.map