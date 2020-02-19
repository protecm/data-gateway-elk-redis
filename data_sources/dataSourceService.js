const {elasticDataSource} = require('./elasticDataSource');
const {redisDataSource} = require('./redisDataSource');

const dataSources = {
    DEFAULT: elasticDataSource,
    ELASTIC: elasticDataSource,
    REDIS: redisDataSource
};

class DataSourceService {

    constructor() {
    }

    getDataSourceByName(dataSourceName) {
        return dataSources[dataSourceName];
    }

    getDataSourceByContext(requestData) {
        const {filterModel, sortModel} = requestData;
        let dataSource = dataSources.DEFAULT;
    
        const isSortMetric = sortModel.some( sModel => sModel.type === 'metric');
        if( isSortMetric ) {
            dataSource = dataSources.REDIS;
        }
        
        return dataSource;
    }

}

const dataSourceService = new DataSourceService();

module.exports = {
    dataSourceService
};