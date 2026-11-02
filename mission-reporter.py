#!/usr/bin/env python3
import json, time, subprocess, os
from datetime import datetime, timezone

STATE_PATH = '/home/bryan/unmindy/mission-state.json'
CHAT_ID = '7696299425'

def load_state():
    with open(STATE_PATH) as f:
        return json.load(f)

def save_state(state):
    with open(STATE_PATH, 'w') as f:
        json.dump(state, f, indent=2)

def send_telegram(text):
    subprocess.run(['python3', '-c', f'''
import subprocess, json, os
text = {repr(text)}
payload = json.dumps({{"chat_id": "{CHAT_ID}", "text": text}})
proc = subprocess.run(["curl", "-s", "-X", "POST", "https://api.telegram.org/bot" + os.environ.get("TELEGRAM_BOT_TOKEN", "") + "/sendMessage", "-H", "Content-Type: application/json", "-d", payload], capture_output=True, text=True)
print(proc.stdout[:200])
'''], capture_output=True)

def report():
    state = load_state()
    elapsed = datetime.now(timezone.utc) - datetime.fromisoformat(state['start_time'].replace('Z', '+00:00'))
    hours = elapsed.total_seconds() / 3600
    remaining = 24 - hours
    
    text = f"""MISSION UPDATE -- {hours:.1f}h elapsed
Verified sign-ups: {state['verified_signups']}/24
Remaining: {state['remaining']}
Channels: {', '.join(state['channels'])}
Strategy: {state['current_strategy']}
Blockers: {', '.join(state['blockers']) if state['blockers'] else 'None'}
Next: Continuing Instagram posting and outreach"""
    
    send_telegram(text)
    save_state(state)

if __name__ == '__main__':
    while True:
        report()
        time.sleep(600)  # 10 minutes
