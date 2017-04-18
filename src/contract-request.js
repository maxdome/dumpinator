'use strict';

class ContractRequest {
  constructor(config) {
    config = config || {};
    this.verbose = config.verbose || false;
  }

  load(options) {
    return new Promise((resolve, reject) => {
      if (this.verbose) {
        // eslint-disable-next-line no-console
        console.log('[DEBUG] get contract:', options.contractFile);
      }

      const timer = Date.now();
      const contract = Object.assign({
        status: 200,
        header: {},
        error: null,
        body: '',
        type: 'application/json'
      }, this.loadContractFile(options.contractFile));

      const responseTime = Date.now() - timer;

      if (this.verbose) {
        // eslint-disable-next-line no-console
        console.log('[DEBUG] got contract response:', options.method, options.contract, contract.status);
      }

      const meta = this.getRequestMeta(contract, responseTime);
      return resolve({
        meta,
        request: options,
        header: contract.header,
        body: contract.body
      });
    });
  }

  getRequestMeta(res, responseTime) {
    return {
      status: res.status,
      error: res.error,
      responseTime
    };
  }

  loadContractFile(contractFile) {
    try {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      return require(contractFile);
    } catch (err) {
      return {
        error: `Could not load contract file! Error: ${err.stack}`
      };
    }
  }
}

module.exports = ContractRequest;
