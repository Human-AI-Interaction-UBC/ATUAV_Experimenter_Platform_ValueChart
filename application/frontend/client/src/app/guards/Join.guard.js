"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-08-10 14:54:26
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-07-07 10:48:16
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
exports.JoinGuard = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
const router_1 = require("@angular/router");
// Import Application Classes:
const services_1 = require("../services");
const services_2 = require("../services");
const http_1 = require("../http");
/*
    JoinGuard is an Angular service that is used to allow users to join existing ValueCharts. Unlike AuthGuard,
    JoinGuard is only registered on one route, 'join/ValueCharts/:ValueChart', which is only ever activated when a user joins an existing
    ValueCharts via a referral link. When this happens, this class obtains the name and password of the ValueChart that the user is joining from
    the URL parameters and makes a call to the server to retrieve the structure of said ValueChart. This allows the application to navigate
    directly to the ValueChart creation workflow after the user is authenticated and avoids placing any logic for joining a ValueChart
    in RegisterComponent.
*/
let JoinGuard = /** @class */ (() => {
    let JoinGuard = class JoinGuard {
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        /*
            @returns {void}
            @description 	Used for Angular's dependency injection ONLY. It should not be used to do any initialization of the class.
                            This constructor will be called automatically when Angular constructs an instance of this class prior to dependency injection.
        */
        constructor(router, currentUserService, valueChartService, valueChartHttp) {
            this.router = router;
            this.currentUserService = currentUserService;
            this.valueChartService = valueChartService;
            this.valueChartHttp = valueChartHttp;
        }
        /*
            @returns {boolean} - Whether navigation to the activated route will be permitted or not. This is ALWAYS true for this method.
            @description 	Used by the Angular router to fetch a ValueChart's structure to facilitate a user joining that ValueChart.
                            This method should NEVER be called manually. Leave routing, and calling of the canActivate, canDeactivate, etc. classes
                            to the Angular 2 router.
        */
        canActivate(route, state) {
            return new Promise((resolve) => {
                if (state.url.indexOf('join') !== -1) {
                    // Retrieve the ValueChart ID from the URL router parameters.
                    var name = route.params['ValueChart'];
                    // Retrieve the ValueChart password from the URL query parameters.
                    var password = route.queryParams.password;
                    // Retrieve the structure of that ValueChart that the user is joining.
                    this.valueChartHttp.getValueChartByName(name, password)
                        .subscribe(valueChart => {
                        this.valueChartService.setValueChart(valueChart);
                        resolve(true);
                    }, error => {
                        this.router.navigate(['/register'], { queryParamsHandling: "merge" }); // The ValueChart does not exist. Redirect the user to the '/register' page.
                        resolve(false);
                    });
                }
                else {
                    resolve(true);
                }
            });
        }
    };
    JoinGuard = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [router_1.Router,
            services_1.CurrentUserService,
            services_2.ValueChartService,
            http_1.ValueChartHttp])
    ], JoinGuard);
    return JoinGuard;
})();
exports.JoinGuard = JoinGuard;
//# sourceMappingURL=Join.guard.js.map