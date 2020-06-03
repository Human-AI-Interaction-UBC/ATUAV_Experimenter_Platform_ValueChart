"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-06-30 16:45:29
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-08-16 17:06:36
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.XmlValueChartEncoder = void 0;
/*
    This class encodes an instance of the ValueChart class into an XML string using the WebValueCharts schema. It converts all aspects
    of a ValueChart into the proper XML representations including alternatives, the objective hierarchy, and users. XML ValueCharts
    can be exported as documents and saved locally by users with the intent of being used again later. Exporting ValueCharts that have
    been encoded as XML by this class is accomplished by the ExportValueChartComponent class.

    See the wiki for more information about the WebValueCharts schema, or ValueChartPrototype.xml for an example of a ValueChart that
    has been encoded into XML.
*/
class XmlValueChartEncoder {
    // ========================================================================================
    // 									Constructor
    // ========================================================================================
    constructor() {
        this.serializer = new XMLSerializer();
    }
    // ========================================================================================
    // 									Methods
    // ========================================================================================
    /*
        @param valueChart - The ValueChart object that is to be encoded into an XML string representation.
        @returns {string} - An XML string representation of the given ValueChart.
        @description	Encodes a given ValueChart into an XML string. ONLY this method should be called manually when encoding a ValueChart to XML.
    */
    encodeValueChart(valueChart) {
        var xmlDocument = document.implementation.createDocument(null, null, null); // Create a new XML document.
        // Set the XML version header.
        var xmlProcessingInstruction = xmlDocument.createProcessingInstruction('xml', 'version="1.0" encoding="UTF-8" standalone="no"');
        xmlDocument.appendChild(xmlProcessingInstruction);
        var valueChartElement = this.convertValueChartIntoElement(valueChart, xmlDocument); // Encode the entire ValueChart.
        xmlDocument.appendChild(valueChartElement); // Append the ValueCHart element to the document.
        var valueChartXMLString = this.serializer.serializeToString(xmlDocument); // Convert the XML document into a string.
        return valueChartXMLString;
    }
    /*
        @param valueChart - The ValueChart object whose User defined weights are to be encoded into a CSV string.
        @returns {string} - A CSV string of the User defined weights from the given ValueChart.
        @description	Encodes the weights assigned by each User in the given ValueChart to each PrimitiveObjective as a
                        CSV string. The first row of the string encodes the objectives names (used as columns). Each subsequent
                        row encodes the weight assignments of one user in the given ValueChart.
    */
    encodeUserWeights(valueChart) {
        var csvOutput = 'username,'; // The first column is username.
        var primitiveObjectives = valueChart.getAllPrimitiveObjectives();
        primitiveObjectives.forEach((objective) => {
            csvOutput = csvOutput + objective.getName() + ','; // The rest of the columns are objectives.
        });
        csvOutput = csvOutput + '\n'; // Add a return line character after the row of objective names.
        valueChart.getUsers().forEach((user) => {
            csvOutput = csvOutput + user.getUsername() + ','; // Add the user's username to the CSV string in the first column.
            primitiveObjectives.forEach((objective) => {
                csvOutput = csvOutput + user.getWeightMap().getNormalizedObjectiveWeight(objective.getId()) + ','; // Add the user's weights.
            });
            csvOutput = csvOutput + '\n'; // Add a return line character after each user's row.
        });
        return csvOutput;
    }
    /*
        @param valueChart - The ValueChart object that is to be encoded into an XML string representation.
        @param xmlDocument - The XML document that is going to represent the ValueChart to encode. This is required by the method to create
                                new elements. It is NOT modified.
        @returns {Element} - An XML element representing the ValueChart that was provided.
        @description	Encodes a ValueChart and all its fields as an XML element.
    */
    convertValueChartIntoElement(valueChart, xmlDocument) {
        var valueChartElement = xmlDocument.createElement('ValueCharts');
        valueChartElement.setAttribute('name', valueChart.getName());
        valueChartElement.setAttribute('creator', valueChart.getCreator());
        valueChartElement.setAttribute('version', '2.0');
        let type = valueChart.isIndividual() ? 'individual' : 'group';
        valueChartElement.setAttribute('type', type);
        if (valueChart.password) {
            valueChartElement.setAttribute('password', valueChart.password);
        }
        let descriptionElement = xmlDocument.createElement('Description');
        descriptionElement.innerHTML = valueChart.getDescription();
        valueChartElement.appendChild(descriptionElement);
        var chartStructureElement = xmlDocument.createElement('ChartStructure');
        valueChartElement.appendChild(chartStructureElement);
        var objectivesParentElement = xmlDocument.createElement('Objectives');
        chartStructureElement.appendChild(objectivesParentElement);
        // Encode the objective hierarchy.
        valueChart.getRootObjectives().forEach((objective) => {
            objectivesParentElement.appendChild(this.convertObjectiveIntoElement(objective, xmlDocument, valueChart.isIndividual()));
        });
        // Encode the alternatives.
        chartStructureElement.appendChild(this.convertAlternativesIntoElement(valueChart.getAlternatives(), xmlDocument, valueChart.getObjectiveIdToNameMap()));
        // Encode the users.
        valueChartElement.appendChild(this.convertUsersIntoElement(valueChart.getUsers(), xmlDocument, valueChart.getObjectiveIdToNameMap()));
        return valueChartElement;
    }
    /*
        @param objective - The Objective object that is to be encoded into an XML element. This may be either an AbstractObjective or a PrimitiveObjective.
        @param xmlDocument - The XML document that is going to represent the ValueChart to encode. This is required by the method to create
                                new elements. It is NOT modified.
        @param isIndividual - Whether this is an individual chart (as opposed to a group chart).
        @returns {Element} - An XML element representing the objective that was provided.
        @description	Encodes an objective and all its fields (including any subobjectives) as an XML element.
    */
    convertObjectiveIntoElement(objective, xmlDocument, isIndividual) {
        var objectiveElement = xmlDocument.createElement('Objective');
        objectiveElement.setAttribute('name', objective.getName());
        objectiveElement.setAttribute('type', objective.objectiveType);
        let descriptionElement = xmlDocument.createElement('Description');
        descriptionElement.innerHTML = objective.getDescription();
        objectiveElement.appendChild(descriptionElement);
        if (objective.objectiveType === 'abstract') {
            objective.getDirectSubObjectives().forEach((subObjective) => {
                objectiveElement.appendChild(this.convertObjectiveIntoElement(subObjective, xmlDocument, isIndividual)); // Recursively encode AbstractObjectives.
            });
        }
        else {
            objectiveElement.setAttribute('color', objective.getColor());
            objectiveElement.appendChild(this.convertDomainIntoElement(objective.getDomain(), xmlDocument));
            if (!isIndividual) {
                objectiveElement.appendChild(this.convertScoreFunctionIntoElement(objective.getDefaultScoreFunction(), objective.getName(), xmlDocument, true));
            }
        }
        return objectiveElement;
    }
    /*
        @param domain - The Domain object that is to be encoded into an XML element. This may be an instance of any of the Domain classes.
        @param xmlDocument - The XML document that is going to represent the ValueChart to encode. This is required by the method to create
                                new elements. It is NOT modified.
        @returns {Element} - An XML element representing the Domain object that was provided.
        @description	Encodes a Domain object and all its fields as an XML element.
    */
    convertDomainIntoElement(domain, xmlDocument) {
        var domainElement = xmlDocument.createElement('Domain');
        domainElement.setAttribute('type', domain.type);
        if (domain.type === 'continuous') {
            if (domain.unit) {
                domainElement.setAttribute('unit', domain.unit);
            }
            domainElement.setAttribute('min', '' + domain.getMinValue());
            domainElement.setAttribute('max', '' + domain.getMaxValue());
        }
        else if (domain.type === 'categorical') {
            domainElement.setAttribute('ordered', '' + domain.ordered);
            domain.getElements().forEach((category) => {
                let categoryElement = xmlDocument.createElement('Category');
                categoryElement.innerHTML = category;
                domainElement.appendChild(categoryElement);
            });
        }
        else if (domain.type === 'interval') {
            domainElement.setAttribute('interval', '' + domain.getInterval());
            domainElement.setAttribute('min', '' + domain.getMinValue());
            domainElement.setAttribute('max', '' + domain.getMaxValue());
        }
        return domainElement;
    }
    /*
        @param alternatives - The array of Alternative objects that are to be encoded as XML elements.
        @param xmlDocument - The XML document that is going to represent the ValueChart to encode. This is required by the method to create
                                new elements. It is NOT modified.
        @param idToNameMap - A map from Objective ids to names.
        @returns {Element} - An XML element that is a parent of the XML elements representing the provided Alternative objects.
        @description	Encodes an array of Alternatives objects as XML elements.
    */
    convertAlternativesIntoElement(alternatives, xmlDocument, idToNameMap) {
        var alternativesParentElement = xmlDocument.createElement('Alternatives');
        alternatives.forEach((alternative) => {
            let alternativeElement = xmlDocument.createElement('Alternative');
            alternativeElement.setAttribute('name', alternative.getName());
            let objectiveValuePairs = alternative.getAllObjectiveValuePairs();
            objectiveValuePairs.forEach((pair) => {
                let alternativeValueElement = xmlDocument.createElement('AlternativeValue');
                alternativeValueElement.setAttribute('objective', idToNameMap[pair.objectiveId]);
                alternativeValueElement.setAttribute('value', '' + pair.value);
                alternativeElement.appendChild(alternativeValueElement);
            });
            let descriptionElement = xmlDocument.createElement('Description');
            descriptionElement.innerHTML = alternative.getDescription();
            alternativeElement.appendChild(descriptionElement);
            alternativesParentElement.appendChild(alternativeElement);
        });
        return alternativesParentElement;
    }
    /*
        @param alternatives - The array of User objects that are to be encoded as XML elements.
        @param xmlDocument - The XML document that is going to represent the ValueChart to encode. This is required by the method to create
                                new elements. It is NOT modified.
        @param idToNameMap - A map from Objective ids to names.
        @returns {Element} - An XML element that is a parent of the XML elements representing the provided User objects.
        @description	Encodes an array of User objects as XML elements. This method encodes each Users WeightMap, ScoreFunctionMap and ScoreFunctions
                        as a part of its execution.
    */
    convertUsersIntoElement(users, xmlDocument, idToNameMap) {
        var usersParentElement = xmlDocument.createElement('Users');
        users.forEach((user) => {
            let userElement = xmlDocument.createElement('User');
            userElement.setAttribute('name', user.getUsername());
            if (user.color) {
                userElement.setAttribute('color', user.color);
            }
            userElement.appendChild(this.convertWeightMapIntoElement(user.getWeightMap(), xmlDocument, idToNameMap)); // Encode the User's WeightMap.
            userElement.appendChild(this.convertScoreFunctionMapIntoElement(user.getScoreFunctionMap(), xmlDocument, idToNameMap)); // Encode the User's ScoreFunctionMap (and all their ScoreFunctions).
            usersParentElement.appendChild(userElement);
        });
        return usersParentElement;
    }
    /*
        @param weightMap - The WeightMap object that is to be encoded as an XML element.
        @param xmlDocument - The XML document that is going to represent the ValueChart to encode. This is required by the method to create
                                new elements. It is NOT modified.
        @param idToNameMap - A map from Objective ids to names.
        @returns {Element} - An XML element that represents the given WeightMap.
        @description	Encodes a WeightMap object as an XML element.
    */
    convertWeightMapIntoElement(weightMap, xmlDocument, idToNameMap) {
        var weightsParentElement = xmlDocument.createElement('Weights');
        var map = weightMap.getInternalWeightMap();
        var mapIterator = map.keys();
        var iteratorElement = mapIterator.next();
        while (iteratorElement.done === false) {
            let weightElement = xmlDocument.createElement('Weight');
            weightElement.setAttribute('objective', idToNameMap[iteratorElement.value]);
            weightElement.setAttribute('value', '' + weightMap.getNormalizedObjectiveWeight(iteratorElement.value));
            weightsParentElement.appendChild(weightElement);
            iteratorElement = mapIterator.next();
        }
        return weightsParentElement;
    }
    /*
        @param scoreFunctionMap - The ScoreFunctionMap object that is to be encoded as an XML element.
        @param xmlDocument - The XML document that is going to represent the ValueChart to encode. This is required by the method to create
                                new elements. It is NOT modified.
        @param idToNameMap - A map from Objective ids to names.
        @returns {Element} - An XML element that represents the given ScoreFunctionMap.
        @description	Encodes a ScoreFunctionMap object as an XML element.
    */
    convertScoreFunctionMapIntoElement(scoreFunctionMap, xmlDocument, idToNameMap) {
        var scoreFunctionsParentElement = xmlDocument.createElement('ScoreFunctions');
        var scoreFunctionKeyPairs = scoreFunctionMap.getAllKeyScoreFunctionPairs();
        scoreFunctionKeyPairs.forEach((pair) => {
            let scoreFunctionElement = this.convertScoreFunctionIntoElement(pair.scoreFunction, idToNameMap[pair.key], xmlDocument, false);
            scoreFunctionsParentElement.appendChild(scoreFunctionElement);
        });
        return scoreFunctionsParentElement;
    }
    /*
        @param scoreFunction - The ScoreFunction object that is to be encoded as an XML element.
        @param objectiveName - The name of the PrimitiveObjective that the given ScoreFunction is associated with. This information is encoded along with the ScoreFunction object.
        @param xmlDocument - The XML document that is going to represent the ValueChart to encode. This is required by the method to create
                                new elements. It is NOT modified.
        @param isDefault - Whether this is a default score function for an Objective.
        @returns {Element} - An XML element that represents the given ScoreFunction.
        @description	Encodes a ScoreFunction object as an XML element.
    */
    convertScoreFunctionIntoElement(scoreFunction, objectiveName, xmlDocument, isDefault) {
        var elementName = isDefault ? "DefaultScoreFunction" : "ScoreFunction";
        var scoreFunctionElement = xmlDocument.createElement(elementName);
        if (!isDefault) {
            scoreFunctionElement.setAttribute('objective', objectiveName);
        }
        if (scoreFunction.immutable) {
            scoreFunctionElement.setAttribute('immutable', 'true');
        }
        scoreFunctionElement.setAttribute('type', scoreFunction.type);
        var domainValues = scoreFunction.getAllElements();
        domainValues.forEach((domainValue) => {
            scoreFunctionElement.appendChild(this.convertScoreIntoElement(domainValue, scoreFunction.getScore(domainValue), xmlDocument));
        });
        return scoreFunctionElement;
    }
    /*
        @param domainValue - The domain elemment to set the score for.
        @param score - The score value.
        @param xmlDocument - The XML document that is going to represent the ValueChart to encode. This is required by the method to create
                                new elements. It is NOT modified.
        @returns {Element} - An XML element that represents the Score.
        @description	Encodes a ScoreFunction object as an XML element.
    */
    convertScoreIntoElement(domainValue, score, xmlDocument) {
        let scoreElement = xmlDocument.createElement('Score');
        scoreElement.setAttribute('value', '' + score);
        scoreElement.setAttribute('domain-element', '' + domainValue);
        return scoreElement;
    }
}
exports.XmlValueChartEncoder = XmlValueChartEncoder;
//# sourceMappingURL=XmlValueChart.encoder.js.map