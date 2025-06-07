/**
 * Netlify Function: Dynamic Content API
 * 
 * Provides REST API for fetching CMS content dynamically
 * Endpoint: /.netlify/functions/get-content?folder=skills
 * 
 * @param {string} folder - Content folder (skills, projects, blog)
 * @returns {Object} { files: [...], count: number }
 */

const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  const { folder } = event.queryStringParameters || {};
  
  if (!folder) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Folder parameter required' })
    };
  }

  try {
    const contentPath = path.join(process.cwd(), 'content', folder);
    
    // Return empty array if directory doesn't exist
    if (!fs.existsSync(contentPath)) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ files: [], count: 0 })
      };
    }

    // Read all JSON files and parse content
    const files = fs.readdirSync(contentPath)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        try {
          const filePath = path.join(contentPath, file);
          const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          return {
            filename: file,
            ...content
          };
        } catch (e) {
          console.error(`Error reading ${file}:`, e);
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
        files,
        count: files.length 
      })
    };

  } catch (error) {
    console.error('Content API Error:', error);
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