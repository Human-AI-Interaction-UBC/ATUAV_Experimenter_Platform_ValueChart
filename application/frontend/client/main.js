"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-05-24 09:56:10
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-06-01 17:29:03
*/
Object.defineProperty(exports, "__esModule", { value: true });
/*
    This is where the **development** application is bootstrapped. It uses the angular just-in-time compiler. Bootstrapping is when the initial components of the application are connected
    together by Angular. This should only ever be done once for an application, and it should be the first thing is that is done
    when the application is delivered to the client. The AppModule is bootstrapped here because it is the base module of our application.
    Note that there is an array in the AppModule definition called bootstrap where RootComponent is declared to be the base component of the
    application.
*/
const platform_browser_dynamic_1 = require("@angular/platform-browser-dynamic");
const app_module_1 = require("./src/app/app.module");
platform_browser_dynamic_1.platformBrowserDynamic().bootstrapModule(app_module_1.AppModule);
//# sourceMappingURL=main.js.map