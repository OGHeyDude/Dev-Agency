#!/usr/bin/env node
/**
 * Example usage of the TypeScript parser
 */

const { TypeScriptParser } = require('./ts_parser.js');
const fs = require('fs');

// Create a simple test file
const testContent = `
import React from 'react';

interface Props {
  name: string;
}

const HelloComponent: React.FC<Props> = ({ name }) => {
  return <div>Hello, {name}!</div>;
};

export default HelloComponent;
`;

fs.writeFileSync('/tmp/example.tsx', testContent);

// Parse the file
const parser = new TypeScriptParser();
const result = parser.parseFile('/tmp/example.tsx');

console.log('Parser Results:');
console.log('==============');
console.log(JSON.stringify(result, null, 2));

// Clean up
fs.unlinkSync('/tmp/example.tsx');