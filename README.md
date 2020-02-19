# data-gateway-elk-redis
POC for data gateway server with elastic and redis as data sources

React app with ag grid in server mode requests data from the data gateway.
The request data structure is according to ag grid documentation:

https://www.ag-grid.com/javascript-grid-server-side-model/#server-side-datasource

interface IServerSideGetRowsRequest {

    // row group columns
    rowGroupCols: ColumnVO[];

    // value columns
    valueCols: ColumnVO[];

    // pivot columns
    pivotCols: ColumnVO[];

    // true if pivot mode is one, otherwise false
    pivotMode: boolean;

    // what groups the user is viewing
    groupKeys: string[];

    // if filtering, what the filter model is
    filterModel: any;

    // if sorting, what the sort model is
    sortModel: any;
}
