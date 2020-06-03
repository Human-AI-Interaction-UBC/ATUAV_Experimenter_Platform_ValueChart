"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-05-27 09:27:40
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2016-08-22 21:05:58
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContinuousDomain = void 0;
/*
    This class represents a continuous domain. An continuous domain is a domain that is densely includes every value between a minimum and maximum value.
    For example, a continuous domain [0,10] is a domain that includes 0, 10 and all possible values between them.
    Continuous domains are assigned scores by the ContinuousScoreFunction.
*/
class ContinuousDomain {
    // ========================================================================================
    // 									Constructor
    // ========================================================================================
    constructor(minValue, maxValue, unit) {
        if (minValue !== undefined)
            this.minValue = minValue;
        if (maxValue !== undefined)
            this.maxValue = maxValue;
        if (unit)
            this.unit = unit;
        this.type = 'continuous';
    }
    // ========================================================================================
    // 									Methods
    // ========================================================================================
    setRange(minValue, maxValue) {
        this.minValue = minValue;
        this.maxValue = maxValue;
    }
    getRange() {
        return [this.minValue, this.maxValue];
    }
    getMinValue() {
        return this.minValue;
    }
    getMaxValue() {
        return this.maxValue;
    }
}
exports.ContinuousDomain = ContinuousDomain;
//# sourceMappingURL=ContinuousDomain.js.map