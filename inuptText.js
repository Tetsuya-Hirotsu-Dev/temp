"use strict";

import * as utl from "./utils.js";

/**
 * @callback CallbackFormat
 * @param {string} validValue
 * @returns {string} formattedValue
 */
/**
 * @callback CallbackCheck
 * @param {string} value
 * @param {string} lastFormattedValue
 * @returns {{validValue: string} | {errorMessage: string, correctFormattedValue: string}} result
 */
/**
 * @callback CallbackMultipleCheck
 * @param {string} senderValue
 * @param {string} senderLastFormattedValue
 * @param {TextBox} SenderTextBox
 * @returns {Promise<{validValue: string} | {errorMessage: string, textBoxes: TextBox[], correctFormattedValues: string[]}>} result
 */

/**
 * @param {string} errorTitle
 * @param {string} errorMessage
 * @param {TextBox[]} textBoxes
 * @param {string[]} correctFormattedValues
 * @returns {Promise<null>}
 */
const displayError = (
  errorTitle,
  errorMessage,
  textBoxes,
  correctFormattedValues,
) => {
  return new Promise((resolve) => {
    const msgBox = document.createElement("div");

    const elmTitle = document.createElement("div");
    elmTitle.textContent = errorTitle;

    const elmWhatProblem = document.createElement("div");
    elmWhatProblem.textContent = errorMessage;
    elmWhatProblem.className = "mt-4 mb-6";

    const button = document.createElement("input");
    button.type = "button";
    button.value = "閉じる";
    button.className =
      "w-24 cursor-pointer rounded-md border border-sky-500 bg-gray-200 px-4 hover:bg-gray-300 focus:ring-2 focus:ring-sky-700 focus:outline-none text-center";

    button.addEventListener(
      "click",
      () => {
        utl.displayMessageInFullScreen.close();
        setTimeout(() => {
          for (let i = 0; i < inputs.length; i++) {
            /*
            inputs[i].style.color = "";
            inputs[i].value = rewriteVals[i];
            inputs[i].focus();
            inputs[i].select();
            */
          }
          resolve();
        }, 10);
      },
      { once: true },
    );

    // utl.displayMessageInFullScreen.open の引数を msgBox のみに修正する！！！！！！！！！！！
    utl.displayMessageInFullScreen.open(msgBox);
  });
};

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

  /** @type {CallbackFormat[]} */
  #callbackFormats = [];

  /** @type {CallbackCheck[]} */
  #callbackChecks = [];

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
   * エラーメッセージを表示して、値を修正する
   *
   * @returns {Promise<{string | null}>}
   */
  correct = async () => {
    const result = this.checkFromInput();
    if (!result.errorMessage) {
      this.formatToInput(result.validValue);
      return this.checkFromInput().validValue;
    }

    await displayError(
      `「${this.#label.textContent}」で入力エラーが発生しました`,
      result.errorMessage,
      result.textBoxes,
      result.correctFormattedValues,
    );
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
    this.#input.addEventListener("click", async () => {
      await this.correct();
    });
  }
}
