"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-06-29 11:15:52
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-08-16 17:06:11
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.XmlValueChartParser = void 0;
// Import Model Classes:
const model_1 = require("../../model");
const model_2 = require("../../model");
const model_3 = require("../../model");
const model_4 = require("../../model");
const model_5 = require("../../model");
const model_6 = require("../../model");
const model_7 = require("../../model");
const model_8 = require("../../model");
const model_9 = require("../../model");
const model_10 = require("../../model");
const model_11 = require("../../model");
const model_12 = require("../../model");
/*
    This class parses ValueCharts that have been formatted as XML documents into ValueChart class instances. It parses the ValueChart's alternatives,
    objectives (both abstract and primitive), and users into the proper class instances as a part of this process. This class is inflexible; it
    expects all XML documents to be complete ValueCharts. It should be expanded to parse XML ValueCharts robustly and will completeness
    checking in the future.

    Note that XmlValueChartParser parses the WebValueCharts XML schema for a ValueChart ONLY. It cannot parse the ValueChartsPlus XML schema
    This is what the XmlLegacyValueChartParser class is for. Because the ValueChartsPlus XML schema is no longer in use, XmlValueChartParser
    is almost always the correct parser to use when handling XML ValueCharts. See the github wiki for more information about
    the two different XML schemas, or the ValueChartPrototype.xml file for an example of the WebValueCharts XML schema.
*/
class XmlValueChartParser {
    // ========================================================================================
    // 									Constructor
    // ========================================================================================
    constructor() { }
    // ========================================================================================
    // 									Methods
    // ========================================================================================
    /*
        @param xmlDocument - A document object created by parsing an XML string using the DOMParser.parseFromString() method. Note that this
                            must be a complete ValueChart xml document that satisfies the WebValueCharts XML schema.
        @returns {ValueChart}	- A ValueChart object parsed from the xmlDocument parameter.
        @description	Parses a ValueChart from an XML document and into the proper class instances so that it can be used by the
                        application. ONLY this method should be called manually when parsing an XML ValueChart; the other methods in the file
                        are public helpers.
    */
    parseValueChart(xmlDocument) {
        var valueChartElement = xmlDocument.querySelector('ValueCharts');
        var valueChartName = valueChartElement.getAttribute('name');
        var valueChartCreator = valueChartElement.getAttribute('creator');
        var valueChartDescription = '';
        var descriptionElement = valueChartElement.querySelector('Description');
        if (descriptionElement)
            valueChartDescription = descriptionElement.innerHTML;
        var valueChart = new model_1.ValueChart(valueChartName, valueChartDescription, valueChartCreator);
        valueChart.password = valueChartElement.getAttribute('password');
        let type = (valueChartElement.getAttribute('type') === 'individual') ? model_1.ChartType.Individual : model_1.ChartType.Group;
        valueChart.setType(type);
        var chartStructureElement = valueChartElement.querySelector('ChartStructure');
        if (chartStructureElement) {
            var objectivesParentElement = chartStructureElement.querySelector('Objectives');
            var alternativesParentElement = chartStructureElement.querySelector('Alternatives');
        }
        valueChart.setRootObjectives(this.parseObjectives(objectivesParentElement));
        valueChart.setAlternatives(this.parseAlternatives(alternativesParentElement, valueChart.getAllPrimitiveObjectives()));
        var usersParentElement = valueChartElement.querySelector('Users');
        valueChart.setUsers(this.parseUsers(usersParentElement, valueChart.getObjectiveNameToIdMap()));
        return valueChart;
    }
    /*
        @param objectivesParentElement - The <Objectives> element from the XML document, or a <Objective> element with type="abstract".
        @returns {Objective[]}	- The root objectives of the ValueChart
        @description	Parses the hierarchical structure of objectives from an XML document representing a ValueChart.
                        Note that this method should NEVER be called manually. All parsing should be initiated using parseValueChart.
    */
    parseObjectives(objectivesParentElement) {
        if (!objectivesParentElement)
            return;
        var objectives = [];
        var objectiveElements = objectivesParentElement.children;
        for (var i = 0; i < objectiveElements.length; i++) {
            let objectiveElement = objectiveElements[i];
            if (objectiveElement.tagName !== 'Objective')
                continue;
            let objective;
            let type = objectiveElement.getAttribute('type');
            let name = objectiveElement.getAttribute('name');
            let description = '';
            let descriptionElement = objectiveElement.querySelector('Description');
            if (descriptionElement)
                description = descriptionElement.innerHTML;
            if (type === 'abstract') {
                objective = new model_5.AbstractObjective(name, description);
                objective.setDirectSubObjectives(this.parseObjectives(objectiveElement));
            }
            else {
                objective = new model_4.PrimitiveObjective(name, description);
                let color = objectiveElement.getAttribute('color');
                objective.setColor(color);
                let domainElement = objectiveElement.querySelector('Domain');
                objective.setDomain(this.parseDomain(domainElement));
                let defaultScoreFunctionElement = objectiveElement.querySelector('DefaultScoreFunction');
                if (defaultScoreFunctionElement) {
                    objective.setDefaultScoreFunction(this.parseScoreFunction(defaultScoreFunctionElement));
                }
            }
            objectives.push(objective);
        }
        return objectives;
    }
    /*
        @param domainElement - The <Domain> element for one PrimitiveObjective in a ValueChart's XML document. This element contains the domain information for a single Objective.
        @returns {Domain}	- A domain object constructed from the information stored in the given <Domain> element.
        @description	Parses a <Domain> element to construct a Domain object of the right type for a Primitive Objective.
                        Note that this method should NEVER be called manually. All parsing should be initiated using parseValueChart.
    */
    parseDomain(domainElement) {
        if (!domainElement)
            return new model_12.CategoricalDomain(false); // No Domain was provided; return an empty categorical domain.
        var domain;
        var type = domainElement.getAttribute('type');
        if (type === 'continuous') {
            let min = +domainElement.getAttribute('min');
            let max = +domainElement.getAttribute('max');
            let unit = domainElement.getAttribute('unit');
            domain = new model_11.ContinuousDomain(min, max, unit);
        }
        else if (type === 'categorical') {
            let ordered = (domainElement.getAttribute('ordered') === 'true');
            domain = new model_12.CategoricalDomain(ordered);
            let categoryElements = domainElement.children;
            for (var i = 0; i < categoryElements.length; i++) {
                domain.addElement(categoryElements[i].innerHTML);
            }
        }
        else if (type === 'interval') {
            let min = +domainElement.getAttribute('min');
            let max = +domainElement.getAttribute('max');
            let interval = +domainElement.getAttribute('interval');
            domain = new model_10.IntervalDomain(min, max, interval);
        }
        return domain;
    }
    /*
        @param alternativesParentElement - The <Alternatives> element from the ValueChart's XML document. This element contains all of the ValueChart's alternatives as children.
        @param primitiveObjectives - The array of primitiveObjective objects belonging to the ValueChart that is being parsed. These MUST correlate properly
                                    with the objective names in the <Alternative> elements being parsed.
        @returns {Alternative[]}	- An array of Alternative objects constructed from the children of The <Alternatives> element.
        @description	Parses an <Alternatives> element from a ValueChart's XML document to obtain the array of Alternatives belonging to the ValueChart.
                        This method will also update the domains of the objectives in array of PrimitiveObjectives given as a parameter as it parses the
                        alternatives. This updating is done in-place.
                        Note that this method should NEVER be called manually. All parsing should be initiated using parseValueChart.
    */
    parseAlternatives(alternativesParentElement, primitiveObjectives) {
        if (!alternativesParentElement)
            return;
        var alternatives = [];
        var alternativeElements = alternativesParentElement.querySelectorAll('Alternative');
        for (var i = 0; i < alternativeElements.length; i++) {
            let alternativeElement = alternativeElements[i];
            let name = alternativeElement.getAttribute('name');
            let descriptionElement = alternativeElement.querySelector('Description');
            let description = '';
            if (descriptionElement)
                description = descriptionElement.innerHTML;
            let alternative = new model_6.Alternative(name, description);
            let alternativeValueElements = alternativeElement.querySelectorAll('AlternativeValue');
            for (var j = 0; j < alternativeValueElements.length; j++) {
                let alternativeValueElement = alternativeValueElements[j];
                let objectiveName = alternativeValueElement.getAttribute('objective');
                let domainValue = alternativeValueElement.getAttribute('value');
                let correspondingObjective = primitiveObjectives.find((objective) => {
                    return objective.getName() === objectiveName;
                });
                if (correspondingObjective.getDomainType() === 'continuous')
                    domainValue = +domainValue;
                alternative.setObjectiveValue(correspondingObjective.getId(), domainValue);
            }
            alternatives.push(alternative);
        }
        return alternatives;
    }
    /*
        @param usersParentElement - The <Users> element from the ValueChart's XML document. This element contains all of the ValueChart's users as children.
        @param nameToIdMap - A map from Objective names to ids.
        @returns {User[]}	- An array of User objects constructed from the children of The <Users> element.
        @description	Parses a <Users> element from a ValueChart's XML document to obtain the array of Users belonging to the ValueChart.
                        This method will parse the ScoreFunctionMap, WeightMap, and ScoreFunctions of each <User> element that is a
                        child of the provided <Users> element to produce complete user objects.
                        Note that this method should NEVER be called manually. All parsing should be initiated using parseValueChart.
    */
    parseUsers(usersParentElement, nameToIdMap) {
        if (!usersParentElement)
            return;
        var users = [];
        var userElements = usersParentElement.querySelectorAll('User');
        for (var i = 0; i < userElements.length; i++) {
            let userElement = userElements[i];
            let name = userElement.getAttribute('name');
            let user = new model_2.User(name);
            user.color = userElement.getAttribute('color');
            let weightsParentElement = userElement.querySelector('Weights');
            user.setWeightMap(this.parseWeightMap(weightsParentElement, nameToIdMap));
            let scoreFunctionsParentElement = userElement.querySelector('ScoreFunctions');
            user.setScoreFunctionMap(this.parseScoreFunctionMap(scoreFunctionsParentElement, nameToIdMap));
            users.push(user);
        }
        return users;
    }
    /*
        @param weightsParentElement - The <Weights> element for one user in a ValueChart's XML document. This element contains all of a user's weights as child elements.
        @param nameToIdMap - A map from Objective names to ids.
        @returns {WeightMap}	- A WeightMap object created from the <Weight> elements that are children of the provided weightsParentElement.
        @description	Parses a <Weights> element from a ValueChart's XML document to obtain a WeightMap.
                        Note that this method should NEVER be called manually. All parsing should be initiated using parseValueChart.
    */
    parseWeightMap(weightsParentElement, nameToIdMap) {
        if (!weightsParentElement)
            return;
        var weightMap = new model_3.WeightMap();
        var weightElements = weightsParentElement.querySelectorAll('Weight');
        for (var i = 0; i < weightElements.length; i++) {
            let weightElement = weightElements[i];
            let objectiveName = weightElement.getAttribute('objective');
            let weight = +weightElement.getAttribute('value');
            weightMap.setObjectiveWeight(nameToIdMap[objectiveName], weight);
        }
        return weightMap;
    }
    /*
        @param scoreFunctionsParentElement - The <ScoreFunctions> element for one user in a ValueChart's XML document. This element contains all of a user's score functions as child elements.
        @param nameToIdMap - A map from Objective names to ids.
        @returns {ScoreFunctionMap}	- A ScoreFunctionMap object created by parsing the provided scoreFunctionsParentElement.
        @description	Parses a <ScoreFunctions> element from a ValueChart's XML document to obtain a ScoreFunctionMap. Note that the ScoreFunctions within
                        the map are parsed as a part of this methods execution.
                        Note that this method should NEVER be called manually. All parsing should be initiated using parseValueChart.
    */
    parseScoreFunctionMap(scoreFunctionsParentElement, nameToIdMap) {
        if (!scoreFunctionsParentElement)
            return;
        var scoreFunctionMap = new model_7.ScoreFunctionMap();
        var scoreFunctionElements = scoreFunctionsParentElement.querySelectorAll('ScoreFunction');
        for (var i = 0; i < scoreFunctionElements.length; i++) {
            let scoreFunctionElement = scoreFunctionElements[i];
            let objectiveName = scoreFunctionElement.getAttribute('objective');
            let scoreFunction = this.parseScoreFunction(scoreFunctionElement);
            scoreFunctionMap.setObjectiveScoreFunction(nameToIdMap[objectiveName], scoreFunction);
        }
        return scoreFunctionMap;
    }
    /*
        @param scoreFunctionsParentElement - A <ScoreFunction> element from the ValueChart's XML document.
        @returns {ScoreFunction}	- A ScoreFunctionMap object created by parsing the provided scoreFunctionsParentElement.
        @description	Parses a <ScoreFunction> element from a ValueChart's XML document to obtain a ScoreFunction.
                        Note that this method should NEVER be called manually. All parsing should be initiated using parseValueChart.
    */
    parseScoreFunction(scoreFunctionElement) {
        if (!scoreFunctionElement)
            return;
        var scoreFunction;
        var type = scoreFunctionElement.getAttribute('type');
        if (type === 'continuous') {
            scoreFunction = new model_8.ContinuousScoreFunction();
        }
        else {
            scoreFunction = new model_9.DiscreteScoreFunction();
        }
        var immutable = scoreFunctionElement.getAttribute('immutable');
        scoreFunction.immutable = immutable === 'true' ? true : false;
        var scoresElement = scoreFunctionElement.querySelectorAll('Score');
        for (var i = 0; i < scoresElement.length; i++) {
            let scoreElement = scoresElement[i];
            let score = +scoreElement.getAttribute('value');
            let domainElement = scoreElement.getAttribute('domain-element');
            if (type === 'continuous')
                domainElement = +domainElement; // Convert to number
            scoreFunction.setElementScore(domainElement, score);
        }
        return scoreFunction;
    }
}
exports.XmlValueChartParser = XmlValueChartParser;
//# sourceMappingURL=XmlValueChart.parser.js.map