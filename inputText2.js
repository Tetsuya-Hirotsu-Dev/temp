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
  #lastEncodedValue;

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
   * @param {string} lastEncodedValue
   * @returns {{validValue: string} | {errorMessage: string, correctEncodedValue: string}} result
   */
  /** @type {CallbackCorrect[]} */
  #callbackCorrects = [];

  /**
   * @callback CallbackMultipleCorrect
   * @param {TextBox} sender
   * @returns {Promise<{validValue: string} | {errorMessage: string, textBoxes: TextBox[], correctEncodedValues: string[]}>} result
   */
  /** @type {CallbackMultipleCorrect[]} */
  #callbackMultipleCorrects = [];

  /**
   * 値を書式化して返す
   *
   * @function encode
   * @param {string} validValue
   * @returns {string} encodedValue
   */
  encode(validValue) {
    let val = validValue;
    if (this.#callbackFormats) {
      for (const cbFmt of this.#callbackFormats) {
        val = cbFmt(val);
      }
    }
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
   * @returns {{validValue: string} | {errorMessage: string, correctEncodedValue: string}} result
   */
  decode(value) {
    let val = value;
    if (this.#callbackCorrects) {
      for (const cbCrct of this.#callbackCorrects) {
        const result = cbCrct(val, this.#lastEncodedValue);
        const errMsg = result.errorMessage;
        if (errMsg) {
          return {
            errorMessage: errMsg,
            correctEncodedValue: result.correctEncodedValue,
          };
        }
        val = result.validValue;
      }
    }
    return { validValue: val };
  }

  /**
   * input.value 値の書式化を解除して、エラーチェックの結果を返す
   *
   * @function decodeFromInput
   * @returns {{validValue: string} | {errorMessage: string, correctEncodedValue: string}} result
   */
  decodeFromInput() {
    return this.decode(this.#input.value);
  }

  /**
   * @function correctValue
   * @param {string} value
   * @returns {Promise<{ validValue: string } | {}>}
   */
  correctValue = async (value) => {
    const textBoxes = [];
    const correctEncVals = [];
    let {
      validValue: validVal,
      errorMessage: errMsg,
      correctEncodedValue: correctEncVal,
    } = this.decode(value);
    if (errMsg) {
      textBoxes.push(this);
      correctEncVals.push(correctEncVal);
    } else if (0 < this.#callbackMultipleCorrects.length) {
      for (const cbMltCrct of this.#callbackMultipleCorrects) {
        const mltResult = await cbMltCrct(this);
        errMsg = mltResult.errorMessage;
        if (errMsg) {
          textBoxes.push(...mltResult.textBoxes);
          correctEncVals.push(...mltResult.correctEncodedValues);
          break;
        }
      }
    }
    if (!errMsg) {
      return { validValue: validVal };
    }

    //
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
    this.encodeToInput(validValue);
    this.#input.addEventListener("click", async () => {
      await this.correctValue();
    });
  }

  /**
   * callbackFormat 追加
   *
   * @function addCallbackFormat
   * @param {CallbackFormat} callbackFormat
   */
  addCallbackFormat = (callbackFormat) => {
    this.#callbackFormats.push(callbackFormat);
  };

  /**
   * callbackCorrect 追加
   *
   * @function addCallbackCorrect
   * @param {CallbackCorrect} callbackCorrect
   */
  addCallbackCorrect = (callbackCorrect) => {
    this.#callbackCorrects.push(callbackCorrect);
  };

  /**
   * callbackMultipleCorrect 追加
   *
   * @function addCallbackMultipleCorrect
   * @param {CallbackMultipleCorrect} callbackMultipleCorrect
   */
  addCallbackMultipleCorrect = (callbackMultipleCorrect) => {
    this.#callbackMultipleCorrects.push(callbackMultipleCorrect);
  };
}
