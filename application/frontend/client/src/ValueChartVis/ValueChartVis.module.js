"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2017-05-15 17:22:03
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-05-16 23:06:24
*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValueChartVisModule = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
const common_1 = require("@angular/common");
// Import Application Classes:
const directives_1 = require("./directives");
const directives_2 = require("./directives");
/*
    This is the ValueChart module declaration. It creates the ValueChart module, imports whatever modules it depends on, registers
    the components that belong to it, registers required providers, and defines the component that should be bootstrapped.
    The ValueChart module comprises the ValueChart visualization and the renderers, services, utilities, and interactions required to display,
    updated, and interact with it. It exports the ValueChartDirect, which is used by other modules to create and display ValueChart visualizations.

    Notice that the ValueChart module has no router because it does not have any associated routes. The module is a wrapper around the
    ValueChart directive and its ecosystem; it is not an application in of itself.
*/
let ValueChartVisModule = /** @class */ (() => {
    let ValueChartVisModule = class ValueChartVisModule {
    };
    ValueChartVisModule = __decorate([
        core_1.NgModule({
            imports: [
                common_1.CommonModule,
            ],
            declarations: [
                directives_1.ValueChartDirective,
                directives_2.ScoreFunctionDirective
            ],
            exports: [
                directives_1.ValueChartDirective,
                directives_2.ScoreFunctionDirective
            ],
            providers: [],
        })
    ], ValueChartVisModule);
    return ValueChartVisModule;
})();
exports.ValueChartVisModule = ValueChartVisModule;
//# sourceMappingURL=ValueChartVis.module.js.map