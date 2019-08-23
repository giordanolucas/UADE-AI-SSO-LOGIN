//const pallette = ['#266c78', '#266c78', '#eae2be', '#c25d6f', '#2c8780'];
const pallette = ['#c4e17f', '#f7fdca', '#fecf71', '#f0776c', '#db9dbe', '#c49cde', '#669ae1', '#62c2e4'];

const square = {
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    size: 50,
    color: 'green',
    alpha: 1,
    startAlpha: 1,
    in: false,
    out: false,
    cb: undefined,

    randomize (zone) {
        const {x, y, w, h} = zone;
        const max = 0.08 * w;
        const min = 0.01 * w;

        this.size = this.randInt(min, max);
        this.x = this.randInt(x, w + x);
        this.dx = 0;
        this.y = this.randInt(y, h + y);
        this.dy = 0;
        this.startAlpha = (this.size - min) / (max - min);
        this.alpha = 0;
        this.color = pallette[this.randInt(0, pallette.length - 1)];
    },

    transitionIn () {
        this.in = true;
        this.out = false;
    },

    transitionOut (cb) {
        this.in = false;
        this.out = true;
        this.cb = cb;
    },

    updateTransitionOut () {
        this.alpha -= 0.01;

        if (this.alpha <= 0) {
            this.alpha = 0;
            this.out = false;

            if (this.cb) this.cb();
            this.transitionIn();
        }
    },

    updateTransitionIn () {
        this.alpha += 0.01;

        if (this.alpha >= this.startAlpha) {
            this.in = false
        }
    },

    parallax (mouse, screenW, screenH) {
        const nx = (mouse.x / screenW) * 2 - 1;
        const ny = (mouse.y / screenH) * 2 - 1;

        this.dx = nx * this.alpha * 0.1 * screenW;
        this.dy = ny * this.alpha * 0.1 * screenH;
    },

    render (ctx) {
        if (this.out) {
            this.updateTransitionOut()
        }

        if (this.in) {
            this.updateTransitionIn()
        }

        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.dx, this.y - this.dy, this.size, this.size);
        ctx.fill();
        ctx.restore();
    },

    randInt (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};

export function startCanvas() {
    const canvas = document.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const spotZone = {x: 0, y: 0, w: 0, h: 0};
    const squareCount = 35;
    const squares = [];

    resize();

    const mouse = {
        x: 0.5 * canvas.width,
        y: 0.5 * canvas.height
    };

    for (var i = 0; i < squareCount; i++) {
        squares[i] = Object.create(square);
        squares[i].randomize(spotZone);
        squares[i].transitionIn();
    }

    window.addEventListener('resize', resize);

    window.addEventListener('mousemove', function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    document.body.addEventListener('click', function () {
        for (var i = 0; i < squareCount; i++) {
            squares[i].transitionOut(function () {
                this.randomize(spotZone)
            })
        }
    });

    window.requestAnimationFrame(animate);

    function resize () {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        spotZone.x = 0.1 * canvas.width;
        spotZone.y = 0.1 * canvas.height;
        spotZone.w = 0.8 * canvas.width;
        spotZone.h = 0.8 * canvas.height;
    }

    function animate () {
        window.requestAnimationFrame(animate);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#474a51';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fill();

        squares.forEach((s) => {
            s.parallax(mouse, canvas.width, canvas.height);
            s.render(ctx);
        })
    }
}
