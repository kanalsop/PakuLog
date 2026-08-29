import { z } from "zod";

const authCredentialsSchema = z.object({
  email: z.string().trim().email("有効なメールアドレスを入力してください"),
  password: z
    .string()
    .min(8, "パスワードは8文字以上で入力してください")
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, "パスワードには英字と数字を含めてください"),
});

export type AuthCredentials = z.infer<typeof authCredentialsSchema>;

export type AuthCredentialFieldErrors = Partial<Record<keyof AuthCredentials, string[]>>;

export type AuthCredentialsParseResult =
  | { success: true; data: AuthCredentials }
  | { success: false; fieldErrors: AuthCredentialFieldErrors };

export function parseAuthCredentials(input: unknown): AuthCredentialsParseResult {
  const result = authCredentialsSchema.safeParse(input);

  if (!result.success) {
    return { success: false, fieldErrors: z.flattenError(result.error).fieldErrors };
  }

  return { success: true, data: result.data };
}
