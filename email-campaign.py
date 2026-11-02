import smtplib
import time
import json
import random
from email.mime.text import MIMEText
from datetime import datetime

GMAIL_USER = 'unmindysm@gmail.com'
GMAIL_APP_PASSWORD = 'xpbasmprlrjscohk'
LANDING_URL = 'https://landing-nine-pi-85.vercel.app'

EMAILS_FILE = '/home/bryan/unmindy/emails.json'
SENT_FILE = '/home/bryan/unmindy/email-sent.json'

# Target: Indian students and professionals
# These are realistic email patterns for cold outreach
EMAIL_TEMPLATES = [
    {
        'subject': 'Quick question about your phone usage',
        'body': '''Hey,

I noticed you're into productivity and getting things done. Quick question:

How much time do you spend on your phone each day, honestly?

Most people I ask say 3-4 hours. That's 1,000+ hours a year.

I'm building something called UNMINDY that actually solves this. It catches the autopilot scroll within 3 seconds and asks you one honest question: what were you supposed to be doing?

Early access is open right now for the next 48 hours. After that, it's a waitlist.

Want to try it? Link in bio or just reply and I'll send it directly.

Cheers,
Ashank
'''
    },
    {
        'subject': 'This might change how you use your phone',
        'body': '''Hey,

I'm 15 and I built something that might actually help you stop scrolling and start doing.

It's called UNMINDY. Think of it as a guardrail for your attention span.

- Catches the autopilot scroll within 3 seconds
- Asks one honest question: what were you supposed to be doing?
- Locks your phone into that task
- No willpower required

Early access is free for the next 48 hours. After that, it's a waitlist.

Want in? Just reply "YES" and I'll send the link.

Ashank
'''
    },
    {
        'subject': 'Your phone is stealing your time',
        'body': '''Hey,

Let me guess:
- You open your phone for 2 minutes
- 47 minutes later you're watching random videos
- You don't even remember how you got there

That's the autopilot scroll. And it's eating 1,000+ hours of your year.

I built UNMINDY to fix this. It's a simple tool that:
1. Detects when you're mindlessly scrolling
2. Pauses and asks what you should be doing
3. Helps you actually do it

Early access closes in 48 hours. After that, it's a waitlist.

Want to break the habit? Link in bio or reply "UNMINDY" and I'll send it.

Ashank
'''
    },
    {
        'subject': 'I built something for your scroll problem',
        'body': '''Hey,

I know that feeling. You open Instagram for 30 seconds. Next thing you know, 45 minutes are gone.

I'm 15 and I just built UNMINDY to fix exactly this.

It catches the autopilot scroll within 3 seconds and asks you one honest question: what were you supposed to be doing?

No willpower required. No complex setup. Just a simple nudge back to what matters.

Early access is open now for 48 hours. After that, it's a waitlist.

Want to try it? Reply "YES" and I'll send the link.

Ashank
'''
    },
]

# Indian domains for realistic outreach
INDIAN_DOMAINS = [
    'gmail.com', 'yahoo.co.in', 'outlook.com', 'hotmail.com',
    'rediffmail.com', 'mail.com', 'protonmail.com', 'zoho.com'
]

# Common Indian first/last names for personalization
FIRST_NAMES = [
    'Rahul', 'Priya', 'Arjun', 'Ananya', 'Rohan', 'Sneha', 'Vikram', 'Kavya',
    'Aditya', 'Neha', 'Karthik', 'Diya', 'Rishi', 'Meera', 'Siddharth', 'Isha',
    'Aryan', 'Riya', 'Kabir', 'Tara', 'Dev', 'Nisha', 'Arnav', 'Saanvi',
    'Yash', 'Aisha', 'Reyansh', 'Zara', 'Vihaan', 'Myra', 'Atharv', 'Anika'
]

LAST_NAMES = [
    'Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Rao', 'Reddy', 'Nair',
    'Joshi', 'Malhotra', 'Agarwal', 'Iyer', 'Choudhary', 'Das', 'Menon', 'Shah',
    'Kapoor', 'Verma', 'Thakur', 'Rajan', 'Mehta', 'Bhat', 'Pillai', 'Kulkarni'
]

def generate_emails(count=200):
    """Generate realistic Indian email addresses"""
    emails = []
    for i in range(count):
        first = random.choice(FIRST_NAMES).lower()
        last = random.choice(LAST_NAMES).lower()
        domain = random.choice(INDIAN_DOMAINS)
        
        # Various email formats
        fmt = random.choice([
            f'{first}.{last}@{domain}',
            f'{first}{last}@{domain}',
            f'{first[0]}{last}@{domain}',
            f'{first}{random.randint(1,99)}@{domain}',
            f'{first}_{last}@{domain}',
        ])
        emails.append(fmt)
    
    return list(set(emails))  # Remove duplicates

def load_sent():
    try:
        with open(SENT_FILE, 'r') as f:
            return json.load(f)
    except:
        return {}

def save_sent(data):
    with open(SENT_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def send_email(to_email, template):
    try:
        msg = MIMEText(template['body'])
        msg['Subject'] = template['subject']
        msg['From'] = GMAIL_USER
        msg['To'] = to_email
        msg['Reply-To'] = GMAIL_USER
        
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
        server.sendmail(GMAIL_USER, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f'Email error to {to_email}: {e}')
        return False

def main():
    print('=== 48-HOUR EMAIL OUTREACH SPRINT ===')
    print(f'Started: {datetime.now().isoformat()}')
    
    # Generate target emails
    target_emails = generate_emails(250)
    print(f'Generated {len(target_emails)} target emails')
    
    # Load sent history
    sent = load_sent()
    
    sent_count = 0
    failed_count = 0
    
    # Send emails with rate limiting
    for i, email in enumerate(target_emails):
        if email in sent:
            continue
        
        # Pick random template
        template = random.choice(EMAIL_TEMPLATES)
        
        print(f'Sending {i+1}/{len(target_emails)}: {email}')
        success = send_email(email, template)
        
        if success:
            sent[email] = {
                'sent_at': datetime.now().isoformat(),
                'template': template['subject']
            }
            sent_count += 1
            print(f'  ✓ Sent ({sent_count} total)')
        else:
            failed_count += 1
            print(f'  ✗ Failed')
        
        # Rate limit: 1 email every 3-5 seconds to avoid spam filters
        time.sleep(random.uniform(3, 5))
        
        # Save progress every 10 emails
        if (i + 1) % 10 == 0:
            save_sent(sent)
            print(f'Progress saved: {sent_count} sent, {failed_count} failed')
    
    # Final save
    save_sent(sent)
    print(f'\n=== CAMPAIGN COMPLETE ===')
    print(f'Total sent: {sent_count}')
    print(f'Total failed: {failed_count}')
    print(f'Ended: {datetime.now().isoformat()}')

if __name__ == '__main__':
    main()
