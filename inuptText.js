"use strict";

import * as utl from "./utils.js";

//////////////////////////////////////////////////////////////////////
//  class TextBox
//////////////////////////////////////////////////////////////////////
export class TextBox {
  /** @type {HTMLInputElement} */
  #input;

  /** @type {HTMLLabelElement} */
  #label;

  /** @type {string} */
  #lastFormattedValue;

  /**
   * @callback CallbackFormat
   * @param {string} validValue
   * @returns {string} formattedValue
   */
  /** @type {CallbackFormat[]} */
  #callbackFormats = [];

  /**
   * @callback CallbackCheck
   * @param {string} value
   * @param {string} lastFormattedValue
   * @returns {{validValue: string} | {errorMessage: string, correctFormattedValue: string}} result
   */
  /** @type {CallbackCheck[]} */
  #callbackChecks = [];

  /**
   * @callback CallbackMultipleCheck
   * @param {string} senderValue
   * @param {string} senderLastFormattedValue
   * @param {TextBox} SenderTextBox
   * @returns {Promise<{validValue: string} | {errorMessage: string, textBoxes: TextBox[], correctFormattedValues: string[]}>} result
   */
  /** @type {CallbackMultipleCheck[]} */
  #callbackMultipleChecks = [];

  /**
   * 値を書式化して返す
   *
   * @function format
   * @param {string} validValue
   * @returns {string} formattedValue
   */
  format(validValue) {
    let val = validValue;
    for (const cbFmt of this.#callbackFormats) {
      val = cbFmt(val);
    }
    return val;
  }

  /**
   * 値を書式化して input.value, #lastFormattedValue へセットする
   *
   * @function encodeToInput
   * @param {string} validValue
   */
  formatToInput(validValue) {
    const fmtVal = this.format(validValue);
    this.#input.value = fmtVal;
    this.#lastFormattedValue = fmtVal;
  }

  /**
   * 値の書式化を解除し、エラーチェックの結果を返す
   *
   * @param {string} value
   * @returns {Promise<{validValue: string} | {errorMessage: string, textBoxes: TextBox[], correctFormattedValues: string[]}>} result
   */
  async check(value) {
    let val = value;
    for (const cbChk of this.#callbackChecks) {
      const result = cbChk(val, this.#lastFormattedValue);
      if (result.errorMessage) {
        return {
          errorMessage: result.errorMessage,
          textBoxes: [this],
          correctFormattedValues: [result.correctFormattedValue],
        };
      }
      val = result.validValue;
    }
    for (const cbMltChk of this.#callbackMultipleChecks) {
      const result = await cbMltChk(val, this.#lastFormattedValue, this);
      if (result.errorMessage) {
        return {
          errorMessage: result.errorMessage,
          textBoxes: [...result.textBoxes],
          correctFormattedValues: [...result.correctFormattedValues],
        };
      }
      val = result.validValue;
    }
    return { validValue: val };
  }

  /**
   * input.value 値の書式化を解除し、エラーチェックの結果を返す
   *
   * @returns {Promise<{validValue: string} | {errorMessage: string, textBoxes: TextBox[], correctFormattedValues: string[]}>} result
   */
  async checkFromInput() {
    return await this.check(this.#input.value);
  }

  /**
   *
   * @returns {Promise<{string | null}>}
   */
  correct = async () => {
    const result = this.checkFromInput();
    if (!result.errorMessage) {
      this.formatToInput(result.validValue);
      return this.checkFromInput().validValue;
    }
  };

  /**
   * @constructor
   * @param {HTMLInputElement} input
   * @param {HTMLLabelElement} label
   * @param {string} validValue
   */
  constructor(input, label, validValue = "") {
    this.#input = input;
    this.#label = label;
    this.formatToInput(validValue);
    this.#input.addEventListener("click", () => {
      //
    });
  }
}
