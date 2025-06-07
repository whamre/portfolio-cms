const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  const { folder } = event.queryStringParameters || {};
  
  if (!folder) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Folder parameter required' })
    };
  }

  try {
    const contentPath = path.join(process.cwd(), 'content', folder);
    
    // Check if directory exists
    if (!fs.existsSync(contentPath)) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ files: [] })
      };
    }

    // Read directory and filter for JSON files
    const files = fs.readdirSync(contentPath)
      .filter(file => file.endsWith('.json') && file !== 'index.json')
      .map(file => {
        try {
          const filePath = path.join(contentPath, file);
          const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          return {
            filename: file,
            ...content
          };
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        files: files,
        count: files.length 
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Failed to read content' })
    };
  }
}; 