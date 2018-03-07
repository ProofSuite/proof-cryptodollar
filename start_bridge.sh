#! /bin/bash
cd $TRAVIS_BUILD_DIR/ethereum-bridge/
npm install
node bridge -H localhost:8545 -a 1 --dev --update-ds
