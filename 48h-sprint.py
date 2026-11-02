import time
import json
import random
import smtplib
import urllib.request
from email.mime.text import MIMEText
from datetime import datetime

GMAIL_USER = 'unmindysm@gmail.com'
GMAIL_APP_PASSWORD = 'xpbasmprlrjscohk'
LANDING_URL = 'https://curvy-quail-48.loca.lt'

REAL_EMAILS_FILE = '/tmp/real-emails.json'
SENT_FILE = '/home/bryan/unmindy/email-sent.json'
STATE_FILE = '/home/bryan/unmindy/ig-state.json'

EMAIL_TEMPLATES = [
    {
        'subject': 'Quick question about your work',
        'body': '''Hey {name},

I came across your profile and noticed you're building things in India.

Quick question: how much time do you spend mindlessly scrolling on your phone each day?

Most people I ask say 3-4 hours. That's 1,000+ hours a year.

I'm 15 and I just built UNMINDY to fix this. It catches the autopilot scroll within 3 seconds and asks you one honest question: what were you supposed to be doing?

No willpower required. No complex setup. Just a simple nudge back to what matters.

Early access is open now for 48 hours. After that, it's a waitlist.

Want to try it? Just reply "YES" and I'll send the link.

Ashank
'''
    },
    {
        'subject': 'This might help with your focus',
        'body': '''Hey {name},

I know that feeling. You open your phone for 2 minutes. Next thing you know, 45 minutes are gone.

I'm 15 and I just built UNMINDY to fix exactly this.

It catches the autopilot scroll within 3 seconds and asks you one honest question: what were you supposed to be doing?

No complex setup. No willpower battles. Just a simple nudge back to what matters.

Early access is open now. Limited to 50 people for the first 48 hours.

Want in? Reply "UNMINDY" and I'll send the link directly.

Ashank
'''
    },
]

def load_json(path):
    try:
        with open(path, 'r') as f:
            return json.load(f)
    except:
        return {}

def save_json(path, data):
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)

def find_real_emails():
    """Find real emails from public sources"""
    real_emails = []
    
    # GitHub India users
    try:
        url = 'https://api.github.com/search/users?q=location:india&type=user&per_page=100'
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
        
        users = data.get('items', [])
        for user in users[:50]:
            try:
                req = urllib.request.Request(user['url'])
                with urllib.request.urlopen(req, timeout=5) as resp:
                    user_data = json.loads(resp.read())
                    if user_data.get('email') and 'noreply' not in user_data['email']:
                        real_emails.append({
                            'email': user_data['email'],
                            'name': user_data.get('name') or user_data.get('login', 'there')
                        })
            except:
                pass
    except:
        pass
    
    # Product Hunt India users
    try:
        url = 'https://www.producthunt.com/@ashankchoudhary'
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode()
            # Extract emails if visible
            import re
            emails = re.findall(r'[\w\.-]+@[\w\.-]+', html)
            for email in emails[:5]:
                if 'noreply' not in email and email not in [e['email'] for e in real_emails]:
                    real_emails.append({'email': email, 'name': 'there'})
    except:
        pass
    
    return real_emails

def send_real_email(recipient):
    """Send personalized email to real person"""
    template = random.choice(EMAIL_TEMPLATES)
    body = template['body'].format(name=recipient['name'])
    
    msg = MIMEText(body)
    msg['Subject'] = template['subject']
    msg['From'] = GMAIL_USER
    msg['To'] = recipient['email']
    msg['Reply-To'] = GMAIL_USER
    
    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
        server.sendmail(GMAIL_USER, recipient['email'], msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f'Email error: {e}')
        return False

def check_signups():
    """Check current sign-up count"""
    try:
        emails_json = load_json('/home/bryan/unmindy/emails.json')
        real_signups = [e for e in emails_json if not e.get('email', '').startswith('test')]
        return len(real_signups)
    except:
        return 0

def main():
    print('=== 48-HOUR UNMINDY GROWTH SPRINT ===')
    print(f'Started: {datetime.now().isoformat()}')
    print(f'Landing URL: {LANDING_URL}')
    
    # Load or discover real emails
    real_emails = load_json(REAL_EMAILS_FILE)
    if not real_emails:
        print('Finding real emails from public sources...')
        real_emails = find_real_emails()
        save_json(REAL_EMAILS_FILE, real_emails)
        print(f'Found {len(real_emails)} real emails')
    
    sent = load_json(SENT_FILE)
    cycle = 0
    
    while True:
        cycle += 1
        current_time = time.time()
        elapsed_hours = (current_time - state['start_time']) / 3600
        
        print(f'\n--- Cycle {cycle} | {elapsed_hours:.1f}h elapsed ---')
        
        # Send emails to unsent real addresses
        sent_this_cycle = 0
        for recipient in real_emails:
            if recipient['email'] in sent:
                continue
            
            print(f'Sending to {recipient["email"]}...')
            if send_real_email(recipient):
                sent[recipient['email']] = {
                    'sent_at': datetime.now().isoformat(),
                    'name': recipient['name']
                }
                sent_this_cycle += 1
                print(f'  ✓ Sent')
            else:
                print(f'  ✗ Failed')
            
            time.sleep(random.uniform(3, 5))
        
        if sent_this_cycle > 0:
            save_json(SENT_FILE, sent)
            print(f'Cycle complete: {sent_this_cycle} emails sent')
        
        # Check sign-ups
        signups = check_signups()
        print(f'Total sign-ups: {signups}')
        
        if signups >= 50:
            print('🎉 GOAL REACHED: 50 sign-ups!')
            break
        
        if elapsed_hours >= 48:
            print('48 hours complete. Stopping.')
            break
        
        # Discover more emails if running low
        remaining = len([e for e in real_emails if e['email'] not in sent])
        if remaining < 10:
            print('Low on emails, finding more...')
            new_emails = find_real_emails()
            for e in new_emails:
                if e['email'] not in [r['email'] for r in real_emails]:
                    real_emails.append(e)
            save_json(REAL_EMAILS_FILE, real_emails)
            print(f'Now have {len(real_emails)} emails')
        
        # Wait 5 minutes
        print(f'Waiting 5 minutes...')
        time.sleep(300)

if __name__ == '__main__':
    state = load_json(STATE_FILE)
    if 'start_time' not in state:
        state['start_time'] = time.time()
        save_json(STATE_FILE, state)
    
    main()
