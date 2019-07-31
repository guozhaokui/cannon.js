function Utils() { }

export default Utils;

/**
 * Extend an options object with default values.
 * @static
 * @method defaults
 * @param  {object} options The options object. May be falsy: in this case, a new object is created and returned.
 * @param  {object} defaults An object containing default values.
 * @return {object} The modified options object.
 */
Utils.defaults = (options = {}, defaults) => {
    for (const key in defaults) {
        if (!(key in options)) {
            options[key] = defaults[key];
        }
    }

    return options;
};
