"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-06-28 17:21:42
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-05-11 13:11:51
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
exports.RenderEventsService = void 0;
const core_1 = require("@angular/core");
// d3
const Subject_1 = require("rxjs/Subject");
const Observable_1 = require("rxjs/Observable");
require("../../app/utilities/rxjs-operators");
let RenderEventsService = /** @class */ (() => {
    let RenderEventsService = class RenderEventsService {
        // renderer subjects. Initial renderering has been completed if this accumulated number is greater than 3.
        constructor() {
            this.summaryChartDispatcher = new Subject_1.Subject();
            this.objectiveChartDispatcher = new Subject_1.Subject();
            this.labelsDispatcher = new Subject_1.Subject();
            this.rendersCompleted = Observable_1.Observable.merge(this.summaryChartDispatcher, this.objectiveChartDispatcher, this.labelsDispatcher)
                .scan((acc, one) => acc + one, 0);
        }
    };
    RenderEventsService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [])
    ], RenderEventsService);
    return RenderEventsService;
})();
exports.RenderEventsService = RenderEventsService;
//# sourceMappingURL=RenderEvents.service.js.map