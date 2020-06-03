"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-05-24 09:56:10
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-07-06 21:27:16
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
exports.RegisterComponent = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
const router_1 = require("@angular/router");
// Import Application Classes:
const services_1 = require("../../services");
const http_1 = require("../../http");
// Import Types
const types_1 = require("../../../types");
const types_2 = require("../../../types");
/*
    This component implements the user login and account creation page. It allows users to login to the ValueCharts application
    as using an account that they have created previously, or as temporary users with no account. Temporary users do
    not have access to account related aspects of the application like the My Account, and My ValueCharts pages, but they do allow
    users to create, host and join ValueCharts. The register component also allows users to create a new account whenever they want.

    The register component is also the landing page for the application. This means that users who navigate to the base URL of the
    app are directed to this component. Additionally, it is the only component that the router will display to users who are not
    authenticated. See app.routes.ts for more information about the authentication wall.
*/
let RegisterComponent = /** @class */ (() => {
    let RegisterComponent = class RegisterComponent {
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        /*
            @returns {void}
            @description 	Used for Angular's dependency injection ONLY. It should not be used to do any initialization of the class.
                            This constructor will be called automatically when Angular constructs an instance of this class prior to dependency injection.
        */
        constructor(router, currentUserService, userHttp) {
            this.router = router;
            this.currentUserService = currentUserService;
            this.userHttp = userHttp;
            this.state = 'login';
        }
        // ========================================================================================
        // 									Methods
        // ========================================================================================
        createNewUser(username, password, email) {
            if (this.invalidPasswords || this.invalidUsername)
                return;
            this.userHttp.createNewUser(username, password, email)
                .subscribe((user) => {
                this.currentUserService.setLoggedIn(true);
                this.setUsername(username);
            }, (error) => {
                this.invalidMessage = 'That username is already taken.';
                this.invalidUsername = true;
            });
        }
        login(username, password) {
            this.userHttp.login(username, password)
                .subscribe((user) => {
                this.currentUserService.setLoggedIn(true);
                this.setUsername(username);
            }, (error) => {
                this.invalidMessage = 'That username and password combination is not correct.';
                this.invalidPasswords = true;
            });
        }
        validatePasswords(passwordOne, passwordTwo) {
            if (passwordOne !== passwordTwo) {
                this.invalidMessage = 'The entered passwords do not match.';
                this.invalidPasswords = true;
            }
            else {
                this.invalidPasswords = false;
                this.invalidMessage = '';
            }
        }
        continueAsTempUser(username) {
            $('#temporary-user-modal').modal('hide');
            this.currentUserService.setLoggedIn(false);
            this.setUsername(username);
        }
        setUsername(username) {
            this.currentUserService.setUsername(username);
            // If the user is joining a chart, then navigate to createValueChart
            if (document.location.href.indexOf('newUser') !== -1) {
                this.router.navigate(['create', types_2.CreatePurpose.NewUser, 'ScoreFunctions'], { queryParams: { role: types_1.UserRole.UnsavedParticipant } });
            }
            else { // Else, navigate to the create page as normal
                this.router.navigate(['home']);
            }
        }
    };
    RegisterComponent = __decorate([
        core_1.Component({
            selector: 'register',
            templateUrl: './Register.template.html',
        }),
        __metadata("design:paramtypes", [router_1.Router,
            services_1.CurrentUserService,
            http_1.UserHttp])
    ], RegisterComponent);
    return RegisterComponent;
})();
exports.RegisterComponent = RegisterComponent;
//# sourceMappingURL=Register.component.js.map