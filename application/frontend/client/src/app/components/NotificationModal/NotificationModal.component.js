"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2017-07-17 12:55:57
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-07-19 13:40:37
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
exports.NotificationModalComponent = void 0;
const core_1 = require("@angular/core");
const core_2 = require("@angular/core");
/*
    The notification modal is configurable and reusable notification modal window. It can be used in two main scenarios:
        1. Notifying the user of something using arbitrary text. In this case the modal window ONLY has an "OK"-type button.
        2. Requesting a user confirmation or action. In this case the modal has a "NO" and "YES" type buttons. This is referred to as "action enabled".
    The component can be toggle between the two modes via the component inputs, which is also where the button handlers,
    button text, modal title, and modal body text are set.
*/
let NotificationModalComponent = /** @class */ (() => {
    let NotificationModalComponent = class NotificationModalComponent {
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        /*
            @returns {void}
            @description 	Used for Angular's dependency injection ONLY. It should not be used to do any initialization of the class.
                            This constructor will be called automatically when Angular constructs an instance of this class prior to dependency injection.
        */
        constructor(elementRef) {
            this.elementRef = elementRef;
            // ========================================================================================
            // 									Fields
            // ========================================================================================
            // Whether or not the modal is currently being displayed.
            this.displayModal = false;
            this.title = ''; // The modal title text.
            this.body = ''; // The modal body text.
            this.actionEnabled = false; // Whether or not the modal window implements an action/decision or simply a confirmation.
            this.noActionText = ''; // The text for the "NO" type button if action is enabled.
            this.actionText = ''; // The text for the "YES" type button if action is enabled.
            this.noActionFunction = () => { }; // The "NO" action function that will be called when the "NO" button is clicked. Does nothing by default
            this.actionFunction = () => { }; // The "YES" action function that will be called when the "YES" button is clicked. Does nothing by default
            this.modalClosed = new core_2.EventEmitter(); // An output that notifies listeners of when the modal is closed.
        }
        // Toggle the display of the modal window.
        set display(display) {
            this.displayModal = display;
            let modalElement = $(this.elementRef.nativeElement).find('#notification-modal');
            if (display)
                modalElement.modal('show');
            else
                modalElement.modal('hide');
        }
        ngOnInit() {
            // Emit events via the modalClosed output when the modal window is closed.
            $(this.elementRef.nativeElement).find('#notification-modal').on('hide.bs.modal', (event) => { this.modalClosed.emit(false); });
        }
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], NotificationModalComponent.prototype, "display", null);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], NotificationModalComponent.prototype, "title", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], NotificationModalComponent.prototype, "body", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], NotificationModalComponent.prototype, "actionEnabled", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], NotificationModalComponent.prototype, "noActionText", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], NotificationModalComponent.prototype, "actionText", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Function)
    ], NotificationModalComponent.prototype, "noActionFunction", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Function)
    ], NotificationModalComponent.prototype, "actionFunction", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], NotificationModalComponent.prototype, "modalClosed", void 0);
    NotificationModalComponent = __decorate([
        core_1.Component({
            selector: 'NotificationModal',
            templateUrl: './NotificationModal.template.html',
            providers: []
        }),
        __metadata("design:paramtypes", [core_2.ElementRef])
    ], NotificationModalComponent);
    return NotificationModalComponent;
})();
exports.NotificationModalComponent = NotificationModalComponent;
//# sourceMappingURL=NotificationModal.component.js.map