class Sprite {
    x: number;
    y: number;
    speed: number;
    image: HTMLImageElement;
    dest_x: number | undefined;
    dest_y: number | undefined;
    update: () => void;
    onclick: (x: number, y: number) => void;
  
    constructor(
      x: number,
      y: number,
      image_url: string,
      update_method: () => void,
      onclick_method: (x: number, y: number) => void
    ) {
      this.x = x;
      this.y = y;
      this.speed = 4;
      this.image = new Image();
      this.image.src = image_url;
      this.update = update_method;
      this.onclick = onclick_method;
    }
  
    set_destination(x: number, y: number) {
      this.dest_x = x;
      this.dest_y = y;
    }
  
    move(dx: number, dy: number) {
      this.dest_x = this.x + dx;
      this.dest_y = this.y + dy;
    }
  
    go_toward_destination() {
      if (this.dest_x === undefined || this.dest_y === undefined) return;
  
      if (this.x < this.dest_x)
        this.x += Math.min(this.dest_x - this.x, this.speed);
      else if (this.x > this.dest_x)
        this.x -= Math.min(this.x - this.dest_x, this.speed);
      if (this.y < this.dest_y)
        this.y += Math.min(this.dest_y - this.y, this.speed);
      else if (this.y > this.dest_y)
        this.y -= Math.min(this.y - this.dest_y, this.speed);
    }

  }
  
  class Model {
    sprites: Sprite[];
    turtle: Sprite;
  
    constructor() {
      this.sprites = [];
      this.sprites.push(
        new Sprite(200, 100, "lettuce.png", Sprite.prototype.sit_still, Sprite.prototype.ignore_click)
      );
      this.turtle = new Sprite(50, 50, "blue_robot.png", Sprite.prototype.go_toward_destination, Sprite.prototype.set_destination);
      this.sprites.push(this.turtle);
      playerSpriteMap[g_id] = this.turtle;
    }
  
    update() {
      for (const sprite of this.sprites) {
        sprite.update();
      }
    }
  
    onclick(x: number, y: number) {
      for (const sprite of this.sprites) {
        sprite.onclick(x, y);
      }
    }
  
    move(dx: number, dy: number) {
      this.turtle.move(dx, dy);
    }
  }
  
  class View {
    model: Model;
    canvas: HTMLCanvasElement;
    turtle: HTMLImageElement;
  
    constructor(model: Model) {
      this.model = model;
      this.canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
      this.turtle = new Image();
      this.turtle.src = "turtle.png";
    }
  
    update() {
      const ctx = this.canvas.getContext("2d");
  
      if (ctx === null) {
        // Handle the case where ctx is null
        return;
      }
  
      ctx.clearRect(0, 0, 1000, 500);
      for (const sprite of this.model.sprites) {
        ctx.drawImage(
          sprite.image,
          sprite.x - sprite.image.width / 2,
          sprite.y - sprite.image.height
        );
      }
    }
  }
  
  let playerSpriteMap: { [id: string]: Sprite } = {};

  class Controller {
    model: Model;
    view: View;
    key_right: boolean;
    key_left: boolean;
    key_up: boolean;
    key_down: boolean;
    last_updates_request_time: number;

  
    constructor(model: Model, view: View) {
      this.model = model;
      this.view = view;
      this.key_right = false;
      this.key_left = false;
      this.key_up = false;
      this.key_down = false;
      const self = this;
      this.last_updates_request_time = 0;

      view.canvas.addEventListener("click", function (event) {
        self.onClick(event);
      });
      document.addEventListener('keydown', function (event) {
        self.keyDown(event);
      }, false);
      document.addEventListener('keyup', function (event) {
        self.keyUp(event);
      }, false);

    }

    onAcknowledgeClick(ob: any) 
    {
      console.log(`Response to move: ${JSON.stringify(ob)}`);
    }

    onClick(event: MouseEvent) {
      const x = event.pageX - this.view.canvas.offsetLeft;
      const y = event.pageY - this.view.canvas.offsetTop;
      this.model.onclick(x, y);

      fetch(`${g_origin}/ajax.html`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: g_id,
          action: 'move',
          x: x,
          y: y,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Server returned status ${response.status}: ${response.statusText}`);
          }
          return response.json();
        })
        .then((ob) => this.onAcknowledgeClick(ob))
        .catch((error) => {
          console.error('Error in onClick:', error);
        });
      
    }
  
    keyDown(event: KeyboardEvent) {
      if (event.keyCode == 39) this.key_right = true;
      else if (event.keyCode == 37) this.key_left = true;
      else if (event.keyCode == 38) this.key_up = true;
      else if (event.keyCode == 40) this.key_down = true;
      else if (event.keyCode === 32) this.dropBomb(); // Space bar
    }
  
    keyUp(event: KeyboardEvent) {
      if (event.keyCode == 39) this.key_right = false;
      else if (event.keyCode == 37) this.key_left = false;
      else if (event.keyCode == 38) this.key_up = false;
      else if (event.keyCode == 40) this.key_down = false;
    }
    
    onAcknowledgeUpdate(ob: any) 
    {
      console.log(`ob = ${JSON.stringify(ob)}`);

      for (let i = 0; i < ob.updates.length; i++)
      {
        let update = ob.updates[i];
        let id = update[0];
        let x = update[1];
        let y = update[2];

        // find sprite with id id
        // if there is not one, make one
        // sprite.setDestination(x, y);
        let sprite = this.findOrCreateSprite(id);

        sprite.set_destination(x, y)


      }
      
    }
    
    // Add a method to find or create a sprite by ID
    findOrCreateSprite(id: string): Sprite 
    {

      // Search for the sprite in the model's sprites array
      if (playerSpriteMap[id]) 
      {
        return playerSpriteMap[id];
      }

      // If the sprite doesn't exist, create a new one
      const newSprite = new Sprite(50, 50, 'green_robot.png', Sprite.prototype.go_toward_destination, Sprite.prototype.ignore_click);
      playerSpriteMap[id] = newSprite; // Map the player ID to the new sprite
      this.model.sprites.push(newSprite);
      return newSprite;
    }

    async dropBomb() {

      // Get the current location of the robot
      const robotX = this.model.turtle.x;
      const robotY = this.model.turtle.y;

      const bomb = new Sprite(robotX, robotY, 'bomb.png', Sprite.prototype.sit_still, Sprite.prototype.ignore_click);
      this.model.sprites.push(bomb);
  
  
      // Wait for 3000 milliseconds
      await sleep(3000);

      // Find the index of the bomb in the sprites array and remove it
      const index = this.model.sprites.indexOf(bomb);
      if (index !== -1) {
        this.model.sprites.splice(index, 1);
      }
  
      // Change the bomb image to an explosion
      const explosion = new Sprite(robotX, robotY + 100, 'explosion.png', Sprite.prototype.sit_still, Sprite.prototype.ignore_click);
      this.model.sprites.push(explosion);
      //bomb.set_image('explosion.png');
  
      // Wait for another 300 milliseconds
      await sleep(300);
  
      // Find the index of the explosion in the sprites array and remove it
      const index2 = this.model.sprites.indexOf(explosion);
      if (index2 !== -1) {
        this.model.sprites.splice(index2, 1);
      }
    }
    
    async request_updates() {
      try {
        const response = await fetch(`${g_origin}/ajax.html`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: g_id,
            action: 'update',
          }),
        });
  
        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}: ${response.statusText}`);
        }
  
        const ob = await response.json();
        this.onAcknowledgeUpdate(ob);
      } catch (error) {
        console.error('Error in request_updates:', error);
      }
    }
     
    update() {
      let dx = 0;
      let dy = 0;
      const speed = this.model.turtle.speed;
      if (this.key_right) dx += speed;
      if (this.key_left) dx -= speed;
      if (this.key_up) dy -= speed;
      if (this.key_down) dy += speed;
      if (dx != 0 || dy != 0)
        this.model.move(dx, dy);
      
      const time = Date.now();
      if (time - this.last_updates_request_time >= 1000) {
        this.last_updates_request_time = time;
        this.request_updates();
      }
      
    }
  }

  // Helper function to sleep for a specified amount of time
  const sleep = async (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };
  
  class Game {
    model: Model;
    view: View;
    controller: Controller;
  
    constructor() {
      this.model = new Model();
      this.view = new View(this.model);
      this.controller = new Controller(this.model, this.view);
    }
  
    onTimer() {
      this.controller.update();
      this.model.update();
      this.view.update();
    }
  }

  const random_id = (len:number) => {
    let p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return [...Array(len)].reduce(a => a + p[Math.floor(Math.random() * p.length)], '');
  }
  
  const g_origin = new URL(window.location.href).origin;
  const g_id = random_id(12);

  const game = new Game();
  const timer = setInterval(() => { game.onTimer(); }, 40);
  

  
