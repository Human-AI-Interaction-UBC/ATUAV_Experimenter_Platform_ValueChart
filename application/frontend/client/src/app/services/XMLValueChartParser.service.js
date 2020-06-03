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
exports.XMLValueChartParserService = void 0;
/*
* @Author: aaronpmishkin
* @Date:   2016-05-31 11:04:42
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-08-16 14:48:12
*/
// Import Angular Classes
const core_1 = require("@angular/core");
// Import Utility Classes
const utilities_1 = require("../utilities");
const utilities_2 = require("../utilities");
/*
    This class is an Angular service that provides an interface for parsing XML ValueCharts regardless of their schema. It uses instances of the
    XmlLegacyValueChartParser and XmlValueChartParser classes to parse XML ValueCharts of either the WebValueCharts, or the ValueChartsPlus (deprecated) schema.
    Please see the Wiki for more information about these two different schemas.
*/
let XMLValueChartParserService = /** @class */ (() => {
    let XMLValueChartParserService = class XMLValueChartParserService {
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        constructor() {
            // Initialize the parser fields.
            this.xmlDocParser = new DOMParser();
            this.xmlLegacyValueChartParser = new utilities_1.XmlLegacyValueChartParser();
            this.xmlValueChartParser = new utilities_2.XmlValueChartParser();
        }
        // ========================================================================================
        // 									Methods
        // ========================================================================================
        /*
            @param xmlString - An XML string of a ValueChart that is to be parsed into an instance of the ValueChart class. The XML can be in either
                                the ValueChartsPlus or WebValueCharts schemas.
            @returns {ValueChart}	- A ValueChart object parsed from the xmlString parameter.
            @description	Parses a ValueChart from an XML string and into the proper class instances so that it can be used by the
                            application. This method can parse either schema of XML ValueChart.
        */
        parseValueChart(xmlString) {
            var valueChart;
            var xmlDocument = this.xmlDocParser.parseFromString(xmlString, 'application/xml'); // Parse the XML string into a document object.
            var valueChartElement = xmlDocument.querySelector('ValueCharts'); // Retrieve the ValueChart element from the document.
            // The ValueChart XML representation is version 1.0, or the version is not defined. This means the XML is of the deprecated ValueChartsPlus schema.
            if (!valueChartElement.getAttribute('version') || valueChartElement.getAttribute('version') === '1.0') {
                try {
                    valueChart = this.xmlLegacyValueChartParser.parseValueChart(xmlDocument); // Parse with the deprecated, legacy parser.
                }
                catch (e) {
                    console.log(e);
                }
            }
            else { // The ValueChart XML representation is version 2.0. This means the XML is of the WebValueCharts schema.
                try {
                    valueChart = this.xmlValueChartParser.parseValueChart(xmlDocument); // Parse with the regular parser.
                }
                catch (e) {
                    console.log(e);
                }
            }
            return valueChart;
        }
    };
    XMLValueChartParserService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [])
    ], XMLValueChartParserService);
    return XMLValueChartParserService;
})();
exports.XMLValueChartParserService = XMLValueChartParserService;
//# sourceMappingURL=XMLValueChartParser.service.js.map