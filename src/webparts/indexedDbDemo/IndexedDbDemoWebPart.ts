
// see https://visualstudiomagazine.com/articles/2016/09/01/working-with-indexeddb.aspx
import TableInfo from "../../DBIO/TableInfo";
import { DBIO, ManageTable, IDBCallback } from "../../DBIO/DBIO";
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';

import * as strings from 'indexedDbDemoStrings';
import IndexedDbDemo from './components/IndexedDbDemo';
import { IIndexedDbDemoProps } from './components/IIndexedDbDemoProps';
import { IIndexedDbDemoWebPartProps } from './IIndexedDbDemoWebPartProps';
export class Customer {
  constructor(public name: string,
    public City: string,
    public CustId: string) { }
}

export default class IndexedDbDemoWebPart extends BaseClientSideWebPart<IIndexedDbDemoWebPartProps> implements IDBCallback<Customer>  {
  private dbs: IDBFactory;
  private dbName: string = "Dunno";
  private database: IDBDatabase;


  public render(): void {
    const element: React.ReactElement<IIndexedDbDemoProps> = React.createElement(
      IndexedDbDemo,
      {
        description: this.properties.description
      }
    );

    ReactDom.render(element, this.domElement);
  }
  protected AddCustomersTable(cat: IDBDatabase) {
    const tblCustName = "customers";
    const fldCustId = "CustId";
    const rowDef: IDBObjectStoreParameters = { keyPath: fldCustId };
    const tblLocal: IDBObjectStore = cat.createObjectStore(tblCustName, rowDef)

  }
  protected onInit(): Promise<void> {
 
    debugger;
    var ti: TableInfo;
    var tis: Array<TableInfo>;
    tis = new Array<TableInfo>();

    ti = new TableInfo();
    ti.TableName = "CustOrders";
    ti.PrimaryFieldName = "CustId";
    ti.PrimaryIndexName = "CustIdIndex";
    tis[0] = ti;
    var dbio: DBIO;
    dbio = new DBIO("CustomerOrder", tis);
    return dbio.DeleteDB().then(() => {
      dbio.OpenInitDB().then(db => {
        var mt: ManageTable<Customer>;
        mt = new ManageTable<Customer>(ti);
        mt.db = dbio.db
        mt.CreateRow(new Customer("Da", "Brigeport", "4"));
        mt.CreateRow(new Customer("sally", "Danbury", "12"));
        mt.CreateRow(new Customer("joe", "Stamford", "1"));
        mt.CreateRow(new Customer("jane", "Greenwich", "2"));
        
        mt.UpdateRow(new Customer("janet", "Greenwich", "2"));
        mt.ReadRow("2").then((row) => {
          console.log(row);
        });
        
        mt.GetAll().then((rows) => {
          console.log(rows);
        });
      });



    })





  }
  Refresh(cust: Customer) {
    debugger;
  }
  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
