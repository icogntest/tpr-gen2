import http from 'node:http';

function pingWebsiteProcess() {
  return new Promise((resolve, reject) => {
    http
      .get('http://localhost:3000', res => {
        const {statusCode} = res;
        resolve(statusCode);
      })
      .on('error', e => {
        reject(e);
      });
  });
}

export default pingWebsiteProcess;
