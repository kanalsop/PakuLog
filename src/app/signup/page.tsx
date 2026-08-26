import { safeNextPath } from "../../modules/auth/application/safe_next_path";
import { AuthPage } from "../../modules/auth/ui/auth_page";

interface SignupPageProperties {
  searchParams: Promise<{ next?: string | string[] }>;
}

export default async function SignupPage({ searchParams }: SignupPageProperties) {
  const next = (await searchParams).next;
  const nextPath = safeNextPath(typeof next === "string" ? next : undefined);

  return <AuthPage mode="signUp" nextPath={nextPath} />;
}
