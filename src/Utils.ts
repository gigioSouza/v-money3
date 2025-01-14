import { VMoneyOptions } from './options';

const RESTRICTED_CHARACTERS: string[] = ['+', '-']; // and number [0-9]
const RESTRICTED_OPTIONS: string[] = ['decimal', 'thousands', 'prefix', 'suffix'];

class Utils {
  static between(min: number, n: number, max: number): number {
    return Math.max(min, Math.min(n, max));
  }

  // Uncaught RangeError: toFixed() digits argument must be between 0 and 20 at NumberParam.toFixed
  static fixed(precision: number): number {
    return Utils.between(0, precision, 1000);
  }

  static numbersToCurrency(numbers: string, precision: number): string {
    numbers = numbers.padStart(precision + 1, '0');
    return precision === 0 ? numbers : `${numbers.slice(0, -precision)}.${numbers.slice(-precision)}`;
  }

  static toStr(value: string|number): string {
    return value ? value.toString() : '';
  }

  static onlyNumbers(input: number|string): string {
    return Utils.toStr(input).replace(/\D+/g, '') || '0';
  }

  static addThousandSeparator(integer: string, separator: string): string {
    return integer.replace(/(\d)(?=(?:\d{3})+\b)/gm, `$1${separator}`);
  }

  static joinIntegerAndDecimal(integer: string, decimal: string, separator: string) {
    return decimal ? integer + separator + decimal : integer;
  }

  static validateRestrictedInput(value: any, caller: string): boolean {
    if (RESTRICTED_CHARACTERS.includes(value)) {
      console.warn(`v-money3 "${caller}" property don't accept "${value}" as a value.`);
      return false;
    }
    if ((/\d/g).test(value)) {
      console.warn(`v-money3 "${caller}" property don't accept "${value}" (any number) as a value.`);
      return false;
    }
    return true;
  }

  static validateRestrictedOptions(opt: VMoneyOptions): boolean {
    for (const target of RESTRICTED_OPTIONS) {
      const isValid = Utils.validateRestrictedInput(opt[target], target);
      if (!isValid) {
        return false;
      }
    }
    return true;
  }

  static filterRestrictedCharactersFromRestrictedOptions(opt: VMoneyOptions): VMoneyOptions {
    for (const option of RESTRICTED_OPTIONS) {
      for (const character of RESTRICTED_CHARACTERS) {
        opt[option] = opt[option].replaceAll(character, '');
      }
    }
    return opt;
  }

  static filterNumbersFromRestrictedOptions(opt: VMoneyOptions): VMoneyOptions {
    for (const option of RESTRICTED_OPTIONS) {
      opt[option] = opt[option].replace(/\d+/g, '');
    }
    return opt;
  }

  static filterOptRestrictions(opt: VMoneyOptions): VMoneyOptions {
    opt = Utils.filterRestrictedCharactersFromRestrictedOptions(opt);
    opt = Utils.filterNumbersFromRestrictedOptions(opt);

    return opt;
  }

  static guessFloatPrecision(string: string): number {
    const total = string.length;
    const index = string.indexOf('.');
    return total - (index + 1);
  }

  static removeLeadingZeros(string: string): string {
    return string.replace(/^(-?)0+(?!\.)(.+)/, '$1$2');
  }

  static isValidInteger(str: string): boolean {
    return (/^-?[\d]+$/g).test(str);
  }

  static isValidFloat(str: string): boolean {
    return (/^-?[\d]+(\.[\d]+)$/g).test(str);
  }

  static replaceAt(str: string, index: number, chr: string|number): string {
    if (index > str.length - 1) return str;
    return str.substring(0, index) + chr + str.substring(index + 1);
  }

  static round(string: string, precision: number): string {
    const diff = precision - Utils.guessFloatPrecision(string);
    if (diff >= 0) {
      return string;
    }

    let firstPiece = string.slice(0, diff);
    const lastPiece = string.slice(diff);

    if (firstPiece.charAt(firstPiece.length - 1) === '.') {
      firstPiece = firstPiece.slice(0, -1);
    }

    if (parseInt(lastPiece.charAt(0), 10) >= 5) {
      for (let i = firstPiece.length - 1; i >= 0; i -= 1) {
        const char = firstPiece.charAt(i);
        if (char !== '.' && char !== '-') {
          const newValue = parseInt(char, 10) + 1;
          if (newValue < 10) {
            return Utils.replaceAt(firstPiece, i, newValue);
          }

          firstPiece = Utils.replaceAt(firstPiece, i, '0');
        }
      }

      return `1${firstPiece}`;
    }
    return firstPiece;
  }

  static setCursor(el: HTMLInputElement, position: number): void {
    const setSelectionRange = () => {
      el.setSelectionRange(position, position);
    };
    if (el === document.activeElement) {
      setSelectionRange();
      setTimeout(setSelectionRange, 1); // Android Fix
    }
  }

  // https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events#The_old-fashioned_way
  static event(name: string): Event {
    const evt = document.createEvent('Event');
    evt.initEvent(name, true, true);
    return evt;
  }

  static debug({ debug = false }: VMoneyOptions, ...args: any): void {
    if (debug) console.log(...args);
  }
}

export default Utils;
export { RESTRICTED_CHARACTERS, RESTRICTED_OPTIONS };
