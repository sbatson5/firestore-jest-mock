import { MockDatabase } from "types";
export * from "../../src/utils";

/** Interface for invalid calls */
export type InvalidApiUsage = any;

/**
 * Get all collections and subcollections of an MockDatabase
 * @param db The mock database to get all collections
 * @returns A string array with all the collections names
 */
export function getAllCollectionNames(db: MockDatabase = {}): string[] {
  const collectionNames: string[] = [];
  Object.entries(db).forEach(([collection, value]) => {
    collectionNames.push(collection);
    value.docs.forEach(doc => {
      collectionNames.push(...getAllCollectionNames(doc.subcollections));
    });
  });
  return collectionNames;
}

/**
 * Get all de docs ids of a MockDatabase
 * @param db The mock database to get the ids
 * @returns A string array with all the doc ids
 */
export function getDocIds(db: MockDatabase = {}): string[] {
  const docIds: string[] = [];
  Object.values(db).forEach(value => {
    value.docs.forEach(doc => {
      docIds.push(doc.id, ...getDocIds(doc.subcollections));
    });
  });
  return docIds;
}
