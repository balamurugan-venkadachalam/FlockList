const fs = require('fs');
const yaml = require('js-yaml');

try {
  const content = fs.readFileSync('./openapi.yaml', 'utf8');
  const doc = yaml.load(content);
  console.log('YAML is valid!');
  console.log(`Document has ${Object.keys(doc).length} top-level keys`);
} catch (e) {
  console.error('Error parsing YAML:');
  console.error(e.message);
  process.exit(1);
} 