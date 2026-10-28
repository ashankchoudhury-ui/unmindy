(function() {
  'use strict';

  // ====== Waitlist Form ======
  var form = document.getElementById('waitlist-form');
  var emailInput = document.getElementById('email');
  var finePrint = document.getElementById('fine-print');
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var email = emailInput.value.trim();

      if (!emailRegex.test(email)) {
        emailInput.style.boxShadow = '0 0 0 2px rgba(239, 68, 68, 0.6)';
        finePrint.textContent = 'Please enter a valid email address.';
        emailInput.focus();
        return;
      }

      emailInput.style.boxShadow = '';
      finePrint.textContent = '';

      try {
        var waitlist = JSON.parse(localStorage.getItem('unmindy_waitlist') || '[]');
        if (!waitlist.includes(email)) {
          waitlist.push(email);
          localStorage.setItem('unmindy_waitlist', JSON.stringify(waitlist));
        }
      } catch (err) {
        console.warn('Could not save to localStorage:', err);
      }

      form.innerHTML = '<div class="success-msg">You\'re on the list. We\'ll be in touch.</div>';
    });
  }

  // ====== Lock-in button ======
  var lockBtn = document.querySelector('.phone-btn');
  if (lockBtn) {
    lockBtn.addEventListener('click', function() {
      document.getElementById('waitlist').scrollIntoView({ behavior: 'smooth' });
    });
  }
})();
