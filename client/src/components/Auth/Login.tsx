import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { TLoginUser } from '~/data-provider';
import { useAuthContext } from '~/hooks/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Login() {
  const { login, error, isAuthenticated } = useAuthContext();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<TLoginUser>();

  const navigate = useNavigate();

  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const toggleLanguage = () => {
    const newLanguage = i18n.language === "en" ? "zh" : "en";
    changeLanguage(newLanguage);
    setLanguage(newLanguage);
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat/new');
    }
  }, [isAuthenticated, navigate]);

  const SERVER_URL = import.meta.env.DEV
    ? import.meta.env.VITE_SERVER_URL_DEV
    : import.meta.env.VITE_SERVER_URL_PROD;
  const showGoogleLogin = import.meta.env.VITE_SHOW_GOOGLE_LOGIN_OPTION === 'true';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white pt-6 sm:pt-0">
      <div className="mt-6 w-96 overflow-hidden bg-white px-6 py-4 sm:max-w-md sm:rounded-lg">
        <h1 className="mb-4 text-center text-3xl font-semibold">{t('greeting')}</h1>
        {error && (
          <div
            className="relative mt-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
            role="alert"
          >
            {t('error')}
          </div>
        )}
        <form
          className="mt-6"
          aria-label="Login form"
          method="POST"
          onSubmit={handleSubmit((data) => login(data))}
        >
          <div className="mb-2">
            <div className="relative">
              <input
                type="email"
                id="email"
                autoComplete="email"
                aria-label="Email"
                {...register('email', {
                  required: t('emailRequired'),
                  minLength: {
                    value: 3,
                    message: t('shortEmail')
                  },
                  maxLength: {
                    value: 120,
                    message: t('longEmail')
                  },
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: t('emailInvalid')
                  }
                })}
                aria-invalid={!!errors.email}
                className="peer block w-full appearance-none rounded-t-md border-0 border-b-2 border-gray-300 bg-gray-50 px-2.5 pb-2.5 pt-5 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-0"
                placeholder=" "
              ></input>
              <label
                htmlFor="email"
                className="absolute left-2.5 top-4 z-10 origin-[0] -translate-y-4 scale-75 transform text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-green-500"
              >
                {t('emailAddress')}
              </label>
            </div>
            {errors.email && (
              <span role="alert" className="mt-1 text-sm text-red-600">
                {/* @ts-ignore */}
                {errors.email.message}
              </span>
            )}
          </div>
          <div className="mb-2">
            <div className="relative">
              <input
                type="password"
                id="password"
                autoComplete="current-password"
                aria-label="Password"
                {...register('password', {
                  required: t('passwordRequired'),
                  minLength: {
                    value: 8,
                    message: t('shortPassword')
                  },
                  maxLength: {
                    value: 40,
                    message: t('longPassword')
                  }
                })}
                aria-invalid={!!errors.password}
                className="peer block w-full appearance-none rounded-t-md border-0 border-b-2 border-gray-300 bg-gray-50 px-2.5 pb-2.5 pt-5 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-0"
                placeholder=" "
              ></input>
              <label
                htmlFor="password"
                className="absolute left-2.5 top-4 z-10 origin-[0] -translate-y-4 scale-75 transform text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-green-500"
              >
                {t('password')}
              </label>
            </div>

            {errors.password && (
              <span role="alert" className="mt-1 text-sm text-red-600">
                {/* @ts-ignore */}
                {errors.password.message}
              </span>
            )}
          </div>
          <a href="/forgot-password" className="text-sm text-green-500 hover:underline">
            {t('forgotPassword')}
          </a>
          <div className="mt-6">
            <button
              aria-label="Sign in"
              type="submit"
              className="w-full transform rounded-sm bg-green-500 px-4 py-3 tracking-wide text-white transition-colors duration-200 hover:bg-green-600 focus:bg-green-600 focus:outline-none"
            >
              {t('login')}
            </button>
          </div>
        </form>
        <p className="my-4 text-center text-sm font-light text-gray-700">
          {' '}
          {t('noAccount')}{' '}
          <a href="/register" className="p-1 text-green-500 hover:underline">
            {t('signUp')}
          </a>
        </p>
        
      </div>
      <div className="fixed w-56 top-2 right-2">
          <div className="mx-8 shadow rounded-full h-10 mt-4 flex p-1 relative items-center"
          onClick={toggleLanguage}>
              <div className="w-full flex justify-center">
                  <button>English</button>
              </div>
              <div className={'w-full flex justify-center'}>
                  <button>简体中文</button>
              </div>
              <span 
              className={`elSwitch bg-green-500 shadow text-white flex items-center justify-center w-1/2 rounded-full h-8 transition-all top-[4px] absolute ${
                i18n.language === "en" ? "left-1" : "left-[50%]"}`}>
              {i18n.language === "en" ? "English" : "简体中文"}
              </span>
          </div>
        </div>
    </div>
    
  );
}

export default Login;
