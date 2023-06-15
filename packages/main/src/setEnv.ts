// `import.meta.env` provided by Vite. Set to `process.env.NODE_ENV` since that
// is what we would rather check against and we expect it to be there.
process.env.NODE_ENV = import.meta.env.MODE;
console.log(`process.env.NODE_ENV:${process.env.NODE_ENV}`);
