import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t, i18n } = useTranslation();
  return (
    <div className="hidden px-3 pb-1 pt-2 text-center text-xs text-black/50 dark:text-white/50 md:block md:px-4 md:pb-4 md:pt-3">
      
      {import.meta.env.VITE_APP_TITLE || t("productName")}{t("footerNotes")}
    </div>
  );
}
