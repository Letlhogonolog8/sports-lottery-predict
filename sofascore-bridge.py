#!/usr/bin/env python3
"""
SofaScore Python Wrapper Bridge
================================

Fetches real sports data using sofascore-wrapper and outputs JSON
for Node.js/JavaScript integration.

Installation:
    pip install sofascore-wrapper

Usage:
    python3 sofascore-bridge.py

Output:
    JSON array of matches
"""

#!/usr/bin/env python
import json
import sys
from datetime import datetime
from typing import List, Dict, Any

# Try to import sofascore
try:
    from sofascore import SofaScoreAPI
except ImportError as e:
    # Try alternative import paths
    try:
        import sofascore_wrapper
        from sofascore_wrapper import SofaScoreAPI
    except ImportError:
        print(
            json.dumps({
                "error": f"sofascore-wrapper not found. Install with: pip install sofascore-wrapper. Details: {str(e)}",
                "install": "pip install sofascore-wrapper",
                "matches": []
            })
        )
        sys.exit(1)


def fetch_sport_matches(api: SofaScoreAPI, sport: str) -> List[Dict[str, Any]]:
    """
    Fetch matches for a specific sport
    
    Args:
        api: SofaScoreAPI instance
        sport: Sport name (football, basketball, tennis, etc.)
    
    Returns:
        List of match dictionaries
    """
    try:
        events = api.get_sport_events(sport)
        matches = []
        
        for event in events:
            try:
                match = {
                    "match_id": f"sofascore_{sport}_{event.id}",
                    "sport": sport,
                    "league": f"{event.tournament.category.name} - {event.tournament.name}",
                    "home_team_name": event.home_team.name,
                    "away_team_name": event.away_team.name,
                    "status": (
                        "live" if event.status == "inprogress"
                        else "finished" if event.status == "finished"
                        else "upcoming"
                    ),
                    "home_score": event.home_score if event.home_score is not None else None,
                    "away_score": event.away_score if event.away_score is not None else None,
                    "start_time": event.start_timestamp.isoformat() if hasattr(event.start_timestamp, 'isoformat') else str(event.start_timestamp),
                    "minute": int(event.minute) if event.minute is not None else None,
                }
                matches.append(match)
            except Exception as e:
                print(f"Warning: Error processing event {event.id}: {e}", file=sys.stderr)
                continue
        
        return matches
    
    except Exception as e:
        print(f"Error fetching {sport}: {e}", file=sys.stderr)
        return []


def main():
    """Main entry point"""
    try:
        api = SofaScoreAPI()
        
        # Fetch multiple sports
        sports = ["football", "basketball", "tennis", "volleyball"]
        all_matches = []
        
        print(f"Fetching from SofaScore...", file=sys.stderr)
        
        for sport in sports:
            matches = fetch_sport_matches(api, sport)
            all_matches.extend(matches)
            print(f"✓ {sport}: {len(matches)} matches", file=sys.stderr)
        
        # Output JSON
        result = {
            "success": True,
            "count": len(all_matches),
            "timestamp": datetime.now().isoformat(),
            "matches": all_matches
        }
        
        print(json.dumps(result, indent=2))
    
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e),
            "matches": []
        }
        print(json.dumps(error_result, indent=2), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
