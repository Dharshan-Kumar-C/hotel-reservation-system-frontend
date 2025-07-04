function toggleLogin(role) {
  const adminForm = document.getElementById('admin-login');
  const guestForm = document.getElementById('guest-login');
  if (role === 'admin') {
    adminForm.style.display = 'block';
    guestForm.style.display = 'none';
  } else {
    adminForm.style.display = 'none';
    guestForm.style.display = 'block';
  }
}

// Example: Show/hide password
function togglePassword(inputId, toggleIconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(toggleIconId);
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.add('active');
  } else {
    input.type = 'password';
    icon.classList.remove('active');
  }
}

// Example: Simple form validation
function validateForm(formId) {
  const form = document.getElementById(formId);
  let valid = true;
  form.querySelectorAll('input[required]').forEach(input => {
    if (!input.value.trim()) {
      input.classList.add('error');
      valid = false;
    } else {
      input.classList.remove('error');
    }
  });
  return valid;
}

// Example: Modal open/close
function openModal(modalId) {
  document.getElementById(modalId).classList.add('open');
}
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('open');
}
