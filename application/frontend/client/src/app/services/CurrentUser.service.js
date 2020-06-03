"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-06-15 18:28:22
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-08-16 17:18:45
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
exports.CurrentUserService = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
/*
    This class contains all useful information about the current application-level user, which it exposes to any component, directive,
    or other service that requires it. Currently, this information is limited to the username, and login status of the current user. Many components require this class to determine
    what functionality the user should be allowed to access. The My Account page is an excellent example of this; users that are temporary and not
    logged in will not be allowed to reach this page. The application level router (app.routes.ts) also uses this service to determine whether users
    are allowed to leave the register page. The username field of this class MUST be defined before the router will allow users to view any other page
    of application. See app.routes.ts and AuthGuard for more information about this.
*/
let CurrentUserService = /** @class */ (() => {
    let CurrentUserService = class CurrentUserService {
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        /*
            @returns {void}
            @description 	Used for Angular's dependency injection ONLY. It should not be used to do any initialization of the class.
                            This constructor will be called automatically when Angular constructs an instance of this class prior to dependency injection.
        */
        constructor() { }
        // ========================================================================================
        // 									Methods
        // ========================================================================================
        getUsername() {
            return this.username;
        }
        setUsername(username) {
            this.username = username;
        }
        setLoggedIn(loggedIn) {
            this.loggedIn = loggedIn;
        }
        isLoggedIn() {
            return this.loggedIn;
        }
    };
    CurrentUserService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [])
    ], CurrentUserService);
    return CurrentUserService;
})();
exports.CurrentUserService = CurrentUserService;
//# sourceMappingURL=CurrentUser.service.js.map