import { Timestamp } from '../timestamp';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const merge = require('lodash/merge');

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface DocumentSnapshot {
  createTime: any;
  exists: boolean;
  id: string;
  readTime: any;
  ref: any;
  metadata: { hasPendingWrites: string };
  updateTime: any;
  data(): any;
  get(fieldPath: string): any;
}

export default function buildDocFromHash(
  hash: any = {},
  id = 'abc123',
  selectFields?: string[],
): DocumentSnapshot {
  const exists = !!hash || false;
  return {
    createTime: (hash && hash._createTime) || Timestamp.now(),
    exists,
    id: (hash && hash.id) || id,
    readTime: hash && hash._readTime,
    ref: hash && hash._ref,
    metadata: {
      hasPendingWrites: 'Server',
    },
    updateTime: hash && hash._updateTime,
    data() {
      if (!exists) {
        return undefined;
      }
      let copy = { ...hash };
      if (!hash._ref.parent.firestore.options.includeIdsInData) {
        delete copy.id;
      }
      delete copy._collections;
      delete copy._createTime;
      delete copy._readTime;
      delete copy._ref;
      delete copy._updateTime;

      if (selectFields !== undefined) {
        copy = selectFields.reduce((acc: any, field: string) => {
          const path = field.split('.');
          return merge(acc, buildDocFromPath(copy, path));
        }, {});
      }

      return copy;
    },
    get(fieldPath: string) {
      const parts = fieldPath.split('.');
      const data = this.data();
      return parts.reduce((acc: any, part: string, index: number) => {
        const value = acc[part];
        if (value === undefined) {
          return parts.length - 1 === index ? null : {};
        }
        return value;
      }, data);
    },
  };
}

function buildDocFromPath(data: any, path: string[]): any {
  if (data === undefined || data === null) {
    return {};
  }

  const [root, ...subPath] = path;
  const rootData = data[root];
  return {
    [root]: subPath.length ? buildDocFromPath(rootData, subPath) : rootData,
  };
}

/* eslint-enable @typescript-eslint/no-explicit-any */
