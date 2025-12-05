export const validatePhone = (phone: string): string | null => {
  const trimmed = phone.trim();
  if (!trimmed) {
    return '휴대폰 번호를 입력해주세요.';
  }

  if (!/^[0-9+\-\s]+$/.test(trimmed)) {
    return '휴대폰 번호 형식이 올바르지 않습니다.';
  }

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 9 || digits.length > 12) {
    return '휴대폰 번호 길이가 올바르지 않습니다.';
  }

  return null;
};

export const validatePlate4 = (plate4: string): string | null => {
  const trimmed = plate4.trim();
  if (!trimmed) {
    return '차량 번호 뒤 4자리를 입력해주세요.';
  }

  if (!/^\d{4}$/.test(trimmed)) {
    return '차량 번호는 숫자 4자리여야 합니다.';
  }

  return null;
};

export const validateModel = (model: string): string | null => {
  const trimmed = model.trim();
  if (!trimmed) {
    return '차량 이름/모델을 입력해주세요.';
  }

  if (trimmed.length > 50) {
    return '차량 이름/모델은 50자 이내로 입력해주세요.';
  }

  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return '비밀번호를 입력해주세요.';
  }

  if (password.length < 6) {
    return '비밀번호는 최소 6자 이상이어야 합니다.';
  }

  if (password.length > 100) {
    return '비밀번호가 너무 깁니다.';
  }

  return null;
};

