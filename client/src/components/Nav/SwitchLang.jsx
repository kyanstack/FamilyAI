import { useTranslation } from 'react-i18next';
import SwitchLangIcon from '../svg/SwitchLangIcon';

const SwitchLang = () => {
    const { t, i18n } = useTranslation();
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const toggleLanguage = () => {
        const newLanguage = i18n.language === "en" ? "zh" : "en";
        changeLanguage(newLanguage);
    };

    return (<button
        className="flex w-full cursor-pointer items-center gap-3 px-3 py-3 text-sm text-white transition-colors duration-200 hover:bg-gray-700"
        onClick={toggleLanguage}
        >
        <SwitchLangIcon />
        {t('switchLangMessage')}
        </button>
    );
};

export default SwitchLang;