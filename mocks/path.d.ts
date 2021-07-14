/**
 * @private
 * @class
 */
declare abstract class Path<T> {
  protected readonly segments: string[];
  /**
   * @private
   * @hideconstructor
   * @param segments
   */
  constructor(segments: string[]);
  compareTo(other: Path<T>): number;
  toArray(): string[];
  isEqual(other: Path<T>): boolean;
}

/**
 * @class
 */
export declare class FieldPath extends Path<FieldPath> implements FieldPath {
  private static _DOCUMENT_ID;
  constructor(...segments: string[]);
  static documentId(): FieldPath;
  isEqual(other: FieldPath): boolean;
}