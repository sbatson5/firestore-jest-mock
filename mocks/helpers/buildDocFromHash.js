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
      delete copy.id;
      delete copy._collections;
      delete copy._ref;
      return copy;
    },
  };
};
