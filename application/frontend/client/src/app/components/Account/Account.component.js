"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-08-04 16:30:08
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-06-13 12:28:49
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
exports.AccountComponent = void 0;
const core_1 = require("@angular/core");
// Application classes
const services_1 = require("../../services");
const http_1 = require("../../http");
/*
    This component implements the My Account page. It allows authenticated (i.e. signed in) users to modify their
    account's email and password. Users are NOT allowed to modify their username. It uses the the userHttp to
    communicate with the server and change user account details.
*/
let AccountComponent = /** @class */ (() => {
    let AccountComponent = class AccountComponent {
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        /*
            @returns {void}
            @description 	Used for Angular's dependency injection ONLY. It should not be used to do any initialization of the class.
                            This constructor will be called automatically when Angular constructs an instance of this class prior to dependency injection.
        */
        constructor(currentUserService, userHttp) {
            this.currentUserService = currentUserService;
            this.userHttp = userHttp;
            // ========================================================================================
            // 									Fields
            // ========================================================================================
            this.username = this.currentUserService.getUsername();
        }
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        /*
            @returns {void}
            @description 	Initializes the ValueChartViewer. ngOnInit is only called ONCE by Angular. This function is thus used for one-time initialized only.
                            Calling ngOnInit should be left to Angular. Do not call it manually. All initialization logic for this component should be put in this
                            method rather than in the constructor.
        */
        ngOnInit() {
            this.userHttp.getUser(this.username)
                .subscribe(user => {
                this.password = user.password;
                this.rePassword = user.password;
                this.email = user.email;
            });
        }
        updateUser(username, password, email) {
            this.validatePasswords(this.password, this.rePassword);
            if (this.invalidCredentials)
                return;
            this.userHttp.updateUser(username, password, email)
                .subscribe(user => { this.credentialsUpdated = true; });
        }
        validatePasswords(passwordOne, passwordTwo) {
            if (passwordOne !== passwordTwo) {
                this.invalidMessage = 'The entered passwords do not match';
                this.invalidCredentials = true;
            }
            else {
                this.invalidCredentials = false;
                this.invalidMessage = '';
            }
        }
    };
    AccountComponent = __decorate([
        core_1.Component({
            selector: 'account',
            templateUrl: './Account.template.html',
        }),
        __metadata("design:paramtypes", [services_1.CurrentUserService,
            http_1.UserHttp])
    ], AccountComponent);
    return AccountComponent;
})();
exports.AccountComponent = AccountComponent;
//# sourceMappingURL=Account.component.js.map