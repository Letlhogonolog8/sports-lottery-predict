#!/usr/bin/env node
/**
 * SofaScore Python Wrapper Bridge
 * ===============================
 * 
 * Calls the Python sofascore-wrapper for maximum reliability
 * Then returns data in Node.js format
 * 
 * Usage:
 *   const { fetchWithPython } = require('./sofascore-bridge.js');
 *   const matches = await fetchWithPython();
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Fetch matches using Python sofascore-wrapper
 * 
 * @returns {Promise<Array>} Array of match objects
 */
export async function fetchWithPython() {
  return new Promise((resolve, reject) => {
    const pythonScript = join(__dirname, 'sofascore-bridge.py');
    
    const python = spawn('python3', [pythonScript], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    python.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(stdout);
          resolve(result.matches || []);
        } catch (e) {
          console.error('Failed to parse Python output:', e.message);
          reject(e);
        }
      } else {
        if (stderr.includes('ModuleNotFoundError') || stderr.includes('sofascore-wrapper')) {
          reject(new Error(
            'sofascore-wrapper not installed. Install with: pip install sofascore-wrapper'
          ));
        } else {
          reject(new Error(`Python script error: ${stderr}`));
        }
      }
    });

    python.on('error', (err) => {
      reject(new Error(`Failed to spawn Python process: ${err.message}`));
    });
  });
}

/**
 * Try to fetch with Python, fallback to direct API
 */
export async function fetchWithFallback() {
  try {
    console.log('🐍 Trying Python wrapper (most reliable)...');
    const matches = await fetchWithPython();
    
    if (matches && matches.length > 0) {
      console.log(`✅ Python wrapper returned ${matches.length} matches`);
      return matches;
    }
  } catch (error) {
    console.warn('⚠️ Python wrapper error:', error.message);
    console.log('Falling back to direct API...');
  }

  // Fallback to direct API
  try {
    console.log('📡 Trying direct SofaScore API...');
    const matches = await fetchDirectAPI();
    
    if (matches && matches.length > 0) {
      console.log(`✅ Direct API returned ${matches.length} matches`);
      return matches;
    }
  } catch (error) {
    console.error('❌ Direct API error:', error.message);
  }

  return [];
}

/**
 * Fetch directly from SofaScore API
 */
async function fetchDirectAPI() {
  const sports = ['football', 'basketball', 'tennis', 'volleyball'];
  const allMatches = [];

  for (const sport of sports) {
    try {
      const response = await fetch(
        `https://api.sofascore.com/api/v1/sport/${sport}/events/last`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://www.sofascore.com/',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const events = data.events || [];

        const matches = events.map(event => ({
          match_id: `sofascore_${sport}_${event.id}`,
          sport: sport,
          league: `${event.tournament.category.name} - ${event.tournament.name}`,
          home_team_name: event.homeTeam.name,
          away_team_name: event.awayTeam.name,
          status: event.status.type === 'inprogress' ? 'live' 
                : event.status.type === 'finished' ? 'finished'
                : 'upcoming',
          home_score: (event.status.type === 'finished' || event.status.type === 'inprogress')
            ? event.homeScore.display 
            : null,
          away_score: (event.status.type === 'finished' || event.status.type === 'inprogress')
            ? event.awayScore.display 
            : null,
          start_time: new Date(event.startTimestamp * 1000).toISOString(),
          minute: event.status.type === 'inprogress' 
            ? Math.floor(event.time.currentDisplaySeconds / 60)
            : null,
        }));

        allMatches.push(...matches);
      }
    } catch (error) {
      console.warn(`⚠️ ${sport} error:`, error.message);
    }
  }

  return allMatches;
}

/**
 * CLI Usage
 */
async function main() {
  console.log('🌟 SofaScore Bridge\n');

  const matches = await fetchWithFallback();

  if (matches.length > 0) {
    console.log(`\n📊 Found ${matches.length} matches:\n`);
    matches.slice(0, 5).forEach(match => {
      console.log(`  ${match.home_team_name} vs ${match.away_team_name}`);
      console.log(`  Sport: ${match.sport} | League: ${match.league}`);
      console.log(`  Status: ${match.status}\n`);
    });

    if (matches.length > 5) {
      console.log(`... and ${matches.length - 5} more matches`);
    }
  } else {
    console.log('⚠️ No matches found');
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
