"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-08-13 13:46:50
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-06-01 12:42:09
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortAlternativesType = exports.PumpType = exports.WeightResizeType = exports.ChartOrientation = void 0;
var ChartOrientation;
(function (ChartOrientation) {
    ChartOrientation[ChartOrientation["Vertical"] = 1] = "Vertical";
    ChartOrientation[ChartOrientation["Horizontal"] = 2] = "Horizontal";
})(ChartOrientation = exports.ChartOrientation || (exports.ChartOrientation = {}));
var WeightResizeType;
(function (WeightResizeType) {
    WeightResizeType[WeightResizeType["None"] = 0] = "None";
    WeightResizeType[WeightResizeType["Neighbors"] = 1] = "Neighbors";
    WeightResizeType[WeightResizeType["Siblings"] = 2] = "Siblings";
})(WeightResizeType = exports.WeightResizeType || (exports.WeightResizeType = {}));
var PumpType;
(function (PumpType) {
    PumpType[PumpType["None"] = 0] = "None";
    PumpType[PumpType["Decrease"] = 1] = "Decrease";
    PumpType[PumpType["Increase"] = 2] = "Increase";
})(PumpType = exports.PumpType || (exports.PumpType = {}));
var SortAlternativesType;
(function (SortAlternativesType) {
    SortAlternativesType[SortAlternativesType["None"] = 0] = "None";
    SortAlternativesType[SortAlternativesType["ByObjectiveScore"] = 1] = "ByObjectiveScore";
    SortAlternativesType[SortAlternativesType["Alphabetically"] = 2] = "Alphabetically";
    SortAlternativesType[SortAlternativesType["Manually"] = 3] = "Manually";
    SortAlternativesType[SortAlternativesType["Default"] = 4] = "Default";
})(SortAlternativesType = exports.SortAlternativesType || (exports.SortAlternativesType = {}));
//# sourceMappingURL=Config.types.js.map