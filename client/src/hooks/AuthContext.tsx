import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
  createContext,
  useContext
} from 'react';
import {
  TUser,
  TLoginResponse,
  setTokenHeader,
  useLoginUserMutation,
  useLogoutUserMutation,
  useGetUserQuery,
  useRefreshTokenMutation,
  TLoginUser
} from '~/data-provider';
import { useNavigate, useLocation } from 'react-router-dom';

export type TAuthContext = {
  user: TUser | undefined;
  token: string | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | undefined;
  login: (data: TLoginUser) => void;
  logout: () => void;
};

export type TUserContext = {
  user?: TUser | undefined;
  token: string | undefined;
  isAuthenticated: boolean;
  redirect?: string;
};

const AuthContext = createContext<TAuthContext | undefined>(undefined);

const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<TUser | undefined>(undefined);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const navigate = useNavigate();

  const loginUser = useLoginUserMutation();
  const logoutUser = useLogoutUserMutation();
  const userQuery = useGetUserQuery({ enabled: !!token });
  const refreshToken = useRefreshTokenMutation();

  const location = useLocation();

  const setUserContext = (userContext: TUserContext) => {
    const { token, isAuthenticated, user, redirect } = userContext;
    if (user) {
      setUser(user);
    }
    if (token) {
      setToken(token);
      setTokenHeader(token);
    }
    setIsAuthenticated(isAuthenticated);
    if (redirect) {
      navigate(redirect);
    }
  };

  const getCookieValue = (key) => {
    let keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : null;
  };

  const login = (data: TLoginUser) => {
    loginUser.mutate(data, {
      onSuccess: (data: TLoginResponse) => {
        const { user, token } = data;
        setUserContext({ token, isAuthenticated: true, user, redirect: '/chat/new' });
      },
      onError: (error: any) => {
        setError(error.message);
      }
    });
  };

  const logout = () => {
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });
    logoutUser.mutate(undefined, {
      onSuccess: () => {
        setUserContext({
          token: undefined,
          isAuthenticated: false,
          user: undefined,
          redirect: '/login'
        });
      },
      onError: (error: any) => {
        setError(error.message);
      }
    });
  };

  useEffect(() => {
    if (userQuery.data) {
      setUser(userQuery.data);
    } else if (userQuery.isError) {
      // @ts-ignore ignore error
      setError(userQuery.error.message);
      navigate('/login');
    }
    if (error && isAuthenticated) {
      setError(undefined);
    }
    if (!token || !isAuthenticated) {
      const tokenFromCookie = getCookieValue('token');
      if (tokenFromCookie) {
        // debugger;
        setUserContext({ token: tokenFromCookie, isAuthenticated: true, user: userQuery.data });
      } else {
        navigate('/login');
      }
    }
  }, [token, isAuthenticated, userQuery.data, userQuery.isError]);

  const silentRefresh = useCallback(() => {
    refreshToken.mutate(undefined, {
      onSuccess: (data: TLoginResponse) => {
        const { user, token } = data;
        setUserContext({ token, isAuthenticated: true, user });
      },
      onError: (error: any) => {
        setError(error.message);
      }
    });
  }, [setUserContext]);

  useEffect(() => {
    if (loginUser.isLoading || logoutUser.isLoading) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [loginUser.isLoading, logoutUser.isLoading]);

  useEffect(() => {
    if (token) {
      const refreshInterval = setInterval(() => {
        silentRefresh();
      }, 1000 * 60 * 5);
      return () => clearInterval(refreshInterval);
    }
  }, [token, silentRefresh]);

  // Make the provider update only when it should
  const memoedValue = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      isLoading,
      error,
      login,
      logout
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, isLoading, error, isAuthenticated, token, setTokenHeader]
  );

  return <AuthContext.Provider value={memoedValue}>{children}</AuthContext.Provider>;
};

const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuthContext should be used inside AuthProvider');
  }

  return context;
};

export { AuthContextProvider, useAuthContext };
