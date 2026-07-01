import { cookieUtils } from "@/lib/cookies";
import { apiFetch } from "@/lib/api-fetch";

interface SendOtpBody {
  phone_number: string;
}

interface VerifyOtpBody {
  phone_number: string;
  otp_code: string;
}

interface VerifyOtpResponse {
  access: string;
  refresh: string;
  user?: {
    id: string;
    phone: string;
    full_name?: string;
  } | null;
  is_new_user?: boolean;
}

interface RegisterBody {
  phone_number: string;
  full_name: string;
  job: string;
  living_city: string;
  birth_at: string;
  gender: "male" | "female";
}

interface RegisterResponse {
  access: string;
  refresh: string;
  user: {
    id: string;
    phone: string;
    full_name: string;
  };
}

interface RefreshBody {
  refresh: string;
}

interface RefreshResponse {
  access: string;
}

class AuthApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
  }
}

async function request<T>(
  path: string,
  body: Record<string, unknown>
): Promise<T> {
  const res = await apiFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    let message = "خطایی رخ داد";
    if (typeof data === "string") {
      message = data;
    } else if (data.detail) {
      message = data.detail;
    } else if (Array.isArray(data)) {
      message = data.join(" | ");
    } else if (typeof data === "object") {
      const fieldErrors: string[] = [];
      for (const key in data) {
        const val = data[key];
        if (Array.isArray(val)) {
          fieldErrors.push(val.join("، "));
        } else if (typeof val === "string") {
          fieldErrors.push(val);
        }
      }
      if (fieldErrors.length) {
        message = fieldErrors.join(" | ");
      }
    }
    throw new AuthApiError(message, res.status);
  }

  return data as T;
}

export async function sendOtp(phoneNumber: string) {
  return request<{ detail?: string; is_new_user?: boolean }>(
    "/accounts/auth/send-otp/",
    { phone_number: phoneNumber }
  );
}

export async function verifyOtp(
  phoneNumber: string,
  otpCode: string
): Promise<VerifyOtpResponse> {
  const data = await request<VerifyOtpResponse>(
    "/accounts/auth/verify-otp/",
    {
      phone_number: phoneNumber,
      otp_code: otpCode,
    }
  );

  cookieUtils.setAccessToken(data.access);
  cookieUtils.setRefreshToken(data.refresh);

  return data;
}

export async function registerUser(
  body: RegisterBody
): Promise<RegisterResponse> {
  const data = await request<RegisterResponse>(
    "/accounts/v3/register/",
    body as unknown as Record<string, unknown>
  );

  cookieUtils.setAccessToken(data.access);
  cookieUtils.setRefreshToken(data.refresh);

  return data;
}

export async function refreshToken(): Promise<string | null> {
  const token = cookieUtils.getRefreshToken();
  if (!token) return null;

  try {
    const data = await request<RefreshResponse>("/accounts/auth/refresh/", {
      refresh: token,
    });

    cookieUtils.setAccessToken(data.access);
    return data.access;
  } catch {
    cookieUtils.clearAll();
    return null;
  }
}

export { AuthApiError };
