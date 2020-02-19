
function buildDslSearchRequest(data) {

    const indexPart = getIndexPart(data);
    const generalPart = getGeneralPart(data);
    const bodyPart = getBodyPart(data);

    const searchParts = [
        indexPart,
        generalPart,
        bodyPart
    ];

    return composeObjects(searchParts);
}

function composeObjects(parts) {
    let composedObj = {};

    parts.forEach(element => {
        composedObj = Object.assign(composedObj, element);
    });

    return composedObj;
}

function getIndexPart(data) {
    return {
        index: 'stats*'
    }
}

function getGeneralPart(data) {
    const { startRow, endRow, rowGroupCols, groupKeys } = data;
    const size = endRow - startRow;
    let generalPart = {
        from: startRow,
        size: size
    };

    if(rowGroupCols.length > 0) {
        generalPart = {
            size: 0
        };
    }

    return generalPart;
}

function getBodyPart(data) {
    const queryPart = getQueryPart(data);
    const aggsPart = getAggsPart(data);

    const bodyComposed = composeObjects([
        queryPart,
        aggsPart
    ]);

    return {
        body: bodyComposed
    }
}

function getQueryPart(data) {
    const {rowGroupCols, groupKeys, filterModel} = data;

    let i = 0;
    let termConditions = [];
    
    const termGroups = groupKeys.map(groupKey => {
        let key = rowGroupCols[i].field;
        const val = groupKey.toLowerCase();
        
        const term = createFilterTerm(key, val);
        i++;
        return term;
    });

    const filterKeys = Object.keys(filterModel);
    const filterTerms = filterKeys.map(filterKey => {
        const { filterType, type, filter: filterVal } = filterModel[filterKey];
        const wildCardValue = prepareWildCardValue(type, filterVal);

        const term = createWildCardTerm(filterKey,wildCardValue);
        return term;
    });

    termConditions = [...termConditions, ...termGroups, ...filterTerms];

    return {
        query: {
            bool: {
                filter: termConditions
            }
        }
    }
}

function prepareWildCardValue(type, value) {
    value = value.toLowerCase();
    if(prepareWildCardHandlersMap[type]) {
        return prepareWildCardHandlersMap[type](value);
    }

    return value;
}


const prepareWildCardHandlersMap = {
    startsWith: prepareWildCardStartsWith,
    endsWith: prepareWildCardEndsWith,
    contains: prepareWildCardContains,
    equal: prepareWildCardEqual
}

function prepareWildCardStartsWith(value) {
    return value + '*';
}

function prepareWildCardEndsWith(value) {
    return '*' + value;
}

function prepareWildCardContains(value) {
    return '*' + value + '*';
}

function prepareWildCardEqual(value) {
    return value;
}

function createFilterTerm(key, value) {
    return {
        term: {
            [key]: value
        }
    }
}

function createWildCardTerm(key, value) {
    return {
        wildcard: {
            [key]: {
                value: value
            }
        }
    }
}

function getAggsPart(data) {
    const {rowGroupCols, groupKeys} = data;
    if(rowGroupCols.length < 1) {
        return {};
    }

    const groupByPart = getGroupByPart(data);

    return {
        aggs: groupByPart
    }
}

function getGroupByPart(data) {
    
    const compositePart = getCompositePart(data);
    const aggregationsPart = getAggregationsPart(data);
    const groupByComposed = composeObjects([
        compositePart,
        aggregationsPart
    ]); 

    return {
        group_by: groupByComposed
    }
}

function getCompositePart(data) {
    const {startRow, endRow, dataSet, rowGroupCols, groupKeys, sortModel, after} = data;
    const size = endRow - startRow;
    let termSources = [];

    const termGroupBys = rowGroupCols.map( group => {
        const groupTermField = `${group.field}.keyword`;
        const groupTermAlias = group.field;
        
        const sortCol = sortModel.find(col => col.colId === group.field);
        let order = sortCol && sortCol.sort;

        const term = createGroupTerm(groupTermField, groupTermAlias, order);
        return term;
    });

    termSources = [...termSources, ...termGroupBys];
    if(termSources.length < 1) {
        return {};
    }

    return {
        composite: {
            after: after,
            size: size,
            sources: termSources
        }
    }
}

function getAggregationsPart(data) {
    const {columns} = data;
    const aggregations = columns.filter(col => col.type === 'metric')
                                .reduce((res, currCol) => {
                                    const {field} = currCol;
                                    res[field] = {
                                        sum: {
                                            field: field
                                        }
                                    }
                                    return res;
                                }, {});

    return {
        aggs: aggregations
    }
}

function createGroupTerm(fieldName, fieldAlias, order) {
    let orderObj = {};
    
    if(!fieldAlias) {
        fieldAlias = fieldName;
    }

    if(order) {
        orderObj.order = order;
    }

    const fieldObj = {
        field: fieldName
    };

    const composedObj = Object.assign(fieldObj, orderObj);

    return {
        [fieldAlias]: {
            terms: composedObj
        }
    }
}

module.exports = {
    buildDslSearchRequest
};