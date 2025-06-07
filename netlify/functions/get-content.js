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
    // Try multiple possible paths for Netlify environment
    let contentPath;
    const possiblePaths = [
      path.join(process.cwd(), 'content', folder),           // Original
      path.join(__dirname, '../../content', folder),        // Relative to function
      path.join('/opt/build/repo/content', folder),         // Netlify build path
      path.join(process.env.LAMBDA_TASK_ROOT || '', 'content', folder), // Lambda root
    ];
    
    // Find the first path that exists
    contentPath = possiblePaths.find(p => fs.existsSync(p));
    
    if (!contentPath) {
      console.log('Tried paths:', possiblePaths);
      console.log('Working directory:', process.cwd());
      console.log('__dirname:', __dirname);
      console.log('Environment:', process.env.NETLIFY ? 'Netlify' : 'Local');
    }
    
    // Return empty array if directory doesn't exist or path not found
    if (!contentPath || !fs.existsSync(contentPath)) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          files: [], 
          count: 0,
          debug: contentPath ? `Path ${contentPath} not found` : 'No valid path found'
        })
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