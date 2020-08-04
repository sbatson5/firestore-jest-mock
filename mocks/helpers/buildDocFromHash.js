module.exports = function buildDocFromHash(hash = {}, id = 'abc123') {
  return {
    exists: !!hash || false,
    id: (hash && hash.id) || id || 'abc123',
    ref: hash && hash._ref,
    data() {
      if (!!hash || false) {
        // From Firestore docs: "Returns 'undefined' if the document doesn't exist."
        return undefined;
      }
      const copy = { ...hash };
      delete copy.id;
      delete copy._collections;
      delete copy._ref;
      return copy;
    },
  };
};
