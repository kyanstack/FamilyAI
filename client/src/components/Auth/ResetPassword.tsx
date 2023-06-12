import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useResetPasswordMutation, TResetPassword } from '~/data-provider';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
function ResetPassword() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<TResetPassword>();
  const resetPassword = useResetPasswordMutation();
  const [resetError, setResetError] = useState<boolean>(false);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const password = watch('password');

  const { t, i18n } = useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const toggleLanguage = () => {
    const newLanguage = i18n.language === "en" ? "zh" : "en";
    changeLanguage(newLanguage);
  };
  

  const onSubmit = (data: TResetPassword) => {
    resetPassword.mutate(data, {
      onError: () => {
        setResetError(true);
      }
    });
  };

  if (resetPassword.isSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white pt-6 sm:pt-0">
        <div className="mt-6 w-96 overflow-hidden bg-white px-6 py-4 sm:max-w-md sm:rounded-lg">
          <h1 className="mb-4 text-center text-3xl font-semibold">{t('resetPasswordSuccess')}</h1>
          <div
            className="relative mb-8 mt-4 rounded border border-green-400 bg-green-100 px-4 py-3 text-center text-green-700"
            role="alert"
          >
            {t('resetPasswordSuccessMessage')}
          </div>
          <button
            onClick={() => navigate('/login')}
            aria-label="Sign in"
            className="w-full transform rounded-sm bg-green-500 px-4 py-3 tracking-wide text-white transition-colors duration-200 hover:bg-green-600 focus:bg-green-600 focus:outline-none"
          >
            {t('continue')}
          </button>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white pt-6 sm:pt-0">
        <div className="mt-6 w-96 overflow-hidden bg-white px-6 py-4 sm:max-w-md sm:rounded-lg">
          <h1 className="mb-4 text-center text-3xl font-semibold">{t('resetPassword')}</h1>
          {resetError && (
            <div
              className="relative mt-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
              role="alert"
            >
              {t('resetPasswordTokenExpired')}{' '}
              <a className="font-semibold text-green-600 hover:underline" href="/forgot-password">
                {t('clickHere')}
              </a>{' '}
              {t('toTryAgain')}
            </div>
          )}
          <form
            className="mt-6"
            aria-label="Password reset form"
            method="POST"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="mb-2">
              <div className="relative">
                <input
                  type="hidden"
                  id="token"
                  value={params.get('token')}
                  {...register('token', { required: 'Unable to process: No valid reset token' })}
                />
                <input
                  type="hidden"
                  id="userId"
                  value={params.get('userId')}
                  {...register('userId', { required: 'Unable to process: No valid user id' })}
                />
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
                  className="absolute left-2.5 top-4 z-10 origin-[0] -translate-y-4 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-green-500"
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
            <div className="mb-2">
              <div className="relative">
                <input
                  type="password"
                  id="confirm_password"
                  aria-label="Confirm Password"
                  // uncomment to prevent pasting in confirm field
                  onPaste={(e) => {
                    e.preventDefault();
                    return false;
                  }}
                  {...register('confirm_password', {
                    validate: (value) => value === password || t('passwordsDontMatch')
                  })}
                  aria-invalid={!!errors.confirm_password}
                  className="peer block w-full appearance-none rounded-t-md border-0 border-b-2 border-gray-300 bg-gray-50 px-2.5 pb-2.5 pt-5 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-0"
                  placeholder=" "
                ></input>
                <label
                  htmlFor="confirm_password"
                  className="absolute left-2.5 top-4 z-10 origin-[0] -translate-y-4 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-green-500"
                >
                  {t('confirmPassword')}
                </label>
              </div>
              {errors.confirm_password && (
                <span role="alert" className="mt-1 text-sm text-red-600">
                  {/* @ts-ignore */}
                  {errors.confirm_password.message}
                </span>
              )}
              {errors.token && (
                <span role="alert" className="mt-1 text-sm text-red-600">
                  {/* @ts-ignore */}
                  {errors.token.message}
                </span>
              )}
              {errors.userId && (
                <span role="alert" className="mt-1 text-sm text-red-600">
                  {/* @ts-ignore */}
                  {errors.userId.message}
                </span>
              )}
            </div>
            <div className="mt-6">
              <button
                disabled={!!errors.password || !!errors.confirm_password}
                type="submit"
                aria-label="Submit registration"
                className="w-full transform rounded-sm bg-green-500 px-4 py-3 tracking-wide text-white transition-colors duration-200 hover:bg-green-600 focus:bg-green-600 focus:outline-none"
              >
                {t('continue')}
              </button>
            </div>
          </form>
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
}

export default ResetPassword;
