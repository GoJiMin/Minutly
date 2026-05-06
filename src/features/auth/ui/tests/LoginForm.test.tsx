import mockRouter from 'next-router-mock';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {LoginForm} from '../LoginForm';
import {fetchLogin} from '@/entities/auth/api/authApi';
import {withAllContext} from '@/shared/utils/withAllContext';

jest.mock('@/entities/auth/api/authApi');

const mockedFetchLogin = jest.mocked(fetchLogin);

describe('@/src/features/auth/ui/LoginForm.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockRouter.reset();
  });

  it('로그인 폼이 렌더링된다.', () => {
    render(withAllContext(<LoginForm />));

    expect(screen.getByLabelText('아이디')).toBeInTheDocument();
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
  });

  it('아이디와 비밀번호를 입력하지 않고 제출하면 에러 메세지를 표시한다.', async () => {
    const user = userEvent.setup();

    render(withAllContext(<LoginForm />));

    await user.click(screen.getByRole('button', {name: '로그인'}));

    expect(screen.getByText('아이디를 입력해주세요.')).toBeInTheDocument();
    expect(screen.getByText('비밀번호를 입력해주세요.')).toBeInTheDocument();
  });

  it('아이디를 101자 이상, 비밀번호를 201자 이상 입력하면 에러 메세지를 표시한다.', async () => {
    const user = userEvent.setup();

    render(withAllContext(<LoginForm />));

    const idInput = screen.getByLabelText('아이디');
    const passwordInput = screen.getByLabelText('비밀번호');

    await user.type(idInput, 'a'.repeat(101));
    await user.type(passwordInput, 'a'.repeat(201));

    await user.click(screen.getByRole('button', {name: '로그인'}));

    expect(screen.getByText('아이디는 100자 이하로 입력해주세요.')).toBeInTheDocument();
    expect(screen.getByText('비밀번호는 200자 이하로 입력해주세요.')).toBeInTheDocument();
  });

  it('로그인에 성공하면 메인페이지로 이동한다.', async () => {
    const user = userEvent.setup();

    mockRouter.push('/login');
    mockedFetchLogin.mockResolvedValue();

    render(withAllContext(<LoginForm />));

    const idInput = screen.getByLabelText('아이디');
    const passwordInput = screen.getByLabelText('비밀번호');

    await user.type(idInput, 'correct-id');
    await user.type(passwordInput, 'correct-password');

    await user.click(screen.getByRole('button', {name: '로그인'}));

    await waitFor(() => {
      expect(mockedFetchLogin).toHaveBeenCalledTimes(1);
      expect(mockedFetchLogin).toHaveBeenCalledWith(
        {
          id: 'correct-id',
          password: 'correct-password',
        },
        expect.any(Object),
      );
      expect(mockRouter.asPath).toBe('/');
    });
  });
});
