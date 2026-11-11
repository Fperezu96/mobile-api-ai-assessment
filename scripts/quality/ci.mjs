const suite=process.argv[2] || 'regression';
if(!['smoke','regression','catalog','exploratory'].includes(suite))throw new Error('Elegir smoke, regression, catalog o exploratory.');
process.env.TEST_TARGET='all';
process.env.MOBILE_SUITE=suite;
await import('../mobile/ci.mjs');
