(function() {
  'use strict';

  // ====== State ======
  var DURATION = 120; // seconds
  var category = 'start';
  var stepIndex = 0;
  var timerInterval = null;
  var remaining = DURATION;
  var running = false;

  // ====== DOM refs ======
  var $ = function(id) { return document.getElementById(id); };

  var screens = {
    input: $('screen-input'),
    step: $('screen-step'),
    done: $('screen-done')
  };

  var taskInput = $('task-input');
  var generateBtn = $('generate-btn');
  var stepText = $('step-text');
  var taskLabel = $('task-label');
  var altStepBtn = $('alt-step-btn');
  var startTimerBtn = $('start-timer-btn');
  var backBtn = $('back-btn');
  var timerDisplay = $('timer-display');
  var timerLabel = $('timer-label');
  var timerHint = $('timer-hint');
  var ringFill = $('ring-fill');
  var againBtn = $('again-btn');
  var resetStats = $('reset-stats');
  var streakDisplay = $('streak-display');

  // ====== Step Engine ======
  function categorize(task) {
    if (/\b(essay|write|script|story|article|post|caption|resume|cover letter|application|blog|caption)\b/i.test(task)) return 'write';
    if (/\b(code|program|app|bug|function|commit|push|debug|implement|build|refactor|api|sql|test|script)\b/i.test(task)) return 'code';
    if (/\b(study|revise|revision|read|chapter|notes|exam|quiz|homework|assignment|memorize|learn|math|problem|flashcard)\b/i.test(task)) return 'study';
    if (/\b(email|message|text|call|dm|reach|contact|reply|phone|apply|hire|recruit)\b/i.test(task)) return 'reach';
    if (/\b(clean|tidy|organize|declutter|desk|room|files|inbox|cleanup|tidy up)\b/i.test(task)) return 'clean';
    if (/\b(design|draw|edit|video|music|make|create|prototype|mockup|thumbnail)\b/i.test(task)) return 'make';
    return 'start';
  }

  var STEPS = {
    write: [
      function(t) { return 'Open a blank doc for "' + t + '". Write one ugly sentence — just the first line, no editing. 2 minutes.'; },
      function(t) { return 'Type the heading for "' + t + '" and one bullet under it. That\'s the whole step.'; },
      function(t) { return 'Draft the worst version of "' + t + '" on purpose. Give yourself permission to suck for 2 minutes.'; }
    ],
    code: [
      function(t) { return 'Open the project for "' + t + '". Make one tiny change you can see — one function, one line, one log line. 2 minutes.'; },
      function(t) { return 'Reproduce the problem, or write the failing test for "' + t + '". Just get it in front of you.'; },
      function(t) { return 'Open the file you\'ve been avoiding in "' + t + '" and read it like you\'re someone else. No editing yet.'; }
    ],
    study: [
      function(t) { return 'Open "' + t + '" to the first line and read or answer just that one. Then the next. 2 minutes gets you in.'; },
      function(t) { return 'Set the timer and do the first problem in "' + t + '" — even half of it counts.'; },
      function(t) { return 'Skim "' + t + '" and jot 3 things you\'re meant to take away. Getting them right doesn\'t matter yet.'; }
    ],
    reach: [
      function(t) { return 'Open the message for "' + t + '" and type the first line. You can rewrite it later — just break the seal.'; },
      function(t) { return 'Write the opening of "' + t + '" and stop. Hitting send is a separate 2 minutes.'; },
      function(t) { return 'Draft "' + t + '" in the ugliest way you can. Editing a draft beats a blank screen.'; }
    ],
    clean: [
      function(t) { return 'Pick one spot for "' + t + '" — one drawer, one folder, one tab. Fix only that for 2 minutes.'; },
      function(t) { return 'Set the timer and remove 5 things from "' + t + '". Just 5.'; },
      function(t) { return 'Do the 2-minute version of "' + t + '". Nothing gets perfect, and that\'s the point.'; }
    ],
    make: [
      function(t) { return 'Open the file for "' + t + '" and make one rough mark — block out the shape, zero detail. 2 minutes.'; },
      function(t) { return 'Build the ugliest working version of "' + t + '" you can. Shape first, polish never.'; },
      function(t) { return 'Pull up a reference for "' + t + '" and copy the layout badly. Just warm up your hands.'; }
    ],
    start: [
      function(t) { return 'Open "' + t + '" right now and do the smallest first piece for 2 minutes. Ugly counts.'; },
      function(t) { return 'Break "' + t + '" into the very first physical action and do just that — nothing more.'; },
      function(t) { return 'Work on "' + t + '" until the timer beeps. You\'re allowed to stop after — but usually you won\'t.'; }
    ]
  };

  // ====== Storage / Stats ======
  var STORE_KEY = 'unmindy_starts';

  function getStarts() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
    catch(e) { return []; }
  }

  function saveStarts(starts) {
    localStorage.setItem(STORE_KEY, JSON.stringify(starts));
  }

  function dayKey(ts) {
    return new Date(ts).toISOString().slice(0, 10);
  }

  function computeStreak() {
    var days = getStarts().map(dayKey);
    var unique = {};
    days.forEach(function(d) { unique[d] = true; });

    var now = new Date();
    now.setHours(0, 0, 0, 0);
    var today = now.toISOString().slice(0, 10);

    if (!unique[today]) {
      now = new Date(now.getTime() - 86400000);
    }

    var streak = 0;
    for (var i = 0; i < 366; i++) {
      var ds = now.toISOString().slice(0, 10);
      if (unique[ds]) {
        streak++;
        now = new Date(now.getTime() - 86400000);
      } else {
        break;
      }
    }
    return streak;
  }

  function countToday() {
    var today = new Date().toISOString().slice(0, 10);
    return getStarts().filter(function(d) { return d === today; }).length;
  }

  function updateStats() {
    var streak = computeStreak();
    streakDisplay.textContent = streak;
    $('streak-count').textContent = streak;
    $('today-count').textContent = countToday();
  }

  function recordStart() {
    var starts = getStarts();
    starts.push(Date.now());
    saveStarts(starts);
    updateStats();
  }

  // ====== Navigation ======
  function showScreen(name) {
    Object.keys(screens).forEach(function(key) {
      screens[key].classList.remove('active');
    });
    screens[name].classList.add('active');
  }

  // ====== Timer ======
  var R = 82;
  var C = 2 * Math.PI * R;

  function formatTime(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function setRing() {
    ringFill.style.strokeDasharray = C;
    ringFill.style.strokeDashoffset = C;
  }

  function tick() {
    if (remaining <= 0) {
      finish();
      return;
    }
    remaining--;
    timerDisplay.textContent = formatTime(remaining);
    var fraction = 1 - (remaining / DURATION);
    ringFill.style.strokeDashoffset = C * (1 - fraction);

    if (remaining === 30) {
      timerLabel.textContent = 'almost';
    }
  }

  function startTimer() {
    if (running) return;
    running = true;
    timerLabel.textContent = 'focus';
    timerHint.textContent = 'Just start. Don\'t stop — the only job for 2 minutes is to begin.';
    startTimerBtn.textContent = 'Running…';
    startTimerBtn.disabled = true;
    timerInterval = setInterval(tick, 1000);
  }

  function finish() {
    clearInterval(timerInterval);
    running = false;
    ringFill.classList.add('done');
    timerDisplay.textContent = '✓';
    timerLabel.textContent = 'done';
    timerHint.textContent = 'You did the part everyone skips.';
    startTimerBtn.textContent = 'Start another';
    startTimerBtn.disabled = false;
    startTimerBtn.onclick = again;
    recordStart();
    setTimeout(function() {
      showScreen('done');
    }, 800);
  }

  function resetTimer() {
    remaining = DURATION;
    ringFill.classList.remove('done');
    ringFill.style.strokeDashoffset = C;
    timerDisplay.textContent = '2:00';
    timerLabel.textContent = 'ready';
    timerHint.textContent = 'Two minutes. Ugly counts. You can stop when it beeps — but you probably won\'t.';
    startTimerBtn.textContent = 'Start now';
    startTimerBtn.disabled = false;
    startTimerBtn.onclick = startTimer;
  }

  // ====== Actions ======
  function generateStep() {
    var task = taskInput.value.trim();
    if (!task) {
      taskInput.focus();
      taskInput.style.boxShadow = '0 0 0 2px rgba(239, 68, 68, 0.6)';
      setTimeout(function() { taskInput.style.boxShadow = ''; }, 900);
      return;
    }

    category = categorize(task);
    stepIndex = 0;
    taskLabel.textContent = task.length > 28 ? task.slice(0, 28) + '…' : task;
    renderStep();
    resetTimer();
    showScreen('step');
  }

  function renderStep() {
    var steps = STEPS[category];
    stepText.textContent = steps[stepIndex % steps.length](taskInput.value.trim() || 'the task');
  }

  function again() {
    showScreen('input');
    resetTimer();
    setTimeout(function() { taskInput.focus(); }, 60);
  }

  // ====== Event Listeners ======
  generateBtn.addEventListener('click', generateStep);

  taskInput.addEventListener('keydown', function(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      generateStep();
    }
  });

  altStepBtn.addEventListener('click', function() {
    var steps = STEPS[category];
    stepIndex = (stepIndex + 1) % steps.length;
    renderStep();
  });

  backBtn.addEventListener('click', again);
  againBtn.addEventListener('click', again);

  resetStats.addEventListener('click', function() {
    localStorage.removeItem(STORE_KEY);
    updateStats();
  });

  // ====== Init ======
  setRing();
  updateStats();
  setTimeout(function() { taskInput.focus(); }, 100);

})();
