export class FakeFieldPath {
  /** Segments of object path */
  public segments: string[];

  constructor(...fieldNames: string[]) {
    this.segments = fieldNames;
  }
}
