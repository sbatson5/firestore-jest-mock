export class Path {
  segments: string[];

  constructor(segments: string[]) {
    this.segments = segments;
  }

  compareTo(other: Path): number {
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

  isEqual(other: Path): boolean {
    return this === other || this.compareTo(other) === 0;
  }
}

export class FieldPath extends Path {
  static _DOCUMENT_ID: FieldPath = new FieldPath('__name__');

  constructor(...segments: string[]) {
    super(segments);
  }

  static documentId(): FieldPath {
    return FieldPath._DOCUMENT_ID;
  }

  isEqual(other: Path): boolean {
    return super.isEqual(other);
  }
}
