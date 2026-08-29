"use server";

import { redirect } from "next/navigation";

import { safeNextPath } from "../application/safe_next_path";
import { submitSignIn, submitSignUp, type AuthFormState } from "../application/submit_auth";
import { createServerAuthGateway } from "../infrastructure/server_auth_gateway";

function credentialsFrom(formData: FormData): unknown {
  return {
    email: formData.get("email"),
    password: formData.get("password"),
  };
}

function nextPathFrom(formData: FormData): string | undefined {
  const value = formData.get("next");
  return typeof value === "string" ? value : undefined;
}

export async function signInAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const result = await submitSignIn(await createServerAuthGateway(), credentialsFrom(formData));

  if (!result.success) {
    return result.state;
  }

  redirect(safeNextPath(nextPathFrom(formData)));
}

export async function signUpAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const result = await submitSignUp(await createServerAuthGateway(), credentialsFrom(formData));

  if (!result.success) {
    return result.state;
  }

  redirect(safeNextPath(nextPathFrom(formData)));
}

export async function signOutAction(): Promise<never> {
  const gateway = await createServerAuthGateway();
  await gateway.signOut();
  redirect("/login");
}
