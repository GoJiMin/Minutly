import z from 'zod';

export const loginRequestSchema = z.object({
  id: z.string().trim().min(1, '아이디를 입력해주세요.').max(100, '아이디는 100자 이하로 입력해주세요.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.').max(200, '비밀번호는 200자 이하로 입력해주세요.'),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
