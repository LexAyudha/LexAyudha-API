const axios = require('axios');

const services = [
    { name: 'Authentication server', url: 'http://localhost:8001/healthCheck' },
    { name: 'User server', url: 'http://localhost:8002/healthCheck' },
    { name: 'SpeechRateService server', url: 'http://localhost:8003/healthCheck' },
    { name: 'Flask server', url: 'http://localhost:8005/healthCheck' },
    { name: 'Email server', url: 'http://localhost:8007/healthCheck' },
    { name: 'Log&Monitoring server', url: 'http://localhost:8008/healthCheck' }
];

const checkServiceHealth = async (service) => {
    try {
        const response = await axios.get(service.url, { timeout: 5000 });
        return response.status === 200;
    } catch (error) {
        return false;
    }
};

const performHealthCheck = async () => {
    const healthyServices = [];
    const unhealthyServices = [];

    for (const service of services) {
        const isHealthy = await checkServiceHealth(service);
        if (isHealthy) {
            healthyServices.push(service.name);
        } else {
            unhealthyServices.push(service.name);
        }
    }

    if (unhealthyServices.length > 0) {
        console.error('\n\x1b[33m%s\x1b[0m', 'Health Check ERROR: Some services are not responding:');
        console.error('\t\x1b[31m%s\x1b[0m', unhealthyServices.join('\n\t'));
        console.log('\x1b[33m%s\x1b[0m', '\nHealthy services:');
        console.log('\t\x1b[32m%s\x1b[0m', healthyServices.join('\n\t'));
        return false;
    }

    return true;
};

module.exports = { performHealthCheck };