'use strict';

import * as utl from './utils.js';

//////////////////////////////////////////////////////////////////////
//  class TextBox
//////////////////////////////////////////////////////////////////////
export class TextBox {
  #input;
  #label;
  #lastEncodedValue;
  #callbackMultipleCorrect;

  #isTrim = true;
  #minLength;
  #maxLength;

  /**
   * 値を書式化して返す
   *
   * @function encode
   * @param {string} validValue
   * @returns {string} encodedValue
   */
  encode(validValue) {
    const val = this.#isTrim ? validValue.trim() : validValue;
    return val;
  }

  /**
   * 値を書式化して input.value へセットする
   *
   * @function encodeToInput
   * @param {string} validValue
   */
  encodeToInput(validValue) {
    const encVal = this.encode(validValue);
    this.#input.value = encVal;
    this.#lastEncodedValue = encVal;
  }

  /**
   * 値の書式化を解除して、エラーチェックの結果を返す
   *
   * @function decode
   * @param {string} value
   * @returns {object} ok: {validValue: string}
   *                   err: {errorMessage: string, correctEncodedValue: string}
   */
  decode(value) {
    const val = this.#isTrim ? value.trim() : value;
    if (this.#minLength != null && val.length < this.#minLength) {
      return { errorMessage: '', correctEncodedValue: '' };
    }

    return { validValue: val };
  }

  /**
   * input.value 値の書式化を解除して、エラーチェックの結果を返す
   * @returns {object} ok: {validValue: string}
   *                   err: {errorMessage: string, correctEncodedValue: string}
   */
  decodeFromInput() {
    return this.decode(this.#input.value);
  }

  correctValue = async () => {
    const textBoxes = [];
    const correctEncVals = [];
    let {
      validValue: validVal,
      errorMessage: errMsg,
      correctEncodedValue: correctEncVal,
    } = this.decodeFromInput();
    if (errMsg) {
      textBoxes.push(this);
      correctEncVals.push(correctEncVal);
    } else if (this.#callbackMultipleCorrect) {
      const multipleResult = await this.#callbackMultipleCorrect(this);
      errMsg = multipleResult.errorMessage;
      if (errMsg) {
        textBoxes.push(...multipleResult.textBoxes);
        correctEncVals.push(...multipleResult.correctEncodedValues);
      }
    }
    if (!errMsg) {
      return { validValue: validVal };
    }

    //
  };

  /**
   * @constructor
   * @param {input} input
   * @param {HTMLElement} label
   * @param {*} validValue
   */
  constructor(input, label, validValue = '') {
    this.#input = input;
    this.#label = label;
    this.encodeToInput(validValue);
    this.#input.addEventListener('click', async () => {
      await this.correctValue();
    });
  }

  /**
   * @callback CallbackMultipleCorrect
   * @param {TextBox} sender
   * @returns {object} ok: {validValue: string}
   *                   err: {errorMessage: string, textBoxes: [TextBox], correctEncodedValues: [string]}
   */

  /**
   * callbackMultipleCorrect 設定
   *
   * @function setCallbackMultipleCorrect
   * @param {CallbackMultipleCorrect} callbackMultipleCorrect async
   */
  setCallbackMultipleCorrect = (callbackMultipleCorrect) => {
    this.#callbackMultipleCorrect = callbackMultipleCorrect;
  };

  /**
   * isTrim 設定
   *
   * @function setIsTrim
   * @param {boolean} isTrim
   * @param {string} validValue
   */
  setIsTrim = (isTrim, validValue = '') => {
    if (this.#isTrim !== isTrim) {
      this.#isTrim = isTrim;
      const result =
        validValue != null ? this.decode(validValue) : this.decodeFromInput();
      this.encodeToInput(result.validValue);
    }
  };

  /**
   * minLength 設定
   *
   * @function setMinLength
   * @param {number} minLength
   * @param {string} validValue
   */
  setMinLength = (minLength, validValue = '') => {
    if (this.#minLength !== minLength) {
      this.#minLength = minLength;
      const result =
        validValue != null ? this.decode(validValue) : this.decodeFromInput();
      this.encodeToInput(result.validValue);
    }
  };

  /**
   * maxLength 設定
   *
   * @function setMaxLength
   * @param {number} maxLength
   * @param {string} validValue
   */
  setMaxLength = (maxLength, validValue = '') => {
    if (this.#maxLength !== maxLength) {
      this.#maxLength = maxLength;
      const result =
        validValue != null ? this.decode(validValue) : this.decodeFromInput();
      this.encodeToInput(result.validValue);
    }
  };
}
