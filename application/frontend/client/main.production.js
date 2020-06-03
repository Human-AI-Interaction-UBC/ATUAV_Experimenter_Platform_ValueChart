"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-05-24 09:56:10
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-05-17 11:09:59
*/
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular/core");
// Enable production mode unless running locally
if (!/localhost/.test(document.location.host)) {
    core_1.enableProdMode();
}
/*
    This is where the **deployed** application is bootstrapped. It uses the angular head-of-time compiler. Bootstrapping is when the initial components of the application are connected
    together by Angular. This should only ever be done once for an application, and it should be the first thing is that is done
    when the application is delivered to the client. The AppModule is bootstrapped here because it is the base module of our application.
    Note that there is an array in the AppModule definition called bootstrap where RootComponent is declared to be the base component of the
    application.
*/
const platform_browser_1 = require("@angular/platform-browser");
const app_module_ngfactory_1 = require("../aot/client/src/app/app.module.ngfactory");
platform_browser_1.platformBrowser().bootstrapModuleFactory(app_module_ngfactory_1.AppModuleNgFactory);
//# sourceMappingURL=main.production.js.map