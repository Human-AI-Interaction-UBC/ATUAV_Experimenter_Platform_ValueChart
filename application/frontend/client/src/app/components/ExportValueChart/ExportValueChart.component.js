"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-07-02 12:20:59
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-08-16 14:48:47
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
exports.ExportValueChartComponent = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
// Import Application Classes:
const services_1 = require("../../services");
const utilities_1 = require("../../utilities");
/*
    This component implements a button that can be used to download the current ValueChart as an XML file. Current ValueChart refers
    to the active ValueChart in the ValueChartService.
*/
let ExportValueChartComponent = /** @class */ (() => {
    let ExportValueChartComponent = class ExportValueChartComponent {
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        /*
            @returns {void}
            @description 	Used for Angular's dependency injection ONLY. It should not be used to do any initialization of the class.
                            This constructor will be called automatically when Angular constructs an instance of this class prior to dependency injection.
        */
        constructor(valueChartService) {
            this.valueChartService = valueChartService;
        }
        // ========================================================================================
        // 									Methods
        // ========================================================================================
        /*
            @returns {void}
            @description 	Initializes the ValueChartViewer. ngOnInit is only called ONCE by Angular. This function is thus used for one-time initialized only.
                            Calling ngOnInit should be left to Angular. Do not call it manually. All initialization logic for the component should be put in this
                            method rather than in the constructor.
        */
        ngOnInit() {
            this.xmlValueChartEncoder = new utilities_1.XmlValueChartEncoder();
            this.downloadLink = document.querySelector('#download-value-chart');
        }
        getValueChartName() {
            if (this.valueChartService.valueChartIsDefined()) {
                return this.valueChartService.getValueChart().getFName() + '.xml';
            }
            else {
                return '';
            }
        }
        downloadValueChart() {
            var valueChart = this.valueChartService.getValueChart();
            var valueChartObjectURL = this.convertValueChartIntoObjectURL(valueChart);
            this.downloadLink.setAttribute('href', valueChartObjectURL); // Set the download link on the <a> element to be the URL created for the XML string.
            $(this.downloadLink).click(); // Click the <a> element to programmatically begin the download.
        }
        convertValueChartIntoObjectURL(valueChart) {
            if (valueChart === undefined)
                return;
            // Obtain a XML string for the user defined weights in the given ValueChart. 
            var valueChartString = this.xmlValueChartEncoder.encodeValueChart(valueChart);
            // Convert the string into a blob. We must do this before we can create a download URL for the XML string.
            var valueChartBlob = new Blob([valueChartString], { type: 'text/xml' });
            // Create an return a unique download URL for the XML string.
            return URL.createObjectURL(valueChartBlob);
        }
    };
    ExportValueChartComponent = __decorate([
        core_1.Component({
            selector: 'ExportValueChart',
            template: `
				<a class="btn btn-default pull-left" id="download-value-chart" 
					[class.disabled]="!valueChartService.valueChartIsDefined()" 
					download="{{getValueChartName()}}" 
					href="javascript:void(0)" 
					(click)="downloadValueChart()" >
					Export Chart
				</a>
				`
        }),
        __metadata("design:paramtypes", [services_1.ValueChartService])
    ], ExportValueChartComponent);
    return ExportValueChartComponent;
})();
exports.ExportValueChartComponent = ExportValueChartComponent;
//# sourceMappingURL=ExportValueChart.component.js.map