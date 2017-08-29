export interface HSLAObject {
  h: number;
  s: number;
  l: number;
  a?: number;
}

export class Color {

  static numberPattern: string = '\\s*(\\d+(?:\\.\\d+)?%?)\\s*';
  static rgbaRegExp: RegExp = new RegExp('rgb(a)?\\(' + Color.numberPattern + ',' + Color.numberPattern + ',' + Color.numberPattern + '(?:,' + Color.numberPattern + ')?\\)');
  static hslaRegExp: RegExp = new RegExp('hsl(a)?\\(' + Color.numberPattern + ',' + Color.numberPattern + ',' + Color.numberPattern + '(?:,' + Color.numberPattern + ')?\\)');


  static fromString(stringColor: string): Color {
    const element: HTMLElement = document.createElement('div');
    element.style.color = stringColor;
    if(element.style.color) {
      document.body.appendChild(element);
      const style: CSSStyleDeclaration = window.getComputedStyle(element);
      const rgbColor: string = style.color;
      document.body.removeChild(element);
      return Color.fromRGB(rgbColor);
    }
    throw new Error('Invalid color : ' + stringColor);
  }

  static fromRGB(rgbColor: string): Color {
    this.rgbaRegExp.lastIndex = 0;
    const match: RegExpExecArray | null = this.rgbaRegExp.exec(rgbColor);
    if(match) {
      if(typeof match[1] === typeof match[5]) { // check if 3 params for rgb and 4 for rgba
        return new Color(
          Color.parseColorNumber(match[2]),
          Color.parseColorNumber(match[3]),
          Color.parseColorNumber(match[4]),
          (match[5] === void 0) ? 255 : (Color.parseColorNumber(match[5], 1) * 255)
        );
      }
    }

    throw new Error('Invalid rgb color : ' + rgbColor);
  }

  static fromHSL(hslColor: string): Color {
    this.hslaRegExp.lastIndex = 0;
    const match: RegExpExecArray | null = this.hslaRegExp.exec(hslColor);
    if(match) {
      if(typeof match[1] === typeof match[5]) { // check if 3 params for hsl and 4 for hsla
        return Color.fromHSLObject({
          h: Color.parseColorNumber(match[2], 360) / 360,
          s: Color.parseColorNumber(match[3], 1),
          l: Color.parseColorNumber(match[4], 1),
          a: (match[5] === void 0) ? 1 : (Color.parseColorNumber(match[5], 1))
        });
      }
    }

    throw new Error('Invalid hsl color : ' + hslColor);
  }

  static fromHSLObject(hslaObject: HSLAObject): Color {
    let r: number, g: number, b: number;

    if(hslaObject.s === 0) {
      r = g = b = hslaObject.l; // achromatic
    } else {
      const q: number = hslaObject.l < 0.5 ? hslaObject.l * (1 + hslaObject.s) : hslaObject.l + hslaObject.s - hslaObject.l * hslaObject.s;
      const p: number = 2 * hslaObject.l - q;
      r = Color.hueToRGB(p, q, hslaObject.h + 1 / 3);
      g = Color.hueToRGB(p, q, hslaObject.h);
      b = Color.hueToRGB(p, q, hslaObject.h - 1 / 3);
    }

    return new Color(
      r * 255,
      g * 255,
      b * 255,
      hslaObject.a ? (hslaObject.a * 255) : 255
    );
  }

  static fromHex(hexColor: string): Color {
    hexColor = hexColor.trim();
    if(hexColor.startsWith('#')) hexColor = hexColor.slice(1);

    switch(hexColor.length) {
      case 3:
        return new Color(
          Color.hexToDecimal(hexColor[0]),
          Color.hexToDecimal(hexColor[1]),
          Color.hexToDecimal(hexColor[2])
        );
      case 6:
      case 8:
        return new Color(
          Color.hexToDecimal(hexColor.slice(0, 2)),
          Color.hexToDecimal(hexColor.slice(2, 4)),
          Color.hexToDecimal(hexColor.slice(4, 6)),
          (hexColor.length === 8) ? Color.hexToDecimal(hexColor.slice(6, 8)) : 255
        );
    }

    throw new Error('Invalid hex color : ' + hexColor);
  }


  private static parseColorNumber(stringNumber: string, max: number = 255): number {
    stringNumber = stringNumber.trim();
    let number: number = parseFloat(stringNumber);
    if(isNaN(number)) throw new Error('Invalid color number format : ' + stringNumber);
    if(stringNumber.endsWith('%')) number *= max / 100;
    if((number < 0) && (number > max)) throw new RangeError('Invalid color number range [0-255] : ' + stringNumber);
    return number;
  }

  private static hueToRGB(p: number, q: number, t: number): number {
    if(t < 0) t += 1;
    if(t > 1) t -= 1;
    if(t < 1 / 6) return p + (q - p) * 6 * t;
    if(t < 1 / 2) return q;
    if(t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }

  private static hexToDecimal(value: string): number {
    const decimal: number = parseInt(value, 16);
    if(isNaN(decimal)) throw new Error('Invalid hex format : ' + value);
    return decimal;
  }

  private static decimalToHex(value: number, digits: number = 2): string {
    let hex: string = value.toString(16);
    if(hex.length > digits) {
      return hex.slice(0, digits);
    } else {
      while(hex.length < digits) {
        hex = '0' + hex;
      }
      return hex;
    }
  }

  private static normalizeColorValue(value: number): number {
    value = Number(value);
    if(Number.isNaN(value)) throw new TypeError('Invalid value type');
    value = Math.round(value);
    if((value < 0) || (value > 255)) throw new RangeError('Invalid value range [0, 255]');
    return value;
  }

  private _r: number;
  private _g: number;
  private _b: number;
  private _a: number;

  constructor(r: number, g: number, b: number, a: number = 255) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }


  get r(): number { return this._r; }
  set r(value: number) { this._r = Color.normalizeColorValue(value); }

  get g(): number { return this._g; }
  set g(value: number) { this._g = Color.normalizeColorValue(value); }

  get b(): number { return this._b; }
  set b(value: number) { this._b = Color.normalizeColorValue(value); }

  get a(): number { return this._a; }
  set a(value: number) { this._a = Color.normalizeColorValue(value); }


  toRGB(alpha: boolean = false): string {
    return 'rgb' + (alpha ? 'a' : '') + '(' +
      this.r + ', ' +
      this.g + ', ' +
      this.b +
      (alpha ? (', ' + (this.a / 255)) : '') +
      ')';
  }

  toRGBA(): string {
    return this.toRGB(true);
  }

  toHSL(alpha: boolean = false) {
    const hsla: HSLAObject = this.toHSLAObject();
    return 'hsl' + (alpha ? 'a' : '') + '(' +
      (hsla.h * 360) + ', ' +
      (hsla.s * 100) + '%, ' +
      (hsla.l * 100) + '%' +
      (alpha ? (', ' + (this.a / 255)) : '') +
      ')';
  }

  toHSLA(): string {
    return this.toHSL(true);
  }

  toHex(alpha: boolean = false): string {
    return '#' +
      Color.decimalToHex(this.r) +
      Color.decimalToHex(this.g) +
      Color.decimalToHex(this.b) +
      (alpha ? Color.decimalToHex(this.a) : '')
      ;
  }

  toHSLAObject(): HSLAObject {
    const r: number = this.r / 255;
    const g: number = this.g / 255;
    const b: number = this.b / 255;

    const max: number = Math.max(r, g, b);
    const min : number= Math.min(r, g, b);

    const hslaObject: HSLAObject = {
      h: 0,
      s: 0,
      l: (max + min) / 2,
      a: this.a / 255
    };

    if(max === min) { // achromatic
      hslaObject.h = 0;
      hslaObject.s = 0;
    } else {
      const d: number = max - min;
      hslaObject.s = hslaObject.l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max) {
        case r:
          hslaObject.h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          hslaObject.h = (b - r) / d + 2;
          break;
        case b:
          hslaObject.h = (r - g) / d + 4;
          break;
      }
      hslaObject.h /= 6;
    }

    return hslaObject;
  }


}