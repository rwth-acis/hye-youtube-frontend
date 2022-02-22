from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import traceback
import re

PLAIN = 'text/plain'
JSON = 'application/json'
AGENT_ID_1 = 'las2peeragentid1'
AGENT_ID_2 = 'las2peeragentid2'
AGENT_ID_3 = 'las2peeragentid3'
AGENT_NAME_1 = 'Peter'
AGENT_NAME_2 = 'Alex'
AGENT_NAME_3 = 'Michi'
ADDRESSBOOK = {AGENT_ID_1: AGENT_NAME_1, AGENT_ID_2: AGENT_NAME_2, AGENT_ID_3: AGENT_NAME_3}

loggedIn = False
cookies = False
reader = [AGENT_NAME_1, AGENT_NAME_2]
consent = list()
preference = ''
dataShared = False
alpha = 0.5

def build_response(status = 200, msg = 'ok', content_type = PLAIN, headers = None, raw = None):
    if type(msg) != type('msg'):
        msg = str(msg)
    if headers == None:
        headers = dict()
    headers['content-type'] = content_type
    if not raw == None:
        return {'status': status, 'msg': msg, 'headers': headers, 'raw': raw}
    return {'status': status, 'msg': msg, 'headers': headers}

def bad_request():
    return build_response(400, 'Bad request')

def not_authorized():
    return build_response(401, 'Unauthorized')

def not_allowed():
    return build_response(403, 'Not allowed')

def not_found():
    return build_response(404, 'Resource not found')

def invalid_method():
    return build_response(405, 'Method not allowed')

def server_error():
    return build_response(500, 'Internal server error')

def get_proxy(path):
    if not loggedIn:
        return not_authorized()
    path[-1] = path[-1].split('?')[0]
    if len(path) < 1 or len(path[0]) == 0 or path[0] == 'watch' or path[0] == 'search':
        file = open('./data/videos.json', 'r')
        data = file.read()
        file.close()
        return build_response(msg = data, content_type = JSON)
    if path[0] == 'cookies':
        if cookies:
            return build_response(msg = 'Cookies are valid.')
        return build_response(msg = 'No cookies found.')
    if path[0] == 'reader':
        return build_response(msg = json.dumps(reader), content_type = JSON)
    if path[0] == 'consent':
        jsonString = ''
        for obj in consent:
            if len(jsonString) == 0:
                jsonString = '["' + json.dumps(obj).replace('"', '\\"') + '"'
            else:
                jsonString += ',"' + json.dumps(obj).replace('"', '\\"') + '"'
        jsonString += ']'
        return build_response(msg = jsonString, content_type = JSON)
    if path[0] == 'preference':
        return build_response(msg = preference)
    return not_found()

def post_proxy(path, body):
    global reader
    global consent
    global preference
    if not loggedIn:
        return not_authorized()
    path[-1] = path[-1].split('?')[0]
    if len(path) < 1 or len(path[0]) == 0 or path[0] == 'watch' or path[0] == 'search':
        return invalid_method()
    try:
        if path[0] == 'cookies':
            return build_response(headers = {'Set-Cookie': 'cookies=true; Path=/; SameSite=Lax'})
        if path[0] == 'reader':
            return build_response()
        if path[0] == 'consent':
            if type(body) == type(""):
                try:
                    body = json.loads(body)
                except Exception:
                    traceback.print_exc()
                    return bad_request()
            if not 'reader' in body or not 'anonymous' in body:
                return bad_request()
            if body['anonymous']:
                consent.append({'reader': body['reader'], 'anonymous': 'true'})
            else:
                consent.append({'reader': body['reader'], 'anonymous': 'false'})
            return build_response()
        if path[0] == 'preference':
            preference = body
            return build_response()
    except Exception as e:
        return server_error()
    return not_found()

def delete_proxy(path, body):
    global reader
    global consent
    global preference
    if not loggedIn:
        return not_authorized()
    path[-1] = path[-1].split('?')[0]
    if len(path) < 1 or len(path[0]) == 0 or path[0] == 'watch' or path[0] == 'search':
        return invalid_method()
    try:
        if path[0] == 'cookies':
            return build_response()
        if path[0] == 'reader':
            return build_response()
        if path[0] == 'consent':
            if type(body) == type(""):
                try:
                    body = json.loads(body)
                except Exception:
                    traceback.print_exc()
                    return bad_request()
            if 'reader' not in body or 'anonymous' not in body:
                return bad_request()
            for i in range(len(consent)):
                if consent[i]['reader'] == body['reader'] and (consent[i]['anonymous'] == 'true') == body['anonymous']:
                    del consent[i]
            return build_response()
        if path[0] == 'preference':
            preference = ''
            return build_response()
    except Exception as e:
        return server_error()
    return not_found()

def get_recs(path):
    if not loggedIn:
        return not_authorized()
    if len(path) < 1 or len(path[0]) == 0:
        return []
    if path[0] == 'alpha':
        if dataShared:
            return build_response(msg = str(alpha))
        else:
            return not_found()
    return not_found()

def post_recs(path, body):
    global alpha
    global dataShared
    if not loggedIn:
        return not_authorized()
    if len(path) < 1 or len(path[0]) == 0:
        dataShared = True
        return build_response()
    if path[0] == 'alpha':
        alpha = body
        return build_response()
    return not_found()

def delete_recs(path, body):
    global alpha
    if not loggedIn:
        return not_authorized()
    if len(path) < 1 or len(path[0]) == 0:
        alpha = -1
        return build_response()
    if path[0] == 'alpha':
        invalid_method()
    return not_found()

def get_contacts(path):
    if not loggedIn:
        return not_authorized()
    if len(path) < 1 or len(path[0]) == 0:
        return not_found()
    if path[0] == 'user':
        if len(path) < 2 or len(path[1]) == 0:
            return bad_request()
        try:
            return build_response(msg = '{userImage=' + path[1] + '}')
        except Exception:
            return not_found()
    if path[0] == 'addressbook':
        return build_response(msg = json.dumps(ADDRESSBOOK), content_type = JSON)
    if path[0] == 'name':
        if len(path) < 2 or len(path[1]) == 0:
            return not_found()
        if path[1] in ADDRESSBOOK:
            return build_response(msg = ADDRESSBOOK[path[1]])
    return not_found()

def get_files(path):
    if not loggedIn:
        return not_authorized()
    if len(path) < 1 or len(path[0]) < 1:
        return not_found()
    try:
        file = open('./data/' + path[0] + '.jpg', 'rb')
        image = file.read()
        file.close()
        return build_response(raw = image, content_type = 'image/jpeg')
    except Exception:
        traceback.print_exc()
        return server_error()
    return not_found()

def las2peer_login(path):
    if len(path) < 2:
        return not_found()
    if path[0] == 'auth' and path[1] == 'login':
        return build_response(msg = '{"agentid":"' + AGENT_ID_3 + '"}', content_type = JSON, headers = {'Set-Cookie': 'loggedin=true; Path=/'})
    return not_found()

def route_get(path):
    path_split = path.split('/')
    if len(path_split) < 2 or len(path_split[1]) == 0:
        return not_found()
    if path_split[1] == 'hye-youtube':
        return get_proxy(path_split[2:])
    if path_split[1] == 'hye-recommendations':
        return get_recs(path_split[2:])
    if path_split[1] == 'contactservice':
        return get_contacts(path_split[2:])
    if path_split[1] == 'files':
        return get_files(path_split[2:])
    if path_split[1] == 'las2peer':
        return las2peer_login(path_split[2:])
    return not_found()

def route_post(path, body):
    path_split = path.split('/')
    if len(path_split) < 2 or len(path_split[1]) == 0:
        return not_found()
    if path_split[1] == 'hye-youtube':
        return post_proxy(path_split[2:], body)
    if path_split[1] == 'hye-recommendations':
        return post_recs(path_split[2:], body)
    if path_split[1] == 'contactservice':
        return invalid_method()
    if path_split[1] == 'fileservice':
        return invalid_method()
    if path_split[1] == 'las2peer':
        return invalid_method()
    return not_found()

def route_delete(path, body):
    path_split = path.split('/')
    if len(path_split) < 2 or len(path_split[1]) == 0:
        return not_found()
    if path_split[1] == 'hye-youtube':
        return delete_proxy(path_split[2:], body)
    if path_split[1] == 'hye-recommendations':
        return delete_recs(path_split[2:], body)
    if path_split[1] == 'contactservice':
        return invalid_method()
    if path_split[1] == 'fileservice':
        return invalid_method()
    if path_split[1] == 'las2peer':
        return invalid_method()
    return not_found()

def isNumeric(string):
    return re.search('^[0-9]+$', string)

def parse_cookies(cookieString):
    cookieString = cookieString
    global cookies
    global loggedIn
    for cookie in cookieString.split(';'):
        keyVal = cookie.split('=')
        if len(keyVal) < 2:
            continue
        if keyVal[0].lower().strip() == 'cookies' and keyVal[1].lower().strip() == 'true':
            cookies = True
        if keyVal[0].lower().strip() == 'loggedin' and keyVal[1].lower().strip() == 'true':
            loggedIn = True

def parse_headers(rawHeaders):
    headers = dict()
    if not rawHeaders['Content-Length'] == None and\
        isNumeric(rawHeaders['Content-Length']):
            headers['content-length'] = int(rawHeaders['Content-Length'])
    elif not rawHeaders['content-length'] == None and\
        isNumeric(rawHeaders['content-length']):
            headers['content-length'] = int(rawHeaders['content-length'])
    else:
        headers['content-length'] = 0

    if not rawHeaders['Content-Encoding'] == None:
        headers['content-encoding'] = rawHeaders['Content-Encoding']
    elif not rawHeaders['content-encoding'] == None:
        headers['content-encoding'] = rawHeaders['content-encoding']
    else:
        headers['content-encoding'] = 'utf-8'

    if not rawHeaders['Cookie'] == None:
        parse_cookies(rawHeaders['Cookie'])
    elif not rawHeaders['cookie'] == None:
        parse_cookies(rawHeaders['cookie'])
    return headers

class CustomHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        headers = parse_headers(self.headers)
        response = route_get(self.path)
        self.send_response(response['status'])
        for header in response['headers']:
            self.send_header(header, response['headers'][header])
        self.end_headers()
        if 'raw' in response:
            self.wfile.write(response['raw'])
        self.wfile.write(response['msg'].encode())

    def do_POST(self):
        body = None
        headers = parse_headers(self.headers)
        try:
            body = self.rfile.read(headers['content-length'])\
                .decode(headers['content-encoding'])
        except:
            traceback.print_exc()
            self.send_response(400)
            for header in response['headers']:
                self.send_header(header, response['headers'][header])
            self.end_headers()
            self.wfile.write('Error getting request body'.encode())
            return
        response = route_post(self.path, body)
        self.send_response(response['status'])
        for header in response['headers']:
            self.send_header(header, response['headers'][header])
        self.end_headers()
        if 'raw' in response:
            self.wfile.write(response['raw'])
        self.wfile.write(response['msg'].encode())

    def do_DELETE(self):
        body = None
        headers = parse_headers(self.headers)
        try:
            body = self.rfile.read(headers['content-length'])\
                .decode(headers['content-encoding'])
        except:
            traceback.print_exc()
            self.send_response(400)
            for header in response['headers']:
                self.send_header(header, response['headers'][header])
            self.end_headers()
            self.wfile.write('Error getting request body'.encode())
            return
        response = route_delete(self.path, body)
        self.send_response(response['status'])
        for header in response['headers']:
            self.send_header(header, response['headers'][header])
        self.end_headers()
        if 'raw' in response:
            self.wfile.write(response['raw'])
        self.wfile.write(response['msg'].encode())

# Start server
PRT = 8080
srv = HTTPServer(('',PRT), CustomHandler)
print('Server started on port %s' %PRT)
srv.serve_forever()
