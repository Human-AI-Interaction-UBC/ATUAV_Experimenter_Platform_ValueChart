"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2017-07-17 11:35:58
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-07-17 11:55:33
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
exports.UserNotificationService = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
let UserNotificationService = /** @class */ (() => {
    var UserNotificationService_1;
    let UserNotificationService = UserNotificationService_1 = class UserNotificationService {
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        /*
            @returns {void}
            @description 	Used for Angular's dependency injection ONLY. Unfortunately we are forced to assign handlers to the Undo/Redo services event emitters in this
                            method.
                            This constructor will be called automatically when Angular constructs an instance of this class prior to dependency injection.
        */
        constructor() {
            // Set global toastr settings
            toastr.options.newestOnTop = false;
        }
        displayErrors(errors) {
            errors.forEach(error => toastr.error(error, '', { timeOut: UserNotificationService_1.ERROR_TIMEOUT, extendedTimeOut: UserNotificationService_1.ERROR_TIMEOUT, closeButton: true }));
        }
        displayWarnings(warnings) {
            warnings.forEach(warning => toastr.warning(warning, '', { timeOut: UserNotificationService_1.WARNING_TIMEOUT, closeButton: false }));
        }
        displayInfo(info) {
            info.forEach(msg => toastr.info(msg, '', { timeOut: UserNotificationService_1.INFO_TIMOUT, closeButton: false }));
        }
        displaySuccesses(successes) {
            successes.forEach(success => toastr.success(success, '', { timeOut: UserNotificationService_1.SUCCESS_TIMEOUT, closeButton: false }));
        }
    };
    // ========================================================================================
    // 									Fields
    // ========================================================================================
    UserNotificationService.ERROR_TIMEOUT = 0; // Errors that must be addressed can only be dismissed manually.
    UserNotificationService.WARNING_TIMEOUT = 20000; // 20 second timeout for warnings that don't need to be addressed.
    UserNotificationService.SUCCESS_TIMEOUT = 5000; // 5 second timeout for successful action notifications.
    UserNotificationService.INFO_TIMOUT = 20000; // 20 second timeout for update/information notifications.
    UserNotificationService = UserNotificationService_1 = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [])
    ], UserNotificationService);
    return UserNotificationService;
})();
exports.UserNotificationService = UserNotificationService;
//# sourceMappingURL=UserNotification.service.js.map