/**
 * Netlify Function: Dynamic Content API
 * 
 * Fetches content directly from GitHub repository
 * Endpoint: /.netlify/functions/get-content?folder=skills
 * 
 * @param {string} folder - Content folder (skills, projects, blog)
 * @returns {Object} { files: [...], count: number }
 */

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
    // GitHub API to fetch content files
    const githubUrl = `https://api.github.com/repos/whamre/portfolio-cms/contents/content/${folder}`;
    
    const response = await fetch(githubUrl);
    
    if (!response.ok) {
      if (response.status === 404) {
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ files: [], count: 0 })
        };
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const githubFiles = await response.json();
    
    // Filter for JSON files and fetch their content
    const jsonFiles = githubFiles.filter(file => 
      file.name.endsWith('.json') && file.name !== '.gitkeep'
    );
    
    const files = await Promise.all(
      jsonFiles.map(async (file) => {
        try {
          const contentResponse = await fetch(file.download_url);
          const content = await contentResponse.json();
          return {
            filename: file.name,
            ...content
          };
        } catch (e) {
          console.error(`Error reading ${file.name}:`, e);
          return null;
        }
      })
    );

    const validFiles = files.filter(Boolean);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        files: validFiles,
        count: validFiles.length 
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
      body: JSON.stringify({ error: 'Failed to read content from GitHub' })
    };
  }
}; 