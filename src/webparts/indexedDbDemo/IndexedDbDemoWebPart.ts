
// see https://visualstudiomagazine.com/articles/2016/09/01/working-with-indexeddb.aspx
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

export default class IndexedDbDemoWebPart extends BaseClientSideWebPart<IIndexedDbDemoWebPartProps> {
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
    const rowDef:IDBObjectStoreParameters = { keyPath: fldCustId };
    const tblLocal:IDBObjectStore = cat.createObjectStore(tblCustName, rowDef)

  }
  protected onInit(): Promise<void> {
    debugger;
    if ("indexedDB" in window && window.indexedDB != undefined) {
      this.dbs = window.indexedDB;
    }
    if (this.dbs) {
      this.dbs.deleteDatabase(this.dbName);
      var req: IDBOpenDBRequest = this.dbs.open(this.dbName, 2);//0 is the vcersion
      req.onupgradeneeded = (e: any) => {
        debugger;
        var cat = e.currentTarget.result;
        this.AddCustomersTable(cat);
      }
      req.onsuccess = (ev: any) => {
        debugger;
        this.database = ev.target.result;
      }

    }

    return;
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
