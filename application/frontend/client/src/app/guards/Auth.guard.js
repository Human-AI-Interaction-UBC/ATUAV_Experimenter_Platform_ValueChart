"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-08-05 16:07:21
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-07-05 20:35:16
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
exports.AuthGuard = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
const router_1 = require("@angular/router");
// Import Application Classes:
const services_1 = require("../services");
const services_2 = require("../services");
const http_1 = require("../http");
/*
    AuthGuard is an Angular service that is used to manage user access to all front-end routes depending on a user's
    authentication status. It allows authenticated users (either temporary or permanent) to navigate to any route in the application,
    but will redirect all users that are not logged in to the '/register' route no matter what route they attempt to navigate to. This
    is how the application implements a login wall.

    The AuthGuard is used by registering the class in the canActivate array of a route's definition. See app.routes.ts for an example of this.
    Then, when a user attempts to navigate to that route, the router calls the canActivate inside AuthGuard. Navigation is permitted if this
    methods returns true, and blocked if false. Note that false simply prevents navigation; it does not redirect the user to '/navigate'.
*/
let AuthGuard = /** @class */ (() => {
    let AuthGuard = class AuthGuard {
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        /*
            @returns {void}
            @description 	Used for Angular's dependency injection ONLY. It should not be used to do any initialization of the class.
                            This constructor will be called automatically when Angular constructs an instance of this class prior to dependency injection.
        */
        constructor(router, userHttp, currentUserService, valueChartService) {
            this.router = router;
            this.userHttp = userHttp;
            this.currentUserService = currentUserService;
            this.valueChartService = valueChartService;
        }
        // ========================================================================================
        // 									Methods
        // ========================================================================================
        /*
            @returns {boolean} - Whether navigation to the activated route will be permitted or not.
            @description 	Used by the Angular router to determine whether a the current user will be permitted to navigate to the newly activated route.
                            This method should NEVER be called manually. Leave routing, and calling of the canActivate, canDeactivate, etc. classes
                            to the Angular 2 router.
        */
        canActivate(route, state) {
            return new Promise((resolve, reject) => {
                let username = this.currentUserService.getUsername();
                if (!username) {
                    this.userHttp.getCurrentUser().subscribe((user) => {
                        if (user.loginResult) {
                            this.currentUserService.setLoggedIn(true);
                            this.currentUserService.setUsername(user.username);
                            if (state.url.indexOf('create') !== -1) { // Redirect to home if the user was creating or viewing a ValueChart, or attempting to reach register when they are logged in.
                                this.router.navigate(['/home']);
                                resolve(false);
                            }
                            else {
                                resolve(true); // Allow the user to navigate to the activated route.
                            }
                        }
                        else {
                            this.currentUserService.setLoggedIn(false);
                            this.router.navigate(['/register']); // Redirect the user to register, which is the only route they are allowed to view if they are not authenticated.
                            resolve(false); // Prevent the current navigation.
                        }
                    });
                }
                else {
                    resolve(true);
                }
            });
        }
    };
    AuthGuard = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [router_1.Router,
            http_1.UserHttp,
            services_1.CurrentUserService,
            services_2.ValueChartService])
    ], AuthGuard);
    return AuthGuard;
})();
exports.AuthGuard = AuthGuard;
//# sourceMappingURL=Auth.guard.js.map