



How to debug (with vs-code)

Start the debugger listener
node --inspect-brk $(which truffle) test ./file/name.js


VS-code
Attach the debugger process by selecting "Node Attach"

Add the following snippet to your launch.json file:
{
    "type": "node",
    "request": "attach",
    "name": "Attach",
    "port": 9229
}


