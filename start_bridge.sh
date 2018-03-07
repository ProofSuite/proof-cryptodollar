#! /bin/bash
cd ./ethereum-bridge/
npm install
node bridge -H localhost:8545 -a 1 --dev
