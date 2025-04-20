const SwaggerParser = require('@apidevtools/swagger-parser');

async function validateOpenAPI() {
  try {
    // Validate the OpenAPI document
    const api = await SwaggerParser.validate('./openapi.yaml');
    console.log('API is valid!');
    console.log(`API name: ${api.info.title}, Version: ${api.info.version}`);
    console.log(`Paths: ${Object.keys(api.paths).length}`);
    console.log(`Schemas: ${Object.keys(api.components?.schemas || {}).length}`);
  } catch (err) {
    console.error('API validation failed:');
    console.error(err.message);
    if (err.details) {
      console.error('Details:', JSON.stringify(err.details, null, 2));
    }
    process.exit(1);
  }
}

validateOpenAPI(); 