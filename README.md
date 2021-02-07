[![CircleCI](https://circleci.com/gh/ValueChart/WebValueCharts.svg?style=svg)](https://circleci.com/gh/ValueChart/WebValueCharts)

# Web ValueCharts integration

This is an integration of the webValueCharts into the experiment platform. More information about ValueCharts can be found at the [project website](http://www.cs.ubc.ca/group/iui/VALUECHARTS/).

## Compiling the frontend

As the frontend is written in Typescript, it must be compiled into javascript before running the webSocket application from python.
Make sure to run `tsc` after making any frontend changes, or they will not be reflected in the application.

## Running the application

To run the application, simply run `python <your_experiment_file_name>.py` and open `localhost:8888`
