export class Path {
  constructor(segments) {
    this.segments = segments;
  }
  compareTo(other) {
    const len = Math.min(this.segments.length, other.segments.length);
    for (let i = 0; i < len; i++) {
      if (this.segments[i] < other.segments[i]) {
        return -1;
      }
      if (this.segments[i] > other.segments[i]) {
        return 1;
      }
    }
    if (this.segments.length < other.segments.length) {
      return -1;
    }
    if (this.segments.length > other.segments.length) {
      return 1;
    }
    return 0;
  }
  isEqual(other) {
    return this === other || this.compareTo(other) === 0;
  }
}

export class FieldPath extends Path {
  constructor(...segments) {
    super(segments);
  }
  static documentId() {
    return FieldPath._DOCUMENT_ID;
  }
  isEqual(other) {
    return super.isEqual(other);
  }
}
FieldPath._DOCUMENT_ID = new FieldPath('__name__');
