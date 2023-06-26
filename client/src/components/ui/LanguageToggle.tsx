import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageToggle = forwardRef(() => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'en' ? 'zh' : 'en';
    changeLanguage(newLanguage);
  };

  return (
    <div className="fixed right-2 top-2 w-56">
      <div
        className="relative mx-8 mt-4 flex h-10 items-center rounded-full p-1 shadow"
        onClick={toggleLanguage}
      >
        <div className="flex w-full justify-center">
          <button>English</button>
        </div>
        <div className={'flex w-full justify-center'}>
          <button>简体中文</button>
        </div>
        <span
          className={`elSwitch absolute top-[4px] flex h-8 w-1/2 items-center justify-center rounded-full bg-green-500 text-white shadow transition-all ${
            i18n.language === 'en' ? 'left-1' : 'left-[50%]'
          }`}
        >
          {i18n.language === 'en' ? 'English' : '简体中文'}
        </span>
      </div>
    </div>
  );
});

export default LanguageToggle;
