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
            (r"/ValueCharts/", ValueChartHandler),
            (r"/ValueCharts/(.*)/id", IdValueChartHandler),
            (r"/ValueCharts/(.*)/structure", StructureValueChartHandler),
            (r"/ValueCharts/(.*)/status", StatusValueChartHandler),
            (r"/ValueCharts/(.*)/users/", UsersValueChartHandler),
            (r"/ValueCharts/(.*)/users/(.*)", UsernameValueChartHandler),
            (r"/ValueCharts/(.*)", ExistingValueChartHandler),
            (r"/Users/", UserHandler),
            (r"/Users/currentUser", CurrentUserHandler),
            (r"/Users/login", LoginUserHandler),
            (r"/Users/logout", LogoutUserHandler),
            (r"/Users/(.*)/OwnedValueCharts", OwnedChartsUserHandler),
            (r"/Users/(.*)/JoinedValueCharts", JoinedChartsUserHandler),
            (r"/Users/(.*)", ExistingUserHandler),
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
        json_obj = json.loads(self.request.body, object_pairs_hook=collections.OrderedDict)
        fname = json_obj['fname']
        print ('fname: ' + fname)

        if valueChartsCollection.find_one({'fname': fname}):
            raise tornado.web.HTTPError(400) 
        else:
            try:
                inserted = valueChartsCollection.insert_one(json_obj)
            except Exception as e:
                print("exception occurred ::", e)
                raise tornado.web.HTTPError(400)
            else:
                json_obj['_id'] = str(inserted.inserted_id)
                wrapper_obj = {}
                wrapper_obj['data'] = json_obj
                self.write(json.dumps(wrapper_obj))
                self.flush()


class ExistingValueChartHandler(tornado.web.RequestHandler):
    def get(self, identifier):
        valueChartsCollection = self.application.mongo_db.ValueCharts
        password = self.get_query_argument("password", None)

        oid = bson.objectid.ObjectId(identifier)
        if bson.objectid.ObjectId.is_valid(oid):
            try:
                valueChartById = valueChartsCollection.find_one({'_id': oid, 'password': password})
            except Exception as e:
                print("exception occurred ::", e)
                raise tornado.web.HTTPError(400)
            else:
                valueChartById['_id'] = identifier
                wrapper_obj = {}
                wrapper_obj['data'] = valueChartById
                self.write(json.dumps(wrapper_obj))
                self.flush()

        else:
            try:
                valueChartByName = valueChartsCollection.find_one({'fname': identifier, 'password': password})
            except Exception as e:
                print("exception occurred ::", e)
                raise tornado.web.HTTPError(400)
            else:
                valueChartByName['_id'] = str(valueChartByName['_id'])
                wrapper_obj = {}
                wrapper_obj['data'] = valueChartByName
                self.write(json.dumps(wrapper_obj))
                self.flush()

    def put(self, identifier):
        # endpoint does not exist in frontend?
        # supposed to update an existing ValueChart or create one if it does not exist
        valueChartsCollection = self.application.mongo_db.ValueCharts
        json_obj = json.loads(self.request.body, object_pairs_hook=collections.OrderedDict)
        json_obj.pop('_id')

        print(identifier)
        oid = bson.objectid.ObjectId(identifier)
        if valueChartsCollection.find_one({'_id': oid}):
            try:
                valueChartByName = valueChartsCollection.replace_one({'_id': oid}, json_obj)
            except Exception as e:
                print("exception occurred ::", e)
                raise tornado.web.HTTPError(400)
            else:
                json_obj['_id'] = identifier
                wrapper_obj = {}
                wrapper_obj['data'] = json_obj
                self.write(json.dumps(wrapper_obj))
                self.flush()

        else:
            try:
                inserted = valueChartsCollection.insert_one(json_obj)
            except Exception as e:
                print("exception occurred ::", e)
                raise tornado.web.HTTPError(400)
            else:
                json_obj['_id'] = identifier
                wrapper_obj = {}
                wrapper_obj['data'] = json_obj
                self.write(json.dumps(wrapper_obj))
                self.flush()


    def delete(self, identifier):
        valueChartsCollection = self.application.mongo_db.ValueCharts
        try:
             valueChartsCollection.find_one_and_delete({'_id': identifier})
        except Exception as e:
            print("exception occurred ::", e)
            raise tornado.web.HTTPError(400)
        else:
            self.write('deleted')



class IdValueChartHandler(tornado.web.RequestHandler):
    def get(self, identifier):
        valueChartsCollection = self.application.mongo_db.ValueCharts        
        if valueChartsCollection.find_one({'fname': identifier}):
            self.write(json.dumps(identifier))
            self.flush()
        else:
            raise tornado.web.HTTPError(400)          


class StructureValueChartHandler(tornado.web.RequestHandler):
    def get(self, identifier):
        uri = self.request.uri.split('?')
        # get identifier (either id or name) and password from uri
        password = uri[1].split('=')[1]
        valueChartsCollection = self.application.mongo_db.ValueCharts        
        try:
            valueChart = valueChartsCollection.find_one({'fname': identifier})
        except Exception as e:
            raise tornado.web.HTTPError(400)   
        else:
            valueChart.users = None
            self.write(json.dumps(valueChart))
            self.flush()


    def put(self, chart):
        valueChartsCollection = self.application.mongo_db.ValueCharts
        identifier = chart
        json_obj = json.loads(self.request.body, object_pairs_hook=collections.OrderedDict)
        chartId = json_obj.pop('_id')
        oid = bson.objectid.ObjectId(chartId)
        if valueChartsCollection.find_one({'fname': identifier}):
            try:
                valueChart = valueChartsCollection.replace_one({'_id': oid}, json_obj)
            except Exception as e:
                print("exception occurred ::", e)
                raise tornado.web.HTTPError(400)
            else:
                json_obj['users'] = None
                json_obj['_id'] = chartId
                wrapper_obj = {}
                wrapper_obj['data'] = json_obj
                self.write(json.dumps(wrapper_obj))
                self.flush()

        else:
            raise tornado.web.HTTPError(404)



class StatusValueChartHandler(tornado.web.RequestHandler):
    def get(self, identifier):
        valueChartsCollection = self.application.mongo_db.ValueChartStatuses        
        try:
            document = valueChartsCollection.find_one({'chartId': identifier})
        except Exception as e:
            print("exception occurred ::", e)
            raise tornado.web.HTTPError(400)
        else:
            document['_id'] = str(document['_id'])
            wrapper_obj = {}
            wrapper_obj['data'] = document
            self.write(json.dumps(wrapper_obj))            
            self.write(json.dumps(document))
            self.flush()
        

    def put(self, identifier):
        valueChartsCollection = self.application.mongo_db.ValueChartStatuses
        json_obj = json.loads(self.request.body, object_pairs_hook=collections.OrderedDict)

        oid = bson.objectid.ObjectId(identifier)
        try:
            document = valueChartsCollection.find_one({'chartId': oid})
        except Exception as e:
            print("exception occurred ::", e)
            raise tornado.web.HTTPError(400)
        else:
            if document:
                try:
                    json_obj['chartId'] = oid
                    valueChart = valueChartsCollection.replace_one({'_id': oid}, json_obj)
                except Exception as e:
                    print("exception occurred ::", e)
                    raise tornado.web.HTTPError(400)
                else:
                    json_obj['_id'] = identifier
                    wrapper_obj = {}
                    wrapper_obj['data'] = json_obj
                    self.write(json.dumps(wrapper_obj))
                    self.flush()
            else:
                try:
                    inserted = valueChartsCollection.insert_one(json_obj)
                except Exception as e:
                    print("exception occurred ::", e)
                    raise tornado.web.HTTPError(400)
                else:
                    json_obj['_id'] = identifier
                    wrapper_obj = {}
                    wrapper_obj['data'] = json_obj
                    self.write(json.dumps(wrapper_obj))
                    self.flush()

    
    def delete(self, identifier):
        valueChartsCollection = self.application.mongo_db.ValueChartStatuses
        try:
             valueChartsCollection.find_one_and_delete({'chartId': identifier})
        except Exception as e:
            print("exception occurred ::", e)
            raise tornado.web.HTTPError(400)
        else:
            self.write('deleted')
            self.flush()


class UsersValueChartHandler(tornado.web.RequestHandler):
    def post(self, identifier):
        valueChartsCollection = self.application.mongo_db.ValueCharts
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
                    self.flush()
            else:
                raise tornado.web.HTTPError(404)

    
    def put(self, identifier):
        valueChartsCollection = self.application.mongo_db.ValueCharts
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
                    self.flush()
            else:
                raise tornado.web.HTTPError(404)


class UsernameValueChartHandler(tornado.web.RequestHandler):
    def put(self, identifier, username):
        valueChartsCollection = self.application.mongo_db.ValueCharts
        json_obj = json.loads(self.request.body, object_pairs_hook=collections.OrderedDict)

        oid = bson.objectid.ObjectId(identifier)
        try:
            document = valueChartsCollection.find_one({'_id': oid})
        except Exception as e:
            print("exception occurred ::", e)
            raise tornado.web.HTTPError(400)
        else:
            userExists = False
            if document is not None:
                try:
                    userIndex = document["users"].index(username)
                except Exception as e:
                    userExists = False
                    document['users'].append(json_obj)
                else:
                    userExists = True
                    document["users"][userIndex] = json_obj

                try:
                    valueChart = valueChartsCollection.replace_one({'_id': oid}, document)
                except Exception as e:
                    print("exception occurred ::", e)
                    raise tornado.web.HTTPError(400)
                else:
                    json_obj['_id'] = identifier
                    wrapper_obj = {}
                    wrapper_obj['data'] = json_obj
                    self.write(json.dumps(wrapper_obj))
                    self.flush()
            else:
                raise tornado.web.HTTPError(404)


    def delete(self, identifier, username):
        valueChartsCollection = self.application.mongo_db.ValueCharts
        uri = self.request.uri.split('/')
        json_obj = json.loads(self.request.body, object_pairs_hook=collections.OrderedDict)

        try:
            document = valueChartsCollection.find_one({'_id': identifier})
        except Exception as e:
            print("exception occurred ::", e)
            raise tornado.web.HTTPError(400)
        else:
            if document is not None:
                try:
                    userIndex = document["users"].index(username)
                except Exception as e:
                    print("exception occorred ::", e)
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
        usersCollection = self.application.mongo_db.Users        
        json_obj = json.loads(self.request.body, object_pairs_hook=collections.OrderedDict)

        if usersCollection.find_one({'username': json_obj["username"]}):
            raise tornado.web.HTTPError(400) 
        else:
            try:
                inserted = usersCollection.insert_one(json_obj)
            except Exception as e:
                print("exception occurred ::", e)
                raise tornado.web.HTTPError(400)
            else:
                self.write(self.request.body)
                self.flush()
        # figure out how to do authentication


class CurrentUserHandler(tornado.web.RequestHandler):
    def get(self):
        usersCollection = self.application.mongo_db.Users        
        json_obj = json.loads(self.request.body, object_pairs_hook=collections.OrderedDict)

        if usersCollection.find_one({'username': json_obj["username"]}):
            self.write(self.request.body)
            self.flush()
        else:
            raise tornado.web.HTTPError(400)    


class LoginUserHandler(tornado.web.RequestHandler):
    def post(self):
        usersCollection = self.application.mongo_db.Users        
        json_obj = json.loads(self.request.body, object_pairs_hook=collections.OrderedDict)
        login_result = False
        if usersCollection.find_one({'username': json_obj["username"]}):
            login_result = True
        else:
            raise tornado.web.HTTPError(400) 
        self.write(json.dumps({"data": {"username": json_obj["username"], "password":json_obj["password"], "loginResult": login_result}}))
        self.flush()


class LogoutUserHandler(tornado.web.RequestHandler):
    def get(self):
        self.write(json.dumps({"loginResult": False}))
        self.flush()
        #destroy current user session


class ExistingUserHandler(tornado.web.RequestHandler):
    def get(self, username):
        usersCollection = self.application.mongo_db.Users        
        try:
            document = usersCollection.find_one({'username': username})
        except Exception as e:
            print("exception occurred ::", e)
            raise tornado.web.HTTPError(400)
        else:
            document['_id'] = str(document['_id'])
            wrapper_obj = {}
            wrapper_obj['data'] = document
            self.write(json.dumps(wrapper_obj))
            self.flush()

    def put(self, username):
        usersCollection = self.application.mongo_db.Users        
        json_obj = json.loads(self.request.body, object_pairs_hook=collections.OrderedDict)

        try:
            document = usersCollection.replace_one({'username': username}, self.request.body)
        except Exception as e:
            print("exception occurred ::", e)
            raise tornado.web.HTTPError(400)
        else:
            json_obj["_id"] = document["_id"]
            self.write(json.dumps(json_obj))
            self.flush()
    

    def delete(self, username):
        usersCollection = self.application.mongo_db.Users
        try:
             usersCollection.find_one_and_delete({'username': username})
        except Exception as e:
            print("exception occurred ::", e)
            raise tornado.web.HTTPError(400)
        else:
            self.write('deleted')
            self.flush()


class OwnedChartsUserHandler(tornado.web.RequestHandler):
    def get(self, username):
        valueChartsCollection = self.application.mongo_db.ValueCharts
        statusCollection = self.application.mongo_db.ValueChartStatuses

        try:
            documents = valueChartsCollection.find({"creator": username})
        except Exception as e:
            print("exception occurred ::", e)
            raise tornado.web.HTTPError(400)
        else:
            summaries = []
            for doc in documents:
                try:
                    stringId = str(doc['_id'])
                    status = statusCollection.find_one({"chartId": stringId})
                except Exception as e:
                    print("exception occurred ::", e)
                    raise tornado.web.HTTPError(400)
                else:
                    if (status is not None):
                        summaries.append(
                            {"_id": stringId, "name": doc["name"], "description": doc["description"], "numUsers": len(doc["users"]),"numAlternatives": len(doc["alternatives"]),
                            "password": doc["password"], "lockedBySystem": status["lockedBySystem"], "lockedByCreator": status["lockedByCreator"]})
                    else:
                        print("exception occurred ::")
                        raise tornado.web.HTTPError(400)
            
            def get_name(summary):
                return summary["name"]
            
            summaries.sort(key=get_name)
            
            wrapper_obj = {}
            wrapper_obj['data'] = summaries
            self.write(json.dumps(wrapper_obj))
            self.flush()


class JoinedChartsUserHandler(tornado.web.RequestHandler):
    def get(self, username):
        valueChartsCollection = self.application.mongo_db.ValueCharts
        statusCollection = self.application.mongo_db.ValueChartStatuses

        try:
            documents = valueChartsCollection.find({"creator": username})
        except Exception as e:
            print("exception occurred ::", e)
            raise tornado.web.HTTPError(400)
        else:
            summaries = []
            for doc in documents:
                try:
                    stringId = str(doc['_id'])
                    status = statusCollection.find_one({"chartId": stringId})
                    
                except Exception as e:
                    print("exception occurred ::", e)
                    raise tornado.web.HTTPError(400)
                else:
                    if (status is not None):
                        summaries.append(
                            {"_id": stringId, "name": doc["name"], "description": doc["description"], "numUsers": len(doc["users"]),"numAlternatives": len(doc["alternatives"]),
                            "password": doc["password"], "lockedBySystem": status["lockedBySystem"], "lockedByCreator": status["lockedByCreator"]})
                    else:
                        print("exception occurred ::")
                        raise tornado.web.HTTPError(400)
            
            def get_name(summary):
                return summary["name"]
            
            summaries.sort(key=get_name)
            
            wrapper_obj = {}
            wrapper_obj['data'] = summaries
            self.write(json.dumps(wrapper_obj))
            self.flush()


#main function is first thing to run when application starts
def main():
    tornado.options.parse_command_line()
    #Application() refers to 'class Application'
    http_server = tornado.httpserver.HTTPServer(Application())
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.current().start()

if __name__ == "__main__":
    main()
