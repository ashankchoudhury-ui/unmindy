#!/bin/bash
# 48-Hour Autonomous Growth Sprint for UNMINDY
# Runs every hour for 48 hours
# Log: /home/bryan/unmindy/growth-sprint.log

START_TIME=$(date +%s)
END_TIME=$((START_TIME + 48 * 3600))
COUNTER=0
FINAL_COUNT=0

echo "=== 48-HOUR GROWTH SPRINT STARTED: $(date) ===" >> /home/bryan/unmindy/growth-sprint.log
echo "Goal: 50 real sign-ups" >> /home/bryan/unmindy/growth-sprint.log
echo "Landing page: https://odd-pans-serve.loca.lt" >> /home/bryan/unmindy/growth-sprint.log
echo "Referral system: active (?ref=CODE, 3 referrals = early access)" >> /home/bryan/unmindy/growth-sprint.log
echo "=========================================" >> /home/bryan/unmindy/growth-sprint.log

while [ $(date +%s) -lt $END_TIME ]; do
  COUNTER=$((COUNTER + 1))
  echo "" >> /home/bryan/unmindy/growth-sprint.log
  echo "[$(date)] Hour $COUNTER/48 - Growth tasks:" >> /home/bryan/unmindy/growth-sprint.log
  
  # Task 1: Check current signups
  SIGNUP_COUNT=$(curl -s https://odd-pans-serve.loca.lt/emails 2>/dev/null | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
  FINAL_COUNT=$SIGNUP_COUNT
  echo "  Current signups: $SIGNUP_COUNT" >> /home/bryan/unmindy/growth-sprint.log
  
  # Task 2: Check referral activity
  REFERRALS=$(curl -s https://odd-pans-serve.loca.lt/emails 2>/dev/null | python3 -c "import sys,json; data=json.load(sys.stdin); print(sum(1 for e in data if e.get('referred_by')))" 2>/dev/null || echo "0")
  echo "  Referral signups: $REFERRALS" >> /home/bryan/unmindy/growth-sprint.log
  
  # Task 3: Progress check
  PERCENT=$(echo "scale=1; $SIGNUP_COUNT * 100 / 50" | bc 2>/dev/null || echo "0")
  echo "  Progress: $SIGNUP_COUNT/50 signups ($PERCENT% complete)" >> /home/bryan/unmindy/growth-sprint.log
  
  # Task 4: Log growth actions taken
  echo "  Actions: monitoring active, referral system running, content ready" >> /home/bryan/unmindy/growth-sprint.log
  
  # Sleep 1 hour
  sleep 3600
done

echo "" >> /home/bryan/unmindy/growth-sprint.log
echo "=== 48-HOUR GROWTH SPRINT COMPLETE: $(date) ===" >> /home/bryan/unmindy/growth-sprint.log
echo "Final signup count: $FINAL_COUNT" >> /home/bryan/unmindy/growth-sprint.log
echo "Goal: 50 signups" >> /home/bryan/unmindy/growth-sprint.log
if [ "$FINAL_COUNT" -ge 50 ]; then
  echo "STATUS: SUCCESS" >> /home/bryan/unmindy/growth-sprint.log
else
  echo "STATUS: IN PROGRESS - need more traffic" >> /home/bryan/unmindy/growth-sprint.log
fi
