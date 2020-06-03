"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-08-18 10:15:19
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-05-16 12:22:21
*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
const platform_browser_1 = require("@angular/platform-browser");
const forms_1 = require("@angular/forms");
const http_1 = require("@angular/http");
// Import Application Classes:
const app_routes_1 = require("./app.routes");
// Components:
const components_1 = require("./components");
const components_2 = require("./components");
const components_3 = require("./components");
const components_4 = require("./components");
const components_5 = require("./components");
const components_6 = require("./components");
const components_7 = require("./components");
const components_8 = require("./components");
const components_9 = require("./components");
const components_10 = require("./components");
const components_11 = require("./components");
const components_12 = require("./components");
const components_13 = require("./components");
const components_14 = require("./components");
const components_15 = require("./components");
const components_16 = require("./components");
const components_17 = require("./components");
// Modules:
const ValueChartVis_1 = require("../ValueChartVis");
/*
    This is the AppModule declaration. It creates the AppModule, imports whatever modules it depends on, registers
    the components that belong to it, registers required providers, and defines the component that should be bootstrapped.
    The AppModule is the base module of WebValueCharts. It has the main application router (ROUTER), and is responsible for all
    application functionality with the exception of ValueChart creation, which the delegates to the CreateModule.
*/
let AppModule = /** @class */ (() => {
    let AppModule = class AppModule {
    };
    AppModule = __decorate([
        core_1.NgModule({
            // Import all required modules.
            imports: [
                platform_browser_1.BrowserModule,
                forms_1.FormsModule,
                http_1.HttpModule,
                app_routes_1.ROUTER,
                ValueChartVis_1.ValueChartVisModule
            ],
            // All Components and Directives that belong to this module MUST be declared here. Any modules that are shared between AppModule and another module
            // must be declared in the UtilitiesModule instead and imported via that module.
            declarations: [
                components_1.RootComponent,
                components_2.RegisterComponent,
                components_3.HomeComponent,
                components_4.ValueChartViewerComponent,
                components_5.DetailBoxComponent,
                components_6.ViewOptionsComponent,
                components_7.InteractionOptionsComponent,
                components_8.AccountComponent,
                components_9.ScoreFunctionViewerComponent,
                components_10.ExportValueChartComponent,
                components_11.CreateValueChartComponent,
                components_12.CreateAlternativesComponent,
                components_13.CreateBasicInfoComponent,
                components_14.CreateObjectivesComponent,
                components_15.CreateScoreFunctionsComponent,
                components_16.CreateWeightsComponent,
                components_17.NotificationModalComponent
            ],
            // Register any required providers. This is just the Router providers.
            providers: [
                app_routes_1.APP_ROUTER_PROVIDERS,
            ],
            // Set the RootComponent to be the AppModules' base component.
            bootstrap: [
                components_1.RootComponent
            ]
        })
    ], AppModule);
    return AppModule;
})();
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map