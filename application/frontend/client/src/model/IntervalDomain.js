"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-06-01 11:59:40
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2016-08-22 21:03:52
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntervalDomain = void 0;
/*
    This class represents an interval domain. An interval domain is a domain where each element
    is specified by a rule that increments a initial value until a maximum value is reached. For example, the start value of 0,
    increment value of 10, and maximum value of 100 define an interval domain that can be represented as {0,10,20,30,40,50,60,70,80,90,100}.
    Interval domains are assigned scores by the DiscreteScoreFunction.
*/
class IntervalDomain {
    // as strings to work with the DiscreteScoreFunction. 
    // ========================================================================================
    // 									Constructor
    // ========================================================================================
    constructor(min, max, interval) {
        this.type = "interval";
        this.interval = interval;
        this.min = min;
        this.max = max;
        this.calculateElements();
    }
    // ========================================================================================
    // 									Methods
    // ========================================================================================
    getInterval() {
        return this.interval;
    }
    getRange() {
        return [this.min, this.max];
    }
    getMinValue() {
        return this.min;
    }
    getMaxValue() {
        return this.max;
    }
    getElements() {
        return this.elements;
    }
    calculateElements() {
        var elements = [];
        if (this.interval > 0) {
            var currentElement = this.min;
            while (currentElement < this.max) {
                elements.push('' + currentElement); // Convert the element into a string.
                currentElement += this.interval;
            }
            // Convert the element into a string.
            elements.push('' + this.max);
        }
        this.elements = elements;
    }
}
exports.IntervalDomain = IntervalDomain;
//# sourceMappingURL=IntervalDomain.js.map