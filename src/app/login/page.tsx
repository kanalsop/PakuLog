import { safeNextPath } from "../../modules/auth/application/safe_next_path";
import { AuthPage } from "../../modules/auth/ui/auth_page";

interface LoginPageProperties {
  searchParams: Promise<{ next?: string | string[] }>;
}

export default async function LoginPage({ searchParams }: LoginPageProperties) {
  const next = (await searchParams).next;
  const nextPath = safeNextPath(typeof next === "string" ? next : undefined);

  return <AuthPage mode="signIn" nextPath={nextPath} />;
}
