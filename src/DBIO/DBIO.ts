import TableInfo from "./TableInfo";
export class ManageDatabase  {

    private IndxDb: IDBFactory;
    public db: IDBDatabase;

    constructor(public dbName: string, public tInfos: Array<TableInfo>) {
        this.IndxDb = window.indexedDB;

    }

    OpenInitDB(): Promise<IDBDatabase> {
        const promise = new Promise((resolve, reject) => {
            var req: IDBOpenDBRequest;
            req = this.IndxDb.open(this.dbName);
            req.onupgradeneeded = (e: any) => {
                this.db = e.target.result;
                for (const tInfo of this.tInfos) {
                    const parms: IDBObjectStoreParameters = { keyPath: tInfo.PrimaryFieldName };
                    var tblLocal: IDBObjectStore;
                    tblLocal = this.db.createObjectStore(tInfo.TableName, parms);
                    tblLocal.createIndex(tInfo.PrimaryIndexName, tInfo.PrimaryFieldName);
                }
                var transaction = e.target.transaction;
                transaction.onComplete = () => {
                    resolve(this.db);
                }

            }
            req.onsuccess = (e: any) => {
                this.db = e.target.result;
                resolve(this.db);
            };
            req.onerror = (e: ErrorEvent) => {
                console.log(e.error);
                reject(e);
            }
        });

        return promise;
    }
    ResetDB() {
        this.db.close();
        this.IndxDb.deleteDatabase(this.dbName);
        this.OpenInitDB();
    }
    DeleteDB(): Promise<any> {
        if (this.db) {
            this.db.close();
        }
        const promise = new Promise((resolve, reject) => {


            let req = this.IndxDb.deleteDatabase(this.dbName);
            req.onerror = (e) => {
                reject(e);
            }
            req.onsuccess = (e) => {
                resolve(e);
            }

        });
        return promise;
    }
}
export interface IDBCallback<T> {
    Refresh(obj: T);
}
export class ManageTable<T> {
    public db: IDBDatabase;
    constructor(public tInfo: TableInfo) {
    }
    CreateRow(obj: T) {
        const promise = new Promise((resolve, reject) => {
            const trans: IDBTransaction = this.db.transaction([this.tInfo.TableName], "readwrite");
            const tbl: IDBObjectStore = trans.objectStore(this.tInfo.TableName);
            const req: IDBRequest = tbl.add(obj);
            req.onsuccess = (obj) => {
                resolve(obj);
            }
            req.onerror = (err) => {
                console.log(err);
                debugger;
                reject(err);
            }
        });
        return promise;
    }
    DeleteRow(id: string) {
        const promise = new Promise((resolve, reject) => {
            const trans: IDBTransaction = this.db.transaction([this.tInfo.TableName], "readwrite");
            const tbl: IDBObjectStore = trans.objectStore(this.tInfo.TableName);
            const req: IDBRequest = tbl.delete(id);
            req.onsuccess = (obj) => {
                resolve(obj);
            }
            req.onerror = (err) => {
                console.log(err);
                debugger;
                reject(err);
            }
        });
        return promise;
    }
    UpdateRow(obj: T) {
        const promise = new Promise((resolve, reject) => {
            const trans: IDBTransaction = this.db.transaction([this.tInfo.TableName], "readwrite");
            const tbl: IDBObjectStore = trans.objectStore(this.tInfo.TableName);
            const idx: IDBIndex = tbl.index(this.tInfo.PrimaryIndexName);
            const req: IDBRequest = idx.get(obj[this.tInfo.PrimaryFieldName]);
            req.onsuccess = (oldObj) => {
                const updReq = tbl.put(obj);
                updReq.onsuccess = (res) => {
                    resolve(res);
                };
                updReq.onerror = (err) => {
                    console.log(err);
                    debugger;
                    reject(err);
                };

            }
            req.onerror = (err) => {
                console.log(err);
                debugger;
                reject(err);
            }
        });
        return promise;
    }
    ReadRow(Id: string): Promise<any> {
        const promise = new Promise((resolve, reject) => {
            const trans: IDBTransaction = this.db.transaction([this.tInfo.TableName], "readwrite");
            const tbl: IDBObjectStore = trans.objectStore(this.tInfo.TableName);
            const idx: IDBIndex = tbl.index(this.tInfo.PrimaryIndexName);
            const req: IDBRequest = idx.get(Id);
            req.onsuccess = (obj: any) => {
                resolve(obj.currentTarget.result);
            }
            req.onerror = (err) => {
                console.log(err);
                debugger;
                reject(err);
            }
        });
        return promise;
    }
    GetAll(): Promise<any> {
        const promise = new Promise((resolve, reject) => {
            const trans: IDBTransaction = this.db.transaction([this.tInfo.TableName], "readwrite");
            const tbl: IDBObjectStore = trans.objectStore(this.tInfo.TableName);
            //const idx: IDBIndex = tbl.index(this.tInfo.PrimaryIndexName);
            const req: IDBRequest = (<any>tbl).getAll();
            req.onsuccess = (obj: any) => {
                resolve(obj.currentTarget.result);
            }
            req.onerror = (err) => {
                console.log(err);
                debugger;
                reject(err);
            }
        });
        return promise;
    }
}