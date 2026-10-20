import http.server, mimetypes

mimetypes.add_type("text/javascript", ".js")
mimetypes.add_type("text/css", ".css")

http.server.test(HandlerClass=http.server.SimpleHTTPRequestHandler, port=5500)