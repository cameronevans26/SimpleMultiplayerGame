# SimpleMultiplayerGame

A simple browser game that runs off of your own computer. It allows the user to move a robot around a screen. Copy and paste the link in a new tab to enable multiplayer. The blue robot is the character you control, and the green ones are other players. Since this was a learning experience, there really isn't an objective, just have fun!

---

## How to Run

1. Download all the files onto your machine.  
2. **Windows:** Run `run.bat` to start the game in your browser.  
3. **Linux:** Run `run.bash` to start the game in your browser.

---

## Python Dependencies

This project uses some standard libraries that come with Python by default:
- `typing`
- `os`
- `http.server`
- `webbrowser`
- `urllib.parse`
- `json`
- `datetime`
- `time`
- `signal`
- `traceback`
- `threading`
- `atexit`

The following third-party libraries **need to be installed**:

- `http_daemon`
- `requests`

You can install them using pip:

```bash
pip install http_daemon requests
