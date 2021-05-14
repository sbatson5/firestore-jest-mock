module.exports = function buildDocFromHash(hash = {}, id = 'abc123') {
  const exists = !!hash || false;
  return {
    exists,
    id: (hash && hash.id) || id,
    ref: hash && hash._ref,
    metadata: {
      hasPendingWrites: 'Server',
    },
    data() {
      if (!exists) {
        // From Firestore docs: "Returns 'undefined' if the document doesn't exist."
        // See https://firebase.google.com/docs/reference/js/firebase.firestore.DocumentSnapshot#data
        return undefined;
      }
      const copy = { ...hash };
      if (!hash._ref.parent.firestore.options.includeIdsInData) {
        delete copy.id;
      }
      delete copy._collections;
      delete copy._ref;
      return copy;
    },
    get(fieldPath) {
      // The field path can be compound: from the firestore docs
      //  fieldPath The path (e.g. 'foo' or 'foo.bar') to a specific field.
      const parts = fieldPath.split('.');
      const data = this.data();
      return parts.reduce((acc, part, index) => {
        const value = acc[part];
        // if no key is found
        if (value === undefined) {
          // return null if we are on the last item in parts
          // otherwise, return an empty object, so we can continue to iterate
          return parts.length - 1 === index ? null : {};
        }

        // if there is a value, return it
        return value;
      }, data);
    },
  };
};
