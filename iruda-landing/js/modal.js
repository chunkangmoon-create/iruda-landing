// =============================================
// Google Apps Script 웹앱 URL을 여기에 붙여넣기
// =============================================
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzv78sppZgrYGyhcnSMNh9vABVtZGac4ltCxM_Q3DC0Q3SbqkCln9CFjsx2oH7ECQJY/exec';

// =============================================
// 모달 열기 / 닫기
// =============================================
function openModal() {
  const overlay = document.getElementById('consultModal');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const overlay = document.getElementById('consultModal');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
  resetForm();
}

// 오버레이 클릭 시 닫기
document.getElementById('consultModal').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

// ESC 키로 닫기
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeModal();
});

// =============================================
// 유효성 검사
// =============================================
function validateField(input, errorEl, message) {
  if (!input.value.trim()) {
    input.classList.add('error');
    errorEl.textContent = message;
    errorEl.classList.add('visible');
    return false;
  }
  input.classList.remove('error');
  errorEl.classList.remove('visible');
  return true;
}

function validatePhone(input, errorEl) {
  const val = input.value.trim();
  if (!val) {
    input.classList.add('error');
    errorEl.textContent = '연락처를 입력해주세요.';
    errorEl.classList.add('visible');
    return false;
  }
  const phoneRegex = /^\d{3}-\d{4}-\d{4}$/;
  if (!phoneRegex.test(val)) {
    input.classList.add('error');
    errorEl.textContent = '올바른 연락처 형식으로 입력해주세요. (예: 010-1234-5678)';
    errorEl.classList.add('visible');
    return false;
  }
  input.classList.remove('error');
  errorEl.classList.remove('visible');
  return true;
}

// 전화번호 자동 포맷 (010-XXXX-XXXX)
document.getElementById('inputPhone').addEventListener('input', function () {
  let digits = this.value.replace(/\D/g, '');
  if (digits.length > 11) digits = digits.slice(0, 11);

  let formatted = '';
  if (digits.length <= 3) {
    formatted = digits;
  } else if (digits.length <= 7) {
    formatted = digits.slice(0, 3) + '-' + digits.slice(3);
  } else {
    formatted = digits.slice(0, 3) + '-' + digits.slice(3, 7) + '-' + digits.slice(7);
  }
  this.value = formatted;
});

// =============================================
// 폼 초기화
// =============================================
function resetForm() {
  const form = document.getElementById('consultForm');
  form.reset();
  form.querySelectorAll('input, textarea').forEach(el => el.classList.remove('error'));
  form.querySelectorAll('.error-msg').forEach(el => el.classList.remove('visible'));

  document.getElementById('consultForm').style.display = 'flex';
  document.getElementById('successMsg').classList.remove('visible');
  document.getElementById('errorMsg').classList.remove('visible');
}

// =============================================
// 폼 제출
// =============================================
document.getElementById('consultForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const nameInput    = document.getElementById('inputName');
  const phoneInput   = document.getElementById('inputPhone');
  const messageInput = document.getElementById('inputMessage');

  const nameError    = document.getElementById('nameError');
  const phoneError   = document.getElementById('phoneError');
  const messageError = document.getElementById('messageError');

  // 유효성 검사
  const isNameValid    = validateField(nameInput, nameError, '이름을 입력해주세요.');
  const isPhoneValid   = validatePhone(phoneInput, phoneError);
  const isMessageValid = validateField(messageInput, messageError, '문의 내용을 입력해주세요.');

  if (!isNameValid || !isPhoneValid || !isMessageValid) return;

  // 제출 중 상태
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = '제출 중...';

  const payload = {
    name:    nameInput.value.trim(),
    phone:   phoneInput.value.trim(),
    message: messageInput.value.trim(),
  };

  try {
    const formData = new URLSearchParams(payload);
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: formData,
    });

    // no-cors 모드에선 응답 확인 불가 → 제출 성공으로 처리
    document.getElementById('consultForm').style.display = 'none';
    document.getElementById('successMsg').classList.add('visible');

  } catch (err) {
    document.getElementById('errorMsg').classList.add('visible');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '신청하기';
  }
});
