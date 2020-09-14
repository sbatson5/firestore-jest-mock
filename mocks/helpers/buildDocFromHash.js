module.exports = function buildDocFromHash(hash = {}) {
  return {
    exists: !!hash || false,
    id: hash.id || 'abc123',
    ref: hash._ref,
    data() {
      const copy = { ...hash };
      delete copy.id;
      delete copy._collections;
      delete copy._ref;
      return copy;
    },
    get(fieldPath) {
      // The field path can be compound: from the firestore docs
      //  fieldPath The path (e.g. 'foo' or 'foo.bar') to a specific field.
      const parts = fieldPath.split('.');
      let data = this.data();
      parts.forEach(part => {
        data = data[part];
      });
      return data;
    },
  };
};
