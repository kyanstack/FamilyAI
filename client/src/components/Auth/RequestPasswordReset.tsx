import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRequestPasswordResetMutation, TRequestPasswordReset } from '~/data-provider';
import { useTranslation } from 'react-i18next';

function RequestPasswordReset() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<TRequestPasswordReset>();
  const requestPasswordReset = useRequestPasswordResetMutation();
  const [success, setSuccess] = useState<boolean>(false);
  const [requestError, setRequestError] = useState<boolean>(false);

  const onSubmit = (data: TRequestPasswordReset) => {
    requestPasswordReset.mutate(data, {
      onSuccess: () => {
        setSuccess(true);
      },
      onError: () => {
        setRequestError(true);
        setTimeout(() => {
          setRequestError(false);
        }, 5000);
      }
    });
  };

  const { t, i18n } = useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const toggleLanguage = () => {
    const newLanguage = i18n.language === "en" ? "zh" : "en";
    changeLanguage(newLanguage);
  };
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white pt-6 sm:pt-0">
      <div className="mt-6 w-96 overflow-hidden bg-white px-6 py-4 sm:max-w-md sm:rounded-lg">
        <h1 className="mb-4 text-center text-3xl font-semibold">{t("resetPassword")}</h1>
        {success && (
          <div
            className="relative mt-4 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700"
            role="alert"
          >
            {t('resetPasswordEmailSent')}
          </div>
        )}
        {requestError && (
          <div
            className="relative mt-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
            role="alert"
          >
            {t('resetPasswordEmailError')}
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
                type="email"
                id="email"
                autoComplete="off"
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
                {t('email')}
              </label>
            </div>
            {errors.email && (
              <span role="alert" className="mt-1 text-sm text-red-600">
                {/* @ts-ignore ignore */}
                {errors.email.message}
              </span>
            )}
          </div>
          <div className="mt-6">
            <button
              type="submit"
              disabled={!!errors.email}
              className="w-full rounded-sm border border-transparent bg-green-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-600 focus:outline-none active:bg-green-500"
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

export default RequestPasswordReset;
