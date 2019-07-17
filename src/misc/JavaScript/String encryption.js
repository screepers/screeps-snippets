// warinternal 24 May 2017 at 04:46

/**
 * Vernam cipher
 *
 * @param string str - Plaintext or encryped message
 * @param string phrase - The passphrase you wish to use
 * @param Number off - (Optional) Offset value to use during xor. 32 just makes the encoded string more readable.
 */
function xorStr(str, phrase, off = 32) {
  var newStr = "";
  for (var i = 0; i < str.length; i++)
    newStr += String.fromCharCode(
      str.charCodeAt(i) ^ (off + phrase.charCodeAt(i % phrase.length))
    );
  return newStr;
}
