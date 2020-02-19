const appUtils = require('../utils');
const {elasticClient} = require('../clients');

class ElasticDataSource {

    constructor() {
    }

    async getData(data) {
        const searchObject = appUtils.buildDslSearchRequest(data);
        const { body } = await elasticClient.search(searchObject);
        const response = this.buildResponse(body, data);

        return response;
    }

    buildResponse(elasticData, requestData) {
        const { startRow, endRow } = requestData;
        const size = endRow - startRow;
    
        const data = this.extractData(elasticData, requestData);
        data.lastRow = -1;
    
        if( data.rows.length < size ) {
            data.lastRow = startRow + data.rows.length;
        }
    
        return data;
    }

    extractData(elasticData, requestData) {
        const {hits, aggregations} = elasticData;
        const {columns} = requestData;
        let data = {
            rows: [],
            after_key: {}
        };
    
        if(aggregations) {
            const metrics = columns.filter(col => col.type === 'metric');
            data = this.extractDataAggregations(aggregations, metrics);
        }else if(hits) {
            data = this.extractDataHits(hits);
        }
    
        return data;
    }
    
    extractDataAggregations(elasticAggsData, metrics) {
        const {group_by: {after_key, buckets}} = elasticAggsData;
        const rows = buckets.map(doc => {
            const row = {};
    
            Object.assign(row, doc.key);
            metrics.forEach(met => {
                const {field} = met;
                row[field] = doc[field].value;
            })
    
            return row;
        });
    
        return {
            rows: rows,
            after: after_key
        }
    } 
    
    extractDataHits(elasticHitsData) {
        //TODO
    }
}

const elasticDataSource = new ElasticDataSource();
module.exports = {
    elasticDataSource
}

