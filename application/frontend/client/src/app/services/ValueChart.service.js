"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-06-03 10:09:41
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-07-19 16:15:02
*/
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
exports.ValueChartService = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
const _ = require("lodash");
/*
    This class stores a ValueChart and exposes this state to any component, directive, or service in the application
    that requires it. Often this ValueChart is referred to as the "base" ValueChart since it constitutes the master
    copy of the ValueChart. This is as opposed to the ValueChartViewer service which stores the "active" ValueChart.
*/
let ValueChartService = /** @class */ (() => {
    let ValueChartService = class ValueChartService {
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
            this.status = { lockedByCreator: false, lockedBySystem: false }; // The status of the ValueChart.
        }
        // ========================================================================================
        // 									Methods
        // ========================================================================================
        setValueChart(valueChart) {
            this.valueChart = valueChart;
        }
        getValueChart() {
            if (_.isNil(this.valueChart))
                throw 'ValueChart is not defined';
            return this.valueChart;
        }
        valueChartIsDefined() {
            return !_.isNil(this.valueChart);
        }
        getStatus() {
            return this.status;
        }
        setStatus(status) {
            this.status = status;
        }
    };
    ValueChartService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [])
    ], ValueChartService);
    return ValueChartService;
})();
exports.ValueChartService = ValueChartService;
//# sourceMappingURL=ValueChart.service.js.map