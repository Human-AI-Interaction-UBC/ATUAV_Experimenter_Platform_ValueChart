"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-07-26 18:35:47
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-07-07 15:32:56
*/
Object.defineProperty(exports, "__esModule", { value: true });
/*
    In this file we configure import statements for the RxJS statics and operators that we require for our application.
    This way we can avoid importing the entirety of the VERY large set of RxjS statics and operators.
    This list of important statements should be added to whenever a new RxJS static or operator is required.

    To use import configuration, simply import this file wherever RxJS is required. This will pull in all of the
    import statements below.
*/
// Statics
require("rxjs/add/observable/throw");
require("rxjs/add/observable/fromEvent");
require("rxjs/add/observable/merge");
require("rxjs/add/observable/of");
require("rxjs/add/observable/zip");
require("rxjs/add/observable/from");
// Operators
require("rxjs/add/operator/catch");
require("rxjs/add/operator/delay");
require("rxjs/add/operator/distinctUntilChanged");
require("rxjs/add/operator/map");
require("rxjs/add/operator/switchMap");
require("rxjs/add/operator/toPromise");
require("rxjs/add/operator/multicast");
require("rxjs/add/operator/scan");
require("rxjs/add/operator/filter");
//# sourceMappingURL=rxjs-operators.js.map