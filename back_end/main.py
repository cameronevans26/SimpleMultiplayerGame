from typing import Mapping, Any, List, Dict, Tuple
import os
from http_daemon import delay_open_url, serve_pages

class Player():
    def __init__(self, id:str) -> None:
        self.id = id
        self.x = 0
        self.y = 0
        self.what_I_know = 0

players: Dict[str, Player] = {}
history: List[Player] = []

def find_player(player_id: str) -> Player:
    if player_id in players:
        return players[player_id]
    else:
        new_player = Player(player_id)
        players[player_id] = new_player
        return new_player

def update(params: Mapping[str, Any]) -> Mapping[str, Any]:
    action = params['action']
    if action == 'move':
        player = find_player(params['id'])
        player.x = params['x']
        player.y = params['y']
        history.append(player)
    elif action == 'update':
        player = find_player(params['id'])
        remaining_history = history[player.what_I_know:]
        player.what_I_know = len(history)
        updates: List[Tuple[str, int, int]] = []
        for i in range(len(remaining_history)):
            player = remaining_history[i]
            updates.append( (player.id, player.x, player.y) )
        return {
            'updates': updates
        }

    print(f'make_ajax_page was called with {params}')
    return {
        'message': 'Thanks'
    }

def main() -> None:
    # Get set up
    os.chdir(os.path.join(os.path.dirname(__file__), '../front_end'))

    # Serve pages
    port = 8987
    delay_open_url(f'http://localhost:{port}/game.html', .1)
    serve_pages(port, {
        'ajax.html': update,
    })

if __name__ == "__main__":
    main()
