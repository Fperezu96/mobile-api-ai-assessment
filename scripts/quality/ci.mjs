const suite=process.argv[2] || 'regression';
if(!['smoke','regression'].includes(suite))throw new Error('Elegir smoke o regression.');
process.env.TEST_TARGET='all';
process.env.MOBILE_SUITE=suite;
await import('../mobile/ci.mjs');
