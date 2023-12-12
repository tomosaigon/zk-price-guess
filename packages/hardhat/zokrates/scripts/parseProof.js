const fs = require('fs');

const json = fs.readFileSync('proof.json', 'utf8');
const proof = JSON.parse(json);
console.log(JSON.stringify([proof.proof.a, proof.proof.b, proof.proof.c]).replace('\n', ''));
console.log(JSON.stringify(proof.inputs).replace('\n', ''));

