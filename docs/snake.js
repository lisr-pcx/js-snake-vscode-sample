// Project: js-snake-vscode-sample
// lisr-pcx
// 2024-10-01
// Simple clone of classic snake game in vanilla Javascript

const CELL_SIZE = 20
const BOARD_N_CELL_SIDE = 20
const SNAKE_MAX_LENGTH = 10

const COLOR_BACKGROUND  = "rgb(0, 0, 0)"
const COLOR_SNAKE       = "rgb(0, 255, 0)"
const COLOR_MOUSE       = "rgb(0, 0, 255)"

class Cell
{
    x = 0;
    y = 0;
    color = COLOR_BACKGROUND;

    constructor(x, y, color)
    {
        this.x = x;
        this.y = y;
        this.color = color;
    }
}

class Snake
{
    // snake body is composed by multiple points
    #snake = [];
    // mouse body is just a single point
    #mouse;
    // draw only element added on this queue  
    #items_to_draw = [];
    // snake is moving on this direction
    #dir = "ArrowRight";

    // "GUI"
    canvas;

    constructor()
    {
        this.canvas = document.getElementById('GameCanvas');
        // canvas size
        this.canvas.style.width = CELL_SIZE * BOARD_N_CELL_SIDE + 'px';
        this.canvas.style.height = CELL_SIZE * BOARD_N_CELL_SIDE + 'px';
        // image buffer size
        this.canvas.width = CELL_SIZE * BOARD_N_CELL_SIDE;
        this.canvas.height = CELL_SIZE * BOARD_N_CELL_SIDE;
        // manage user input
        document.addEventListener("keydown", (event) => 
            {
                switch (event.key)
                {
                    case "ArrowUp":
                        if (this.#dir != "ArrowDown")
                        {
                            this.#dir = event.key;
                        }
                        break;
                    case "ArrowRight":
                        if (this.#dir != "ArrowLeft")
                            {
                                this.#dir = event.key;
                            }
                        break;
                    case "ArrowDown":
                        if (this.#dir != "ArrowUp")
                            {
                                this.#dir = event.key;
                            }
                        break;
                    case "ArrowLeft":
                        if (this.#dir != "ArrowRight")
                            {
                                this.#dir = event.key;
                            }
                        break;
                    default:
                        // nothing
                } 
            });

        // snake body is treated as a queue
        let snake_head = new Cell(
            BOARD_N_CELL_SIDE/2, 
            BOARD_N_CELL_SIDE/2, 
            COLOR_SNAKE);
        this.#snake.push(snake_head);
        let mouse_body = new Cell(
            BOARD_N_CELL_SIDE - 2, 
            BOARD_N_CELL_SIDE - 2, 
            COLOR_MOUSE);
        this.#mouse = mouse_body;
             
        this.#items_to_draw.push(snake_head);
        this.#items_to_draw.push(mouse_body);

        // update screen
        this.#draw();
    }

    run()
    {
        // new snake head
        let snake_next_head = new Cell(
            this.#snake[this.#snake.length - 1].x,
            this.#snake[this.#snake.length - 1].y, 
            COLOR_SNAKE);
        switch (this.#dir)
        {
            case "ArrowUp":
                snake_next_head.y = this.#makePointCircular(snake_next_head.y - 1);                
                break;
            case "ArrowRight":
                snake_next_head.x = this.#makePointCircular(snake_next_head.x + 1);
                break;
            case "ArrowDown":
                snake_next_head.y = this.#makePointCircular(snake_next_head.y + 1);
                break;
            case "ArrowLeft":
                snake_next_head.x = this.#makePointCircular(snake_next_head.x - 1);
                break;
            default:
                console.log("ERR: wrong direction");
        }

        // check collision
        if (this.#checkCollision(snake_next_head.x, snake_next_head.y) == true)
        {
            // game over!
            const ctx = this.canvas.getContext("2d");
            ctx.fillStyle = "red";
            ctx.font = "24px monospace";
            ctx.fillText("GAME OVER", 50, 50);
            return -1;
        }

        this.#snake.push(snake_next_head);
        this.#items_to_draw.push(snake_next_head);

        // eat the mouse
        if ((snake_next_head.x === this.#mouse.x) && 
            (snake_next_head.y === this.#mouse.y))
        {
            // new mouse
            do
            {
                this.#mouse.x = Math.floor(Math.random() * BOARD_N_CELL_SIDE);
                this.#mouse.y = Math.floor(Math.random() * BOARD_N_CELL_SIDE);
            }
            while (this.#checkCollision(this.#mouse.x, this.#mouse.y) == true)
            this.#items_to_draw.push(this.#mouse, COLOR_MOUSE);
        }
        else
        {
            // move tail
            let snake_tail = new Cell(
                this.#snake[0].x,
                this.#snake[0].y,
                COLOR_BACKGROUND
            );
            this.#snake.shift();
            this.#items_to_draw.push(snake_tail);
        }

        // check win
        if (this.#snake.length > SNAKE_MAX_LENGTH)
        {
            // win!
            const ctx = this.canvas.getContext("2d");
            ctx.fillStyle = "yellow";
            ctx.font = "24px monospace";
            ctx.fillText("You WIN!", 50, 50);
            return 1;
        }

        // update screen
        this.#draw();

        return 0;
    }

    #makePointCircular(position)
    {
        if (position >= BOARD_N_CELL_SIDE)
        {
            position = 0;
        }
        else if (position < 0)
        {
            position = BOARD_N_CELL_SIDE - 1;
        }
        return position;
    }

    #checkCollision(px, py)
    {
        let collide = false;
        for (const elem of this.#snake)
        {
            if ((elem.x === px) && 
                (elem.y === py))
            {
                collide = true;
                break;
            }
        }
        return collide;
    }

    #draw()
    {
        const ctx = this.canvas.getContext("2d");
        for (const elem of this.#items_to_draw)
        {
            ctx.fillStyle = elem.color;
            ctx.fillRect(
                elem.x * CELL_SIZE,
                elem.y * CELL_SIZE,
                CELL_SIZE,
                CELL_SIZE);
        }
        this.#items_to_draw = [];        
    }
}

window.focus();
let game = new Snake();

// game loop
// (return -1:game over, 1:win)
loopId = setInterval(GameLoop, 200);
function GameLoop()
{
    let gameStatus = game.run();
    if ((gameStatus == -1) || 
        (gameStatus == 1))
    {
        clearInterval(loopId);
    }
}