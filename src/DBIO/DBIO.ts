import TableInfo from "./TableInfo";
export class DBIO {

    private IndxDb: IDBFactory;
    public db: IDBDatabase;

    constructor(public dbName: string, public tInfos: Array<TableInfo>) {
        this.IndxDb = window.indexedDB;
        this.OpenInitDB();
    }

    OpenInitDB() {
        var req: IDBOpenDBRequest;
        req = this.IndxDb.open(this.dbName);
        req.onupgradeneeded = this.AddTables.bind(this);
        req.onsuccess = function (e: any) {
            this.db = e.target.result;
        }.bind(this);
    }
    AddTables(e: any) {
        this.db = e.target.result;
        var parms: IDBObjectStoreParameters;
        var tInfo: TableInfo;
        for (var it in this.tInfos) {
            tInfo = this.tInfos[it];
            parms = { keyPath: tInfo.PrimaryFieldName };
            var tblLocal: IDBObjectStore;
            tblLocal = this.db.createObjectStore(tInfo.TableName, parms);
            tblLocal.createIndex(tInfo.PrimaryIndexName, tInfo.PrimaryFieldName);
        }
    }
    ResetDB() {
        this.db.close();
        this.IndxDb.deleteDatabase(this.dbName);
        this.OpenInitDB();
    }
}
export interface IDBCallback<T>
{
  Refresh(obj: T);
}
export class ManageTable<T> {
    public db: IDBDatabase;

    constructor(public tInfo: TableInfo) {
    }
    CreateRow(obj: T) {
        var trans: IDBTransaction;
        var tbl: IDBObjectStore;
        trans = this.db.transaction([this.tInfo.TableName], "readwrite");
        tbl = trans.objectStore(this.tInfo.TableName);
        tbl.add(obj);
    }
    DeleteRow(id: string) {
        var trans: IDBTransaction;
        var tbl: IDBObjectStore;

        trans = this.db.transaction([this.tInfo.TableName], "readwrite");
        tbl = trans.objectStore(this.tInfo.TableName);
        tbl.delete(id)
    }
    UpdateRow(obj: T) {
        var trans: IDBTransaction;
        var tbl: IDBObjectStore;
        var req: IDBRequest;
        var idx: IDBIndex;

        trans = this.db.transaction([this.tInfo.TableName], "readwrite");
        tbl = trans.objectStore(this.tInfo.TableName);
        idx = tbl.index(this.tInfo.PrimaryIndexName);
        req = idx.get(obj[this.tInfo.PrimaryFieldName]);
    }
    ReadRow(Id: string, callback: IDBCallback<T>) {
        var trans: IDBTransaction;
        var tbl: IDBObjectStore;
        var idx: IDBIndex;
        var req: IDBRequest;

        trans = this.db.transaction([this.tInfo.TableName], "readwrite");
        tbl = trans.objectStore(this.tInfo.TableName);
        idx = tbl.index(this.tInfo.PrimaryIndexName);
        req = idx.get(Id);

    }
}