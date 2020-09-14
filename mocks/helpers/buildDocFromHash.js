module.exports = function buildDocFromHash(hash = {}, id = 'abc123') {
  const exists = !!hash || false;
  return {
    exists,
    id: (hash && hash.id) || id || 'abc123',
    ref: hash && hash._ref,
    data() {
      if (!exists) {
        // From Firestore docs: "Returns 'undefined' if the document doesn't exist."
        return undefined;
      }
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
