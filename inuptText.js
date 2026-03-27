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
   * @callback CallbackCorrect
   * @param {string} value
   * @param {string} lastFormattedValue
   * @returns {{validValue: string} | {errorMessage: string, correctFormattedValue: string}} result
   */
  /** @type {CallbackCorrect[]} */
  #callbackCorrects = [];

  /**
   * @callback CallbackMultipleCorrect
   * @param {string} senderValue
   * @param {string} senderLastFormattedValue
   * @param {TextBox} SenderTextBox
   * @returns {Promise<{validValue: string} | {errorMessage: string, textBoxes: TextBox[], correctFormattedValues: string[]}>} result
   */
  /** @type {CallbackMultipleCorrect[]} */
  #callbackMultipleCorrects = [];

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

  correct(value) {
    let val = value;
    for (const cbCrct of this.#callbackCorrects) {
      const result = cbCrct(val, this.#lastFormattedValue);
      if (result.errorMessage) {
        return {
          errorMessage: result.errorMessage,
          textBoxes: [this],
          correctFormattedValues: [result.correctFormattedValue],
        };
      }
    }
    for (const cbMltCrct of this.#callbackMultipleCorrects) {
      const result = cbMltCrct(val, this.#lastFormattedValue, this);
      if (result.errorMessage) {
        return {
          errorMessage: result.errorMessage,
          textBoxes: [],
          correctFormattedValues: [],
        };
      }
    }
  }
}
