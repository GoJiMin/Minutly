'use client';

import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import Image from 'next/image';
import {LoginRequest, loginRequestSchema} from '@/entities/auth';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
} from '@/shared/components';

export function LoginForm() {
  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: {
      id: '',
      password: '',
    },
    mode: 'onSubmit',
  });

  const onSubmit = (data: LoginRequest) => {
    // TODO: 로그인 요청 훅 연결
    console.log(data);
  };

  return (
    <Card className="w-full md:max-w-sm h-fit flex flex-col">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Minutly</CardTitle>
        <CardDescription>보안을 위해 아이디와 비밀번호를 입력해주세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="id"
              control={form.control}
              render={({field, fieldState}) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="pl-1" htmlFor="login-form-id">
                    아이디
                  </FieldLabel>
                  <Input
                    {...field}
                    id="login-form-id"
                    aria-invalid={fieldState.invalid}
                    placeholder="아이디를 입력해주세요."
                    autoComplete="off"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({field, fieldState}) => (
                <Field className="relative" data-invalid={fieldState.invalid}>
                  <FieldLabel className="pl-1" htmlFor="login-form-password">
                    비밀번호
                  </FieldLabel>
                  <Input
                    {...field}
                    type="password"
                    id="login-form-password"
                    aria-invalid={fieldState.invalid}
                    placeholder="*********"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" form="login-form" size="lg" className="w-full font-semibold">
          로그인
        </Button>
      </CardFooter>
    </Card>
  );
}
