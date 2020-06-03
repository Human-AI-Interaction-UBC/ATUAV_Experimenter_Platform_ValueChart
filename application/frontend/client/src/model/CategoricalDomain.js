"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-05-24 09:56:10
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2016-08-22 21:03:58
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoricalDomain = void 0;
/*
    This class represents a categorical domain. A categorical domain is a domain where each element
    is separately specified (ex. Categorical domain Animals = {Snake, Horse, Dog}). This class is a wrapper around
    an array of strings used to store domain elements. The wrapper provides useful functionality for determine domain type,
    whether the domain is ordered, and adding/removing elements in a controlled way. Categorical domains are assigned scores
    by the DiscreteScoreFunction.
*/
class CategoricalDomain {
    // ========================================================================================
    // 									Fields
    // ========================================================================================
    constructor(ordered) {
        this.type = "categorical";
        this.ordered = ordered;
        this.elements = [];
    }
    // ========================================================================================
    // 									Fields
    // ========================================================================================
    addElement(element) {
        var elementIndex = this.elements.indexOf(element);
        // Prevent adding duplicate elements to the domain.
        if (elementIndex == -1) {
            this.elements.push(element);
        }
    }
    removeElement(element) {
        var elementIndex = this.elements.indexOf(element);
        if (elementIndex !== -1) {
            this.elements.splice(elementIndex, 1);
        }
    }
    getElements() {
        return this.elements;
    }
}
exports.CategoricalDomain = CategoricalDomain;
//# sourceMappingURL=CategoricalDomain.js.map