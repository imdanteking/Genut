/*
 * @Description: 
 * @version: 
 * @Author: @imdanteking
 * @Date: 2023-04-03 17:38:14
 * @LastEditTime: 2023-04-03 21:28:53
 */
import * as vscode from "vscode";

export class EntryItem extends vscode.TreeItem {}

export class EntryList implements vscode.TreeDataProvider<EntryItem> {
    onDidChangeTreeData?: vscode.Event<void | EntryItem | EntryItem[] | null | undefined> | undefined;
    getTreeItem(element: EntryItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    getChildren(element?: EntryItem | undefined): vscode.ProviderResult<EntryItem[]> {
        if(element) {
            let children = [];
            let childrenName = ['Set_APIKEY', 'Set_MAX_TOKEN'];
            for(let i = 0; i < childrenName.length; ++i) {
                let str = childrenName[i];
                let item = new EntryItem(str, vscode.TreeItemCollapsibleState.None);
                item.command = {
                    command: childrenName[i] + ".openChild",
                    title: childrenName[i],
                    arguments: [str]
                };
                children[i] = item;
            }
            return children;
        } else {
            return [new EntryItem("configuration", vscode.TreeItemCollapsibleState.Collapsed)];
        }
    }
}