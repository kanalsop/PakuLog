import {
  parseAuthCredentials,
  type AuthCredentialFieldErrors,
  type AuthCredentials,
} from "./auth_credentials";
import { authErrorMessage } from "./auth_error_message";

export interface AuthGateway {
  signIn(credentials: AuthCredentials): Promise<{ errorCode?: string }>;
  signUp(credentials: AuthCredentials): Promise<{ errorCode?: string; sessionCreated: boolean }>;
}

export interface AuthFormState {
  email?: string;
  fieldErrors?: AuthCredentialFieldErrors;
  message?: string;
}

export type AuthSubmissionResult = { success: true } | { success: false; state: AuthFormState };

export async function submitSignIn(
  gateway: AuthGateway,
  input: unknown,
): Promise<AuthSubmissionResult> {
  const credentials = parseAuthCredentials(input);

  if (!credentials.success) {
    return { success: false, state: { fieldErrors: credentials.fieldErrors } };
  }

  const result = await gateway.signIn(credentials.data);

  if (result.errorCode) {
    return {
      success: false,
      state: {
        email: credentials.data.email,
        message: authErrorMessage(result.errorCode, "signIn"),
      },
    };
  }

  return { success: true };
}

export async function submitSignUp(
  gateway: AuthGateway,
  input: unknown,
): Promise<AuthSubmissionResult> {
  const credentials = parseAuthCredentials(input);

  if (!credentials.success) {
    return { success: false, state: { fieldErrors: credentials.fieldErrors } };
  }

  const result = await gateway.signUp(credentials.data);

  if (result.errorCode) {
    return {
      success: false,
      state: {
        email: credentials.data.email,
        message: authErrorMessage(result.errorCode, "signUp"),
      },
    };
  }

  if (!result.sessionCreated) {
    return {
      success: false,
      state: {
        email: credentials.data.email,
        message:
          "アカウントを作成しましたが、ログインを開始できませんでした。管理者へお問い合わせください",
      },
    };
  }

  return { success: true };
}
