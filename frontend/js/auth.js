document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect to respective dashboard
  const session = api.getSession();
  if (session && api.getToken()) {
    window.location.href = session.role === 'tutor' ? 'tutor.html' : 'student.html';
    return;
  }

  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const toggleLink = document.getElementById('toggle-link');
  const toggleText = document.getElementById('toggle-text');
  const authSubtitle = document.getElementById('auth-subtitle');

  const signupRole = document.getElementById('signup-role');
  const tutorSubjectGroup = document.getElementById('tutor-subject-group');
  const tutorSubjectOtherGroup = document.getElementById('tutor-subject-other-group');
  const signupSubjectOther = document.getElementById('signup-subject-other');
  const signupSubjectOtherCb = document.getElementById('signup-subject-other-cb');
  const tutorCapacityGroup = document.getElementById('tutor-capacity-group');
  const signupCapacity = document.getElementById('signup-capacity');

  let isLogin = true;

  // Toggle between Login & Signup
  const handleToggle = (e) => {
    if (e) e.preventDefault();
    isLogin = !isLogin;

    if (isLogin) {
      loginForm.classList.remove('hidden');
      signupForm.classList.add('hidden');
      authSubtitle.textContent = 'Sign in to your account';
      toggleText.innerHTML = `Don't have an account? <a href="#" id="toggle-link">Sign up</a>`;
    } else {
      loginForm.classList.add('hidden');
      signupForm.classList.remove('hidden');
      authSubtitle.textContent = 'Create a new account (MongoDB)';
      toggleText.innerHTML = `Already have an account? <a href="#" id="toggle-link">Sign in</a>`;
    }

    document.getElementById('toggle-link').addEventListener('click', handleToggle);
  };

  toggleLink.addEventListener('click', handleToggle);

  // Tutor fields toggle in signup
  if (signupRole && tutorSubjectGroup && tutorSubjectOtherGroup) {
    signupRole.addEventListener('change', (e) => {
      if (e.target.value === 'tutor') {
        tutorSubjectGroup.classList.remove('hidden');
        if (tutorCapacityGroup) tutorCapacityGroup.classList.remove('hidden');
      } else {
        tutorSubjectGroup.classList.add('hidden');
        tutorSubjectOtherGroup.classList.add('hidden');
        if (tutorCapacityGroup) tutorCapacityGroup.classList.add('hidden');
      }
    });

    if (signupSubjectOtherCb) {
      signupSubjectOtherCb.addEventListener('change', (e) => {
        if (e.target.checked) {
          tutorSubjectOtherGroup.classList.remove('hidden');
        } else {
          tutorSubjectOtherGroup.classList.add('hidden');
        }
      });
    }
  }

  // Error display helpers
  const showError = (id, message) => {
    const errorEl = document.getElementById(`${id}-error`);
    if (errorEl) {
      errorEl.textContent = message;
      const inputEl = document.getElementById(id);
      if (inputEl) inputEl.style.borderColor = 'var(--error-color)';
    }
  };

  const clearErrors = (formId) => {
    const form = document.getElementById(formId);
    if (!form) return;
    const errors = form.querySelectorAll('.error-message');
    const inputs = form.querySelectorAll('input');

    errors.forEach(e => (e.textContent = ''));
    inputs.forEach(i => (i.style.borderColor = ''));
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Demo Login Buttons
  const fillAndSubmitLogin = (email, password) => {
    if (!isLogin) handleToggle();
    document.getElementById('login-email').value = email;
    document.getElementById('login-password').value = password;
    loginForm.dispatchEvent(new Event('submit'));
  };

  const demoTutor1 = document.getElementById('demo-tutor-1');
  const demoTutor2 = document.getElementById('demo-tutor-2');
  const demoStudent = document.getElementById('demo-student');

  if (demoTutor1) demoTutor1.addEventListener('click', () => fillAndSubmitLogin('sarah@tutors.edu', 'password123'));
  if (demoTutor2) demoTutor2.addEventListener('click', () => fillAndSubmitLogin('alex@tutors.edu', 'password123'));
  if (demoStudent) demoStudent.addEventListener('click', () => fillAndSubmitLogin('john@student.edu', 'password123'));

  // Check URL query parameters (e.g. ?email=...)
  const urlParams = new URLSearchParams(window.location.search);
  const emailParam = urlParams.get('email');
  if (emailParam) {
    document.getElementById('login-email').value = emailParam;
    document.getElementById('login-password').value = 'password123';
  }

  // Handle Login Submit
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors('login-form');

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const submitBtn = document.getElementById('login-btn');

    let isValid = true;
    if (!validateEmail(email)) {
      showError('login-email', 'Please enter a valid email address');
      isValid = false;
    }
    if (password.length === 0) {
      showError('login-password', 'Password is required');
      isValid = false;
    }

    if (!isValid) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Verifying via MongoDB API...</span>';

    try {
      const response = await api.login(email, password);
      toast.show('Login successful!', 'success');

      setTimeout(() => {
        window.location.href = response.user.role === 'tutor' ? 'tutor.html' : 'student.html';
      }, 500);
    } catch (err) {
      showError('login-password', err.message || 'Invalid credentials');
      toast.show(err.message || 'Login failed', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Sign In</span>';
    }
  });

  // Handle Signup Submit
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors('signup-form');

    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const role = document.getElementById('signup-role').value;
    const submitBtn = document.getElementById('signup-btn');

    let subjects = [];
    let maxCapacity = 1;

    if (role === 'tutor') {
      const checkedBoxes = document.querySelectorAll('input[name="subject"]:checked');
      checkedBoxes.forEach(cb => {
        if (cb.value === 'Other') {
          if (signupSubjectOther.value.trim()) subjects.push(signupSubjectOther.value.trim());
        } else {
          subjects.push(cb.value);
        }
      });
      maxCapacity = parseInt(signupCapacity.value, 10) || 1;
    }

    let isValid = true;
    if (name.length < 2) {
      showError('signup-name', 'Name must be at least 2 characters');
      isValid = false;
    }
    if (!validateEmail(email)) {
      showError('signup-email', 'Please enter a valid email address');
      isValid = false;
    }
    if (password.length < 6) {
      showError('signup-password', 'Password must be at least 6 characters');
      isValid = false;
    }
    if (role === 'tutor' && subjects.length === 0) {
      showError('signup-name', 'Please select at least one subject');
      isValid = false;
    }

    if (!isValid) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Creating MongoDB User...</span>';

    try {
      const response = await api.register({
        name,
        email,
        password,
        role,
        subjects,
        maxCapacity
      });

      toast.show('Account created in MongoDB successfully!', 'success');

      setTimeout(() => {
        window.location.href = response.user.role === 'tutor' ? 'tutor.html' : 'student.html';
      }, 500);
    } catch (err) {
      showError('signup-email', err.message || 'Signup failed');
      toast.show(err.message || 'Registration failed', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Create Account (MongoDB)</span>';
    }
  });
});
