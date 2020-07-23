import tornado
from tornado.options import define, options
import os.path

import sqlite3
import datetime
import json
import random
import sys
import collections

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
            (r"/host/:chart", HostHandler),
            (r"/websocket", MMDWebSocket, dict(websocket_dict = websocket_dict))
        ]
        #connects to database
        self.conn = sqlite3.connect('database.db')
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
        chart = self.get_argument('chart')
        print ('selected chart',chart)
        query_results = self.application.conn.execute('select * from VALUE CHART DB where chart=' + str(chart))
        chart_data = query_results.fetchall()
        json_obj = json.loads(self.request.body, object_pairs_hook=collections.OrderedDict)
        if (len(chart_data) != 0):
            raise tornado.web.HTTPError(400)
        else:
            self.application.conn.execute('INSERT INTO value chart db VALUES (?,?,?,?,?)', json_obj)
            self.application.conn.commit()
            self.render('/ValueCharts/' + json_obj['_id'])

class ExistingValueChartHandler(tornado.web.RequestHandler):
    def get(self):
        chart = self.get_argument('chart')
        print ('selected chart',chart)
        uri = self.request.uri.split('?')
        # get identifier (either id or name) and password from uri
        identifier = uri[0][1:]
        password = uri[1].split('=')[1]
        query_results = self.application.conn.execute('select * from VALUE CHART DB where chart=' + str(chart))
        chart_data = query_results.fetchall()
       
        if (len(chart_data) != 0):
            raise tornado.web.HTTPError(400)
        else:
            by_id = self.application.conn.execute('select * from VALUE CHART DB where id=' + str(identifier) + 'and password=' + str(password))
            id_results = by_id.fetchall()
            by_name = self.application.conn.execute('select * from VALUE CHART DB where fname=' + str(identifier) + 'and password=' + str(password))
            name_results = by_name.fetchall()
            if (len(id_results) > 0 or len(name_results) > 0):
                self.render('/ValueCharts/' + identifier)
                self.write(json.dumps(id_results)) if len(id_results) > 0 else self.write(json.dumps(name_results))
            else:
                raise tornado.web.HTTPError(404)

    def put(self):
        # endpoint does not exist in frontend?
        # supposed to update an existing ValueChart or create one if it does not exist
        chart = self.get_argument('chart')
        
        query_results = self.application.conn.execute('select * from study_progress where user_id=' + str(userOptions))
        user_data = query_results.fetchall()

    def delete(self):
        chart = self.get_argument('chart')
        identifier = self.request.uri[1:]

        self.application.conn.execute('delete from VALUE CHART DB where id=' + identifier)
        self.application.conn.commit()



class IdValueChartHandler(tornado.web.RequestHandler):
    def get(self):
        uri = self.request.uri.split('/')
        # get identifier (either id or name) and password from uri
        identifier = uri[0][1:]
        query_results = self.application.conn.execute('select * from VALUE CHART DB where id=' + str(identifier))
        chart_data = query_results.fetchall()
       
        if (len(chart_data) != 0):
            self.render('/ValueCharts/' + identifier)
            self.write(json.dumps(identifier))
        else:
           raise tornado.web.HTTPError(404)


class StructureValueChartHandler(tornado.web.RequestHandler):
    def get(self):
        users_list = self.loadUsersList()
        self.render('resume.html', users = users_list)

    def post(self):
        userOptions = self.get_argument('userOptions')
        self.application.cur_user = userOptions
        query_results = self.application.conn.execute('select * from study_progress where user_id=' + str(userOptions))
        user_data = query_results.fetchall()


class StatusValueChartHandler(tornado.web.RequestHandler):
    def get(self):
        users_list = self.loadUsersList()
        self.render('resume.html', users = users_list)

    def put(self):
        userOptions = self.get_argument('userOptions')
        self.application.cur_user = userOptions
        query_results = self.application.conn.execute('select * from study_progress where user_id=' + str(userOptions))
        user_data = query_results.fetchall()


class UsersValueChartHandler(tornado.web.RequestHandler):
    def get(self):
        users_list = self.loadUsersList()
        self.render('resume.html', users = users_list)

    def post(self):
        userOptions = self.get_argument('userOptions')
        self.application.cur_user = userOptions
        query_results = self.application.conn.execute('select * from study_progress where user_id=' + str(userOptions))
        user_data = query_results.fetchall()


class UsernameValueChartHandler(tornado.web.RequestHandler):
    def get(self):
        users_list = self.loadUsersList()
        self.render('resume.html', users = users_list)

    def post(self):
        userOptions = self.get_argument('userOptions')
        self.application.cur_user = userOptions
        query_results = self.application.conn.execute('select * from study_progress where user_id=' + str(userOptions))
        user_data = query_results.fetchall()



class UserHandler(tornado.web.RequestHandler):
    def get(self):
        #displays contents of index.html
        self.application.start_time = str(datetime.datetime.now().time())
        mmdQuestions = self.loadMMDQuestions()
        noofMMD = len(self.application.mmd_order)
        progress = str(self.application.mmd_index)+ ' of '+ str(noofMMD)
        self.render('questionnaire.html', mmd=self.application.cur_mmd, progress = progress, questions = mmdQuestions)
        print("finished rendering qustionnaire")


    def post(self):
        answers = self.get_argument('answers')

        answers = json.loads(answers)


        self.application.end_time = str(datetime.datetime.now().time())
        questionnaire_data = [
        self.application.cur_user, self.application.cur_mmd, self.application.start_time, self.application.end_time]

        task_data = (self.application.cur_user, self.application.cur_mmd,'questions' ,self.application.start_time, self.application.end_time)
        self.application.conn.execute('INSERT INTO MMD_performance VALUES (?,?,?,?,?)', task_data)
        self.application.conn.commit()

        i =1
        for a in answers:
            #questionnaire_data.append(a)
            answer_data = (self.application.cur_user, self.application.cur_mmd,i, a[0],a[1])
            self.application.conn.execute('INSERT INTO Questions_results VALUES (?,?,?,?,?)', answer_data)
            i = i+1

        #print tuple(questionnaire_data)


        self.application.conn.commit()

        self.application.conn.execute('INSERT INTO Study_progress VALUES (?,?,?,?)', [  self.application.cur_user,'mmd' ,self.application.cur_mmd, str(datetime.datetime.now().time())])
        self.application.conn.commit()
        #refers to database connected to in 'class Application'
        #database = self.application.db.database
        #empty entry to insert into database in order to generate a user id
        #entry = {}
        #inserts empty entry and saves it to UserID variable in 'class Application'
        #self.application.UserID = database.insert_one(entry).inserted_id
        #print self.application.UserID

        self.redirect('/mmd')

    def loadMMDQuestions (self):
        conn = sqlite3.connect('database_questions.db')
        query_results = conn.execute('select * from MMD_questions where mmd_id='+str(self.application.cur_mmd))

        # hard-coded two questions as they appear in all mmds
        questions = []
        questions.append([self.application.cur_mmd, "1", "The snippet I read was easy to understand.", "Likert", "Subjective"])
        questions.append([self.application.cur_mmd, "2", "I would be interested in reading the full article.", "Likert", "Subjective"])
        questions.extend(query_results.fetchall())

        return json.dumps(questions)


class CurrentUserHandler(tornado.web.RequestHandler):
    def get(self):
        users_list = self.loadUsersList()
        self.render('resume.html', users = users_list)

    def post(self):
        userOptions = self.get_argument('userOptions')
        self.application.cur_user = userOptions
        query_results = self.application.conn.execute('select * from study_progress where user_id=' + str(userOptions))
        user_data = query_results.fetchall()


class LoginUserHandler(tornado.web.RequestHandler):
    def get(self):
        users_list = self.loadUsersList()
        self.render('resume.html', users = users_list)

    def post(self):
        userOptions = self.get_argument('userOptions')
        self.application.cur_user = userOptions
        query_results = self.application.conn.execute('select * from study_progress where user_id=' + str(userOptions))
        user_data = query_results.fetchall()


class LogoutUserHandler(tornado.web.RequestHandler):
    def get(self):
        users_list = self.loadUsersList()
        self.render('resume.html', users = users_list)

    def post(self):
        userOptions = self.get_argument('userOptions')
        self.application.cur_user = userOptions
        query_results = self.application.conn.execute('select * from study_progress where user_id=' + str(userOptions))
        user_data = query_results.fetchall()


class ExistingUserHandler(tornado.web.RequestHandler):
    def get(self):
        users_list = self.loadUsersList()
        self.render('resume.html', users = users_list)

    def post(self):
        userOptions = self.get_argument('userOptions')
        self.application.cur_user = userOptions
        query_results = self.application.conn.execute('select * from study_progress where user_id=' + str(userOptions))
        user_data = query_results.fetchall()


class OwnedChartsUserHandler(tornado.web.RequestHandler):
    def get(self):
        users_list = self.loadUsersList()
        self.render('resume.html', users = users_list)

    def post(self):
        userOptions = self.get_argument('userOptions')
        self.application.cur_user = userOptions
        query_results = self.application.conn.execute('select * from study_progress where user_id=' + str(userOptions))
        user_data = query_results.fetchall()


class JoinedChartsUserHandler(tornado.web.RequestHandler):
    def get(self):
        users_list = self.loadUsersList()
        self.render('resume.html', users = users_list)

    def post(self):
        userOptions = self.get_argument('userOptions')
        self.application.cur_user = userOptions
        query_results = self.application.conn.execute('select * from study_progress where user_id=' + str(userOptions))
        user_data = query_results.fetchall()

class HostHandler(tornado.web.RequestHandler):
    def get(self):
        #displays contents of index.html
        self.application.start_time = str(datetime.datetime.now().time())
        if self.application.mmd_index<len(self.application.mmd_order):
            self.application.cur_mmd = self.application.mmd_order[self.application.mmd_index]

            if (self.application.show_question_only):
                self.redirect('/questionnaire')
            else:
                self.render('MMDExperimenter.html', mmd=str(self.application.cur_mmd))
            self.application.mmd_index+=1
        else:
            self.redirect('/done')

    def post(self):
        #refers to database connected to in 'class Application'
        #database = self.application.db.database
        #empty entry to insert into database in order to generate a user id
        #entry = {}
        #inserts empty entry and saves it to UserID variable in 'class Application'
        #self.application.UserID = database.insert_one(entry).inserted_id
        #print self.application.UserID

        #self.application.cur_user = random.randint(0, 1000)  #random number for now
        print ("POST RECEIVED")
        self.application.end_time = str(datetime.datetime.now().time())
        task_data = (self.application.cur_user, self.application.cur_mmd,'mmd' ,self.application.start_time, self.application.end_time)
        self.application.conn.execute('INSERT INTO MMD_performance VALUES (?,?,?,?,?)', task_data)
        self.application.conn.commit()
        self.redirect('/questionnaire')



#main function is first thing to run when application starts
def main():
    tornado.options.parse_command_line()
    #Application() refers to 'class Application'
    http_server = tornado.httpserver.HTTPServer(Application())
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.current().start()

if __name__ == "__main__":
    main()
