const appUtils = require('../utils');
const { promisify } = require('util');
const { redisClient } = require('../clients');
const {elasticDataSource} = require('./elasticDataSource');

class RedisDataSource {
    constructor() {
    }

    generateSetName(data) {
        const cData = {...data};
        delete cData.startRow;
        delete cData.endRow;

        return appUtils.generateHashFromObject('md5', cData);
    }

    getScoreKey(data) {
        const {sortModel, filterModel} = data;
        let scoreKey = '';

        const sortMetric = sortModel.find( sModel => sModel.type === 'metric');
        if(sortMetric) {
            scoreKey = sortMetric['colId'];
        }

        return scoreKey;
    }

    getScoreDirection(data) {
        const {sortModel, filterModel} = data;
        let scoreDirection = 'asc';

        const sortMetric = sortModel.find( sModel => sModel.type === 'metric');
        if(sortMetric) {
            scoreDirection = sortMetric['sort'];
        }

        return scoreDirection;
    }

    async getData(data) {
        const setName = this.generateSetName(data);
        const scoreKey = this.getScoreKey(data);
        const scoreDirection = this.getScoreDirection(data);
        const isSetExists = await this.isSetExists(setName);
        
        if( !isSetExists ) {
            await this.populateSet(setName, scoreKey, scoreDirection, data);
        }

        const rawData = await this.read(setName, scoreKey, data);
        const response = this.buildResponse(rawData, data);
        return response;
    }

    async populateSet(setName, scoreKey, scoreDirection, data) {
        const cData = {...data};
        const size = 1000;
        const scoreMultiplier = scoreDirection === 'asc' ? 1:-1;

        cData.startRow = 0;
        cData.endRow = size;
        cData.sortModel = cData.sortModel.filter(sModel => sModel.type !== 'metric');

        let lastRow =-1;
        let response;
        while( lastRow === -1 ) {
            response = await elasticDataSource.getData(cData);
            this.write(setName, scoreKey, scoreMultiplier, response.rows);

            cData.after = response.after;
            cData.startRow = cData.endRow;
            cData.endRow = cData.endRow + size;

            lastRow = response.lastRow;
        }


        return response;
    }

    async isSetExists(setName) {
        const existsAsync = promisify(redisClient.exists).bind(redisClient);
        return await existsAsync(setName);
    }

    write(setName, scoreKey, scoreMultiplier, data) {
        const args = [setName];
        data.forEach(doc => {
            args.push( doc[scoreKey]*scoreMultiplier );
            args.push(JSON.stringify(doc));
        });

        redisClient.zadd(args, function(err, res) {
            if( err ) {
            }
        });
    }

    async read(setName, scoreKey, data) {
        const {startRow, endRow} = data;
        const zrangeAsync = promisify(redisClient.zrange).bind(redisClient);

        const rawData = await zrangeAsync(setName, startRow, endRow);
        return rawData;
    }

    buildResponse(redisData, requestData) {
        const { startRow, endRow } = requestData;
        const size = endRow - startRow;

        const data = this.proccessData(redisData, requestData);
        data.lastRow = -1;

        if( data.rows.length < size ) {
            data.lastRow = startRow + data.rows.length;
        }

        return data;
    }

    proccessData(rawData, requestData) {
        const rows = rawData.map(rawDoc => {
            return JSON.parse(rawDoc);
        });

        return {
            rows: rows,
            after: undefined
        }
    }
}


const redisDataSource = new RedisDataSource();
module.exports = {
    redisDataSource
}