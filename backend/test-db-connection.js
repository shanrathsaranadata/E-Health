const dns = require('dns');
const mongoose = require('mongoose');
require('dotenv').config();

console.log("--- DEBUG START ---");

// 1. Check Internet
console.log("1. Checking Internet Connectivity (resolving google.com)...");
dns.resolve('google.com', (err) => {
    if (err) {
        console.error("FAIL: Could not resolve google.com. Check your internet connection.", err.code);
        process.exit(1);
    }
    console.log("PASS: Internet seems reachable.");

    // 2. Check MongoDB Host
    const connectionString = process.env.MONGODB_URL;
    if (!connectionString) {
        console.error("FAIL: MONGODB_URL is not defined in .env");
        process.exit(1);
    }

    const match = connectionString.match(/@([^/]+)/);
    if (!match) {
        console.error("FAIL: Could not parse hostname from connection string");
        process.exit(1);
    }
    const hostname = match[1];
    console.log(`2. Checking MongoDB Host: ${hostname}`);
    console.log(`   Detailed: resolving SRV for _mongodb._tcp.${hostname}`);

    dns.resolveSrv(`_mongodb._tcp.${hostname}`, (err, addresses) => {
        if (err) {
            console.error("FAIL: DNS SRV Lookup Failed for MongoDB.", err.code);
            console.log("\nPossible causes:");
            console.log(" - The Cluster address is incorrect in .env");
            console.log(" - The Cluster is paused/deleted in MongoDB Atlas");
            console.log(" - Network firewall is blocking DNS SRV lookups");
            process.exit(1);
        } else {
            console.log("PASS: DNS Resolution successful:", addresses);

            // 3. Attempt Connection
            console.log("3. Attempting Mongoose Connection...");
            mongoose.connect(connectionString, { serverSelectionTimeoutMS: 5000 })
                .then(() => {
                    console.log("SUCCESS: Mongoose Connected!");
                    process.exit(0);
                })
                .catch(err => {
                    console.error("FAIL: Mongoose Connection Failed:", err.message);
                    process.exit(1);
                });
        }
    });
});
