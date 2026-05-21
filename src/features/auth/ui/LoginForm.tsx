'use client';

import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {LoginRequest, loginRequestSchema, useFetchLogin} from '@/entities/auth';
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
  Spinner,
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

  const {login, isPendingLogin} = useFetchLogin();

  const onSubmit = (data: LoginRequest) => {
    if (isPendingLogin) return;

    login(data);
  };

  return (
    <Card className="w-full md:max-w-sm h-fit flex flex-col rounded-xl">
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
                    className="h-10 rounded-lg border-border bg-muted/30 px-3 font-medium text-sm focus-visible:bg-white"
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
                    className="h-10 rounded-lg border-border bg-muted/30 px-3 font-medium text-sm focus-visible:bg-white"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          form="login-form"
          size="lg"
          className="w-full font-semibold rounded-lg"
          disabled={isPendingLogin}
        >
          {isPendingLogin ? <Spinner /> : '로그인'}
        </Button>
      </CardFooter>
    </Card>
  );
}
