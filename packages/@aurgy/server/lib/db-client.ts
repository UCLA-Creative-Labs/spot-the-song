import { Firestore, QueryDocumentSnapshot } from '@google-cloud/firestore';
import { DbItem } from './db-item';

/**
 * A Client for managing database connections.
 */
export class DbClient {
  /**
   * The Firebase DB connection.
   *
   * @throws if the Client is not configured
   */

  /**
   * Database collections where the key is the collection name.
   */
  public readonly collections: Record<string, any>;

  get firestore(): Firestore {
    if (this._firestore == null) {
      throw new Error(
        'Firestore is not configured.',
      );
    }
    return this._firestore;
  }

  /**
   * The private variable containing the firestore reference
   */
  private _firestore?: Firestore;

  public constructor() {
    this._firestore = new Firestore();
    this.collections = {};
  }

  /**
   * Open a database collection given the collection name.
   *
   * When the app is not in production, this will look
   * for a collection with the prefix 'test_'.
   *
   * For example:
   * ```
   * client.openCollection('users')  // looks up `test_users`
   * ```
   *
   * @param pCollectionName the name of the collection
   */
  public async openCollection(pCollectionName: string): Promise<any> {
    const collectionName = process.env.NODE_ENV === 'PROD'
      ? pCollectionName
      : `test_${pCollectionName}`;

    if (this.collections[collectionName] != null)
      return this.collections[collectionName];

    const collection = await this.firestore.collection(collectionName);
    if (collection == undefined) {
      throw new Error('Collection not found. Make sure you provide the correct collection name.');
    }
    this.collections[collectionName] = collection;

    return collection;
  }

  /**
   * Query for a document by the id and collection name
   *
   * @param id the id of the document
   * @param collectionName the collection to query from
   * @returns the soda document associated with the query
   */
  public async findDbItem(collectionName: string, id: string): Promise<any | null> {
    const collection = await this.openCollection(collectionName);
    const item = await collection.doc(id).get();
    return item ?? null;
  }

  /**
   * Get all the items in a collecion
   *
   * @param collectionName the collection to query
   * @returns all the items in a collection
   * the items are represent as json objects
   */
  public async getCollectionItems(collectionName: string): Promise<FirebaseFirestore.DocumentData[]> {
    const collection = await this.openCollection(collectionName);
    const docs = await collection.get();
    const data: FirebaseFirestore.DocumentData[] = [];
    docs.forEach((doc: QueryDocumentSnapshot) => {
      data.push(doc.data());
    });
    return data;
  }

  /**
   * Write database items to a database
   *
   * @param items the items to insert into the database
   */
  public async writeDbItems(...items: DbItem[]): Promise<void> {
    items.forEach(async item => {
      const collection = await this.openCollection(item.collectionName);
      void collection.doc(item.id).set(item.toJson());
    });
  }

  /**
   * Remove a document by the id and collection name
   *
   * @param item the item to delete from the database
   */
  public async deleteDbItem(item: DbItem): Promise<any> {
    const collection = await this.openCollection(item.collectionName);
    return collection.doc(item.id).delete();
  }
}

let CLIENT: DbClient;

export async function getClient(): Promise<DbClient> {
  if (CLIENT != undefined) return CLIENT;

  CLIENT = new DbClient();
  return CLIENT;
}
