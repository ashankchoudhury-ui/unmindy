import json
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime

DATA_FILE = "/home/bryan/unmindy/emails.json"
PORT = 8080

class EmailHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        if self.path == "/signup":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            try:
                data = json.loads(body)
                email = data.get("email", "").strip()
                referred_by = data.get("referred_by", "").strip()
                
                if email and "@" in email:
                    # Load existing
                    emails = []
                    if os.path.exists(DATA_FILE):
                        with open(DATA_FILE, "r") as f:
                            emails = json.load(f)
                    # Check duplicate
                    existing = None
                    code = None
                    if email not in [e["email"] for e in emails]:
                        code = email.split("@")[0].lower().replace(".", "-") + "-" + str(hash(email) % 100000)
                        entry = {
                            "email": email,
                            "date": datetime.now().isoformat(),
                            "code": code,
                            "referred_by": referred_by if referred_by else None,
                            "referrals": 0,
                            "priority": "early-access" if referred_by else "normal"
                        }
                        emails.append(entry)
                        
                        # Update referrer count
                        if referred_by:
                            for e in emails:
                                if e.get("code") == referred_by:
                                    e["referrals"] = e.get("referrals", 0) + 1
                                    break
                        
                        with open(DATA_FILE, "w") as f:
                            json.dump(emails, f, indent=2)
                    else:
                        existing = [e for e in emails if e["email"] == email][0]
                        if referred_by and existing.get("referred_by") is None:
                            existing["referred_by"] = referred_by
                            existing["priority"] = "early-access"
                            with open(DATA_FILE, "w") as f:
                                json.dump(emails, f, indent=2)
                    
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        "success": True,
                        "code": existing.get("code") if existing else code,
                        "message": "You're on the list. Share your link to skip the waitlist."
                    }).encode())
                else:
                    self.send_response(400)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Invalid email"}).encode())
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        if self.path == "/emails":
            if os.path.exists(DATA_FILE):
                with open(DATA_FILE, "r") as f:
                    data = f.read()
            else:
                data = "[]"
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(data.encode())
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        pass  # Suppress logs

if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", PORT), EmailHandler)
    print(f"Email collector running on port {PORT}")
    server.serve_forever()