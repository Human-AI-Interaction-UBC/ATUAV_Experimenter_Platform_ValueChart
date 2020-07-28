import tornado
from tornado.options import define, options
import os.path

import sqlite3
import datetime
import json
import random
import sys
import collections
from pymongo import MongoClient
import bson

# Imports required for EYE TRACKING Code:
import time
from application.backend.eye_tracker_newsdk import TobiiControllerNewSdk
from application.middleend.adaptation_loop import AdaptationLoop
from application.application_state_controller import ApplicationStateController
from application.application_web_socket import ApplicationWebSocket

from application.backend.fixation_detector import FixationDetector
from application.backend.emdat_component import EMDATComponent
from application.backend.ml_component import MLComponent
from application.backend.mouse_keyboard_event_detector import MouseKeyboardEventDetector

import params


##########################################

define("port", default=8888, help="run on the given port", type=int)
TOBII_CONTROLLER = "tobii_controller"
APPLICATION_STATE_CONTROLLER = "application_state_controller"
ADAPTATION_LOOP = "adaptation_loop"
FIXATION_ALGORITHM = "fixation_algorithm"
EMDAT_COMPONENT = "emdat_component"
ML_COMPONENT = "ml_component"
MOUSE_KEY_COMPONENT = "mouse_key_component"


class Application(tornado.web.Application):
    def __init__(self):
        #self.mmd_pilot_subset = params.PILOT_MMD_SUBSET

        #init platform and connects url with code
        self.tobii_controller = TobiiControllerNewSdk()
        self.tobii_controller.activate()
        self.app_state_control = ApplicationStateController(1)
        self.adaptation_loop = AdaptationLoop(self.app_state_control)

        self.fixation_component = FixationDetector(self.tobii_controller, self.adaptation_loop)
        self.emdat_component = EMDATComponent(self.tobii_controller, self.adaptation_loop, callback_time = params.EMDAT_CALL_PERIOD)
        self.ml_component = MLComponent(self.tobii_controller, self.adaptation_loop, callback_time = params.EMDAT_CALL_PERIOD, emdat_component = self.emdat_component)
        self.mouse_key_component = MouseKeyboardEventDetector(self.tobii_controller, self.adaptation_loop, self.emdat_component, params.USE_MOUSE, params.USE_KEYBOARD)
        websocket_dict = {TOBII_CONTROLLER: self.tobii_controller,
                         APPLICATION_STATE_CONTROLLER: self.app_state_control,
                         ADAPTATION_LOOP: self.adaptation_loop,
                         FIXATION_ALGORITHM: self.fixation_component,
                         EMDAT_COMPONENT: self.emdat_component,
                         ML_COMPONENT: self.ml_component,
                         MOUSE_KEY_COMPONENT: self.mouse_key_component}
        handlers = [
            (r"/", MainHandler),
            (r"/register", RegisterHandler),
            (r"/Valueharts/", ValueChartHandler),
            (r"/Valueharts/:chart", ExistingValueChartHandler),
            (r"/Valueharts/:chart/id", IdValueChartHandler),
            (r"/Valueharts/:chart/structure", StructureValueChartHandler),
            (r"/Valueharts/:chart/status", StatusValueChartHandler),
            (r"/Valueharts/:chart/users/", UsersValueChartHandler),
            (r"/Valueharts/:chart/users/:username", UsernameValueChartHandler),
            (r"/Users/", UserHandler),
            (r"/Users/currentUser", CurrentUserHandler),
            (r"/Users/login", LoginUserHandler),
            (r"/Users/logout", LogoutUserHandler),
            (r"/Users/:user", ExistingUserHandler),
            (r"/Users/:user/OwnedValueCharts", OwnedChartsUserHandler),
            (r"/Users/:user/JoinedValueCharts", JoinedChartsUserHandler),
            (r"/websocket", MMDWebSocket, dict(websocket_dict = websocket_dict))
        ]
        #connects to database
        self.conn = sqlite3.connect('database.db')
        # connects to database for webValueCharts
        self.mongo_client = MongoClient('mongodb://localhost:27017/')
        self.mongo_db = self.mongo_client.value_charts_db
        #"global variable" to save current UserID of session
        UserID = -1
        #global variable to track start and end times
        start_time = ''
        end_time = ''

        #where to look for the html files
        settings = dict(
            template_path=os.path.join(os.path.dirname(__file__), params.FRONT_END_TEMPLATE_PATH),
            static_path=os.path.join(os.path.dirname(__file__), params.FRONT_END_STATIC_PATH),
            debug=True,
        )
        #initializes web app
        tornado.web.Application.__init__(self, handlers, **settings)

class MMDWebSocket(ApplicationWebSocket):

    def open(self):
        self.websocket_ping_interval = 0
        self.websocket_ping_timeout = float("inf")
        self.adaptation_loop.liveWebSocket = self
        print (self.tobii_controller.eyetrackers)
        self.application.cur_mmd = 0
        self.application.cur_user = "test"

        self.start_detection_components()
        self.tobii_controller.startTracking()

    def on_message(self, message):
        print("RECEIVED MESSAGE: " + message)
        if (message == "next_task"):
            self.tobii_controller.logFixations(user_id = self.application.cur_user, task_id = self.application.cur_mmd)
            self.stop_detection_components()
            self.tobii_controller.stopTracking()
            return
        else:
            self.tobii_controller.logFixations(user_id = self.application.cur_user, task_id = self.application.cur_mmd)
            self.stop_detection_components()
            self.tobii_controller.stopTracking()
            self.tobii_controller.destroy()
            self.app_state_control.resetApplication(user_id = self.application.cur_user)
            return

    def on_close(self):
        self.app_state_control.logTask(user_id = self.application.cur_user)

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.application.start_time = str(datetime.datetime.now().time())
        self.redirect('/register')


class RegisterHandler(tornado.web.RequestHandler):
    def get(self):

        self.application.start_time = str(datetime.datetime.now().time())
        self.render('index.html')
        self.application.cur_mmd = 1


class ValueChartHandler(tornado.web.RequestHandler):
    def post(self):
        # get the valueCharts collection
        valueChartsCollection = self.application.mongo_db.ValueCharts
        fname = self.get_argument('fname')
        print ('fname: ' + fname)

        if valueChartsCollection.find_one({'fname': fname}):
            json_obj = json.loads(self.request.body, object_pairs_hook=collections.OrderedDict)

            try:
                inserted = valueChartsCollection.insert_one(self.request.body)
            except Exception as e:
                print("exception occurred ::", e)
                raise tornado.web.HTTPError(400)
            else:
                self.write(json.dumps(inserted))
                self.render('/ValueCharts/' + inserted.inserted_id)
        else:
            raise tornado.web.HTTPError(400)            

class ExistingValueChartHandler(tornado.web.RequestHandler):
    def get(self):
        valueChartsCollection = self.application.mongo_db.ValueCharts
        chart = self.get_argument('chart')
        print ('selected chart',chart)
        uri = self.request.uri.split('?')
        # get identifier (either id or name) and password from uri
        identifier = uri[0][1:]
        password = uri[1].split('=')[1]

        if bson.objectid.ObjectId.is_valid(identifier):
            try:
                valueChartByName = valueChartsCollection.find_one({'_id': identifier, 'password': password})
            except Exception as e:
                print("exception occurred ::", e)
                raise tornado.web.HTTPError(400)
            else:
                self.write(json.dumps(valueChartByName))
                self.render('/ValueCharts/' + identifier)

        else:
            try:
                valueChartById = valueChartsCollection.find_one({'fname': identifier, 'password': password})
            except Exception as e:
                print("exception occurred ::", e)
                raise tornado.web.HTTPError(400)
            else:
                self.write(json.dumps(valueChartById))
                self.render('/ValueCharts/' + identifier)

    def put(self):
        # endpoint does not exist in frontend?
        # supposed to update an existing ValueChart or create one if it does not exist
        chart = self.get_argument('chart')
        valueChartsCollection = self.application.mongo_db.ValueCharts
        identifier = ''
        json_obj = json.loads(self.request.body, object_pairs_hook=collections.OrderedDict)

        if valueChartsCollection.find_one({'_id': identifier}):
            try:
                valueChartByName = valueChartsCollection.replace_one({'_id': identifier}, self.request.body)
            except Exception as e:
                print("exception occurred ::", e)
                raise tornado.web.HTTPError(400)
            else:
                self.write(json.dumps(valueChartByName))
                self.render('/ValueCharts/' + identifier)

        else:
            try:
                inserted = valueChartsCollection.insert_one(self.request.body)
            except Exception as e:
                print("exception occurred ::", e)
                raise tornado.web.HTTPError(400)
            else:
                self.write(json.dumps(inserted))
                self.render('/ValueCharts/' + inserted.inserted_id)


    def delete(self):
        valueChartsCollection = self.application.mongo_db.ValueCharts
        identifier = self.request.uri[1:]
        try:
             valueChartsCollection.find_one_and_delete({'_id': identifier})
        except Exception as e:
            print("exception occurred ::", e)
            raise tornado.web.HTTPError(400)
        else:
            self.write('deleted')



class IdValueChartHandler(tornado.web.RequestHandler):
    def get(self):
        uri = self.request.uri.split('/')
        # get identifier (either id or name) and password from uri
        valueChartsCollection = self.application.mongo_db.ValueCharts        
        identifier = uri[0][1:]
        if valueChartsCollection.find_one({'fname': identifier}):
            self.write(json.dumps(identifier))
            self.render('/ValueCharts/' + identifier)
        else:
            raise tornado.web.HTTPError(400)          


class StructureValueChartHandler(tornado.web.RequestHandler):
    def get(self):
        uri = self.request.uri.split('?')
        # get identifier (either id or name) and password from uri
        identifier = uri[0][1:]
        password = uri[1].split('=')[1]
        valueChartsCollection = self.application.mongo_db.ValueCharts        
        try:
            valueChart = valueChartsCollection.find_one({'fname': identifier})
        except Exception as e:
            raise tornado.web.HTTPError(400)   
        else:
            valueChart.users = None
            self.write(json.dumps(valueChart))
            self.render('/ValueCharts/' + identifier + '/structure')


    def put(self):
        valueChartsCollection = self.application.mongo_db.ValueCharts
        identifier = ''
        json_obj = json.loads(self.request.body, object_pairs_hook=collections.OrderedDict)

        if valueChartsCollection.find_one({'fname': identifier}):
            try:
                valueChart = valueChartsCollection.replace_one({'_id': identifier}, self.request.body)
            except Exception as e:
                print("exception occurred ::", e)
                raise tornado.web.HTTPError(400)
            else:
                valueChart.users = None
                self.write(self.request.body)
                self.render('/ValueCharts/' + identifier)

        else:
            raise tornado.web.HTTPError(404)



class StatusValueChartHandler(tornado.web.RequestHandler):
    def get(self):
        uri = self.request.uri.split('/')
        # get identifier (either id or name) and password from uri
        valueChartsCollection = self.application.mongo_db.ValueCharts        
        identifier = uri[0][1:]
        try:
            document = valueChartsCollection.find_one({'chartId': identifier})
        except Exception as e:
            print("exception occurred ::", e)
            raise tornado.web.HTTPError(400)
        else:
            self.write(json.dumps(document))
            self.render('/ValueCharts/' + identifier + '/status')
        

    def put(self):
        valueChartsCollection = self.application.mongo_db.ValueCharts
        identifier = ''
        json_obj = json.loads(self.request.body, object_pairs_hook=collections.OrderedDict)

        try:
            document = valueChartsCollection.find_one({'chartId': identifier})
        except Exception as e:
            print("exception occurred ::", e)
            raise tornado.web.HTTPError(400)
        else:
            if document:
                try:
                    valueChart = valueChartsCollection.replace_one({'_id': document._id}, self.request.body)
                except Exception as e:
                    print("exception occurred ::", e)
                    raise tornado.web.HTTPError(400)
                else:
                    self.write(self.request.body)
                    self.render('/ValueCharts/' + identifier + '/status')
            else:
                try:
                    inserted = valueChartsCollection.insert_one(self.request.body)
                except Exception as e:
                    print("exception occurred ::", e)
                    raise tornado.web.HTTPError(400)
                else:
                    self.write(self.request.body)
                    self.render('/ValueCharts/' + inserted.inserted_id)

    
    def delete(self):
        valueChartsCollection = self.application.mongo_db.ValueCharts
        identifier = self.request.uri[1:]
        try:
             valueChartsCollection.find_one_and_delete({'chartId': identifier})
        except Exception as e:
            print("exception occurred ::", e)
            raise tornado.web.HTTPError(400)
        else:
            self.write('deleted')


class UsersValueChartHandler(tornado.web.RequestHandler):
    def post(self):
        valueChartsCollection = self.application.mongo_db.ValueCharts
        identifier = ''
        json_obj = json.loads(self.request.body, object_pairs_hook=collections.OrderedDict)

        try:
            document = valueChartsCollection.find_one({'chartId': identifier})
        except Exception as e:
            print("exception occurred ::", e)
            raise tornado.web.HTTPError(400)
        else:
            if document:
                document["users"].append(json_obj)
                try:
                    valueChart = valueChartsCollection.replace_one({'_id': document._id}, document)
                except Exception as e:
                    print("exception occurred ::", e)
                    raise tornado.web.HTTPError(400)
                else:
                    self.write(json.dumps(json_obj))
                    self.render('/ValueCharts/' + identifier + '/status')
            else:
                raise tornado.web.HTTPError(404)

    
    def put(self):
        valueChartsCollection = self.application.mongo_db.ValueCharts
        identifier = ''
        json_obj = json.loads(self.request.body, object_pairs_hook=collections.OrderedDict)

        try:
            document = valueChartsCollection.find_one({'_id': identifier})
        except Exception as e:
            print("exception occurred ::", e)
            raise tornado.web.HTTPError(400)
        else:
            if document:
                deleted_users = '' # find fn to get difference between 2 jsons by username
                new_users = ''
                try:
                    valueChart = valueChartsCollection.replace_one({'_id': document._id}, json_obj)
                except Exception as e:
                    print("exception occurred ::", e)
                    raise tornado.web.HTTPError(400)
                else:
                    self.write(json.dumps(json_obj))
                    self.render('/ValueCharts/' + identifier + '/users' + json_obj["username"])
            else:
                raise tornado.web.HTTPError(404)


class UsernameValueChartHandler(tornado.web.RequestHandler):
    def put(self):
        valueChartsCollection = self.application.mongo_db.ValueCharts
        uri = self.request.uri.split('/')
        # get identifier (either id or name) and password from uri
        identifier = uri[0][1:]
        username = uri[-1][1:]
        json_obj = json.loads(self.request.body, object_pairs_hook=collections.OrderedDict)

        try:
            document = valueChartsCollection.find_one({'_id': identifier})
        except Exception as e:
            print("exception occurred ::", e)
            raise tornado.web.HTTPError(400)
        else:
            userExists = False
            if document:
                try:
                    userIndex = document["users"].index(username)
                except Exception as e:
                    userExists = False

                else:
                    userExists = True
                    document["users"][userIndex] = json_obj

                try:
                    valueChart = valueChartsCollection.replace_one({'_id': document._id}, document)
                except Exception as e:
                    print("exception occurred ::", e)
                    raise tornado.web.HTTPError(400)
                else:
                    self.write(json.dumps(json_obj))
                    self.render('/ValueCharts/' + identifier + '/users' + json_obj["username"])
            else:
                raise tornado.web.HTTPError(404)


    def delete(self):
        valueChartsCollection = self.application.mongo_db.ValueCharts
        uri = self.request.uri.split('/')
        # get identifier (either id or name) and password from uri
        identifier = uri[0][1:]
        username = uri[-1][1:]
        json_obj = json.loads(self.request.body, object_pairs_hook=collections.OrderedDict)

        try:
            document = valueChartsCollection.find_one({'_id': identifier})
        except Exception as e:
            print("exception occurred ::", e)
            raise tornado.web.HTTPError(400)
        else:
            if document:
                try:
                    userIndex = document["users"].index(username)
                except Exception as e:
                    break
                else:
                    document["users"].pop(userIndex) # not sure what index to use for pop, or if there is better way to rm elem
                    try:
                        valueChart = valueChartsCollection.replace_one({'_id': document._id}, document)
                    except Exception as e:
                        print("exception occurred ::", e)
                        raise tornado.web.HTTPError(400)
            else:
                raise tornado.web.HTTPError(404)



class UserHandler(tornado.web.RequestHandler):
    def post(self):
        json_obj = json.loads(self.request.body, object_pairs_hook=collections.OrderedDict)

        self.write(json.dumps({"username": json_obj["users"][0].username, "password":json_obj["users"][0].password}))
        # figure out how to do authentication


class CurrentUserHandler(tornado.web.RequestHandler):
    def get(self):
        json_obj = json.loads(self.request.body, object_pairs_hook=collections.OrderedDict)
        is_authenticated = True
        if is_authenticated:
            self.write(json.dumps({"username": json_obj["users"][0].username, "password":json_obj["users"][0].password, "loginResult": is_authenticated}))
        else:
            self.write({"loginResult": is_authenticated})


class LoginUserHandler(tornado.web.RequestHandler):
    def post(self):
        json_obj = json.loads(self.request.body, object_pairs_hook=collections.OrderedDict)
        self.write(json.dumps({"username": json_obj["users"][0].username, "password":json_obj["users"][0].password, "loginResult": True}))


class LogoutUserHandler(tornado.web.RequestHandler):
    def get(self):
        json_obj = json.loads(self.request.body, object_pairs_hook=collections.OrderedDict)

        self.write(json.dumps({"username": json_obj["users"][0].username, "password":json_obj["users"][0].password}))
        #destroy current user session


class ExistingUserHandler(tornado.web.RequestHandler):
    def get(self):
        valueChartsCollection = self.application.mongo_db.ValueCharts
        users_list = self.loadUsersList()
        self.render('resume.html', users = users_list)

    def put(self):
        valueChartsCollection = self.application.mongo_db.ValueCharts
        userOptions = self.get_argument('userOptions')
        self.application.cur_user = userOptions
        query_results = self.application.conn.execute('select * from study_progress where user_id=' + str(userOptions))
        user_data = query_results.fetchall()
    

    def delete(self):
        valueChartsCollection = self.application.mongo_db.ValueCharts
        #stub


class OwnedChartsUserHandler(tornado.web.RequestHandler):
    def get(self):
        valueChartsCollection = self.application.mongo_db.ValueCharts


class JoinedChartsUserHandler(tornado.web.RequestHandler):
    def get(self):
        valueChartsCollection = self.application.mongo_db.ValueCharts


#main function is first thing to run when application starts
def main():
    tornado.options.parse_command_line()
    #Application() refers to 'class Application'
    http_server = tornado.httpserver.HTTPServer(Application())
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.current().start()

if __name__ == "__main__":
    main()
