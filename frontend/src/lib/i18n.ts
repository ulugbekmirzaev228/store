import uzMessages from '../messages/uz.json';
import ruMessages from '../messages/ru.json';

export type Locale = 'uz' | 'ru';

export const dictionaries = {
  uz: uzMessages,
  ru: ruMessages,
};

export function getDictionary(locale: string = 'uz') {
  if (locale === 'ru') return dictionaries.ru;
  return dictionaries.uz;
}
