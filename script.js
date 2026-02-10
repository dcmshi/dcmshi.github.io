// ========================================
// UNDERTALE-INSPIRED PERSONAL WEBSITE - SCRIPT
// ========================================

// Smooth scroll navigation with offset for better positioning
document.addEventListener('DOMContentLoaded', function() {

    // Smooth scroll for all navigation links (menu items and back links)
    const allNavLinks = document.querySelectorAll('.menu-item, .back-link');

    allNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Optional: Add sound effect on menu hover (disabled by default)
    // Uncomment if you want to add audio feedback
    /*
    menuLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            // You can add a click sound here if desired
            // const audio = new Audio('path-to-sound.wav');
            // audio.play();
        });
    });
    */

    // Keyboard navigation support
    document.addEventListener('keydown', function(e) {
        // Press 'S' or Enter on title screen to scroll to About
        if ((e.key === 's' || e.key === 'S' || e.key === 'Enter') && window.scrollY < 100) {
            const aboutSection = document.querySelector('#about');
            if (aboutSection) {
                aboutSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });

    // Optional: Console message for developers who inspect the site
    console.log('%c* You found the console.', 'color: #ff0000; font-family: monospace; font-size: 14px;');
    console.log('%c* Determination.', 'color: #ffff00; font-family: monospace; font-size: 12px;');
    console.log('%cMade with intention. No frameworks harmed.', 'color: #00ffff; font-family: monospace; font-size: 10px;');
});

// ========================================
// ANNOYING DOG - Sprite-based animation
// ========================================

(function() {
    const SPRITE_SRC = 'images/annoying-dog.png';
    const SCALE = 3;
    const FRAME_MS = 250;
    const WALK_SPEED = 1.2;

    // Frame coordinates within the sprite sheet
    const ANIMS = {
        walk:  { y: 182, h: 19, frames: [{x:2, w:22}, {x:25, w:20}] },
        talk:  { y: 162, h: 19, frames: [{x:2, w:20}, {x:23, w:20}] },
        sleep: { y: 241, h: 13, frames: [{x:2, w:27}, {x:30, w:27}] },
        // 7-frame emergence sequence: flat hole → full dog
        hole:  { y: 585, h: 13, frames: [
            {x:2,  w:10}, {x:13, w:12}, {x:26, w:12},
            {x:39, w:13}, {x:53, w:16}, {x:70, w:16}, {x:87, w:16}
        ]},
    };

    let sprite = null;
    let ready = false;
    // Pre-rendered source canvases: prerendered[animName][dir][frameIdx]
    const prerendered = {};

    function prerender() {
        for (const [name, anim] of Object.entries(ANIMS)) {
            prerendered[name] = { right: [], left: [] };
            for (const frame of anim.frames) {
                for (const dir of ['right', 'left']) {
                    const c = document.createElement('canvas');
                    c.width = frame.w;
                    c.height = anim.h;
                    const ctx = c.getContext('2d');
                    if (dir === 'left') {
                        ctx.translate(frame.w, 0);
                        ctx.scale(-1, 1);
                    }
                    ctx.drawImage(sprite, frame.x, anim.y, frame.w, anim.h, 0, 0, frame.w, anim.h);
                    if (dir === 'left') ctx.setTransform(1,0,0,1,0,0);
                    prerendered[name][dir].push(c);
                }
            }
        }
    }

    // ---- Dog entity ----
    function Dog() {
        this.el = document.createElement('div');
        Object.assign(this.el.style, {
            position: 'fixed',
            bottom: '0',
            zIndex: '9999',
            pointerEvents: 'none',
            lineHeight: '0',
        });
        this.canvas = document.createElement('canvas');
        this.canvas.style.imageRendering = 'pixelated';
        this.el.appendChild(this.canvas);
        document.body.appendChild(this.el);
    }

    Dog.prototype.draw = function(animName, dir, fi) {
        const anim = ANIMS[animName];
        const frame = anim.frames[fi];
        const src = prerendered[animName][dir][fi];
        const maxW = Math.max(...anim.frames.map(f => f.w));
        this.canvas.width = maxW * SCALE;
        this.canvas.height = anim.h * SCALE;
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(src, 0, 0, frame.w * SCALE, anim.h * SCALE);
    };

    Dog.prototype.setX      = function(x) { this.el.style.left   = x + 'px'; };
    Dog.prototype.setBottom = function(b) { this.el.style.bottom  = b + 'px'; this.el.style.top = ''; };
    Dog.prototype.setTop    = function(t) { this.el.style.top     = t + 'px'; this.el.style.bottom = ''; };
    Dog.prototype.remove    = function()  { this.el.remove(); };

    // Returns a random y within the top or bottom third of the viewport (px from that edge)
    function randomBand() {
        const inTop = Math.random() > 0.5;
        const offset = Math.floor(Math.random() * (window.innerHeight * 0.28));
        return { inTop, offset };
    }

    // ---- Behaviours ----

    // Simply walks across the screen
    function spawnWalk() {
        const goRight = Math.random() > 0.5;
        const dir = goRight ? 'left' : 'right'; // sprite faces left by default, flip for rightward walk
        const dog = new Dog();
        const maxW = Math.max(...ANIMS.walk.frames.map(f => f.w)) * SCALE;
        let x = goRight ? -maxW : window.innerWidth;
        let fi = 0;
        const { inTop, offset } = randomBand();

        dog.setX(x);
        if (inTop) dog.setTop(offset); else dog.setBottom(offset);
        dog.draw('walk', dir, fi);

        const ft = setInterval(() => {
            fi = (fi + 1) % ANIMS.walk.frames.length;
            dog.draw('walk', dir, fi);
        }, FRAME_MS);

        (function step() {
            x += goRight ? WALK_SPEED : -WALK_SPEED;
            dog.setX(x);
            if (goRight ? x > window.innerWidth : x < -maxW) {
                clearInterval(ft); dog.remove();
            } else {
                requestAnimationFrame(step);
            }
        })();
    }

    // Walks in, pauses to talk, then walks out
    function spawnWalkAndTalk() {
        const goRight = Math.random() > 0.5;
        const dir = goRight ? 'left' : 'right';
        const dog = new Dog();
        const maxW = Math.max(...ANIMS.walk.frames.map(f => f.w)) * SCALE;
        let x = goRight ? -maxW : window.innerWidth;
        let fi = 0;
        let tfi = 0;
        let phase = 'walk_in';
        const stopX = window.innerWidth * (0.3 + Math.random() * 0.4);
        const { inTop, offset } = randomBand();

        dog.setX(x);
        if (inTop) dog.setTop(offset); else dog.setBottom(offset);
        dog.draw('walk', dir, fi);

        let talkTimer = null;
        const walkFt = setInterval(() => {
            if (phase !== 'talk') {
                fi = (fi + 1) % ANIMS.walk.frames.length;
                dog.draw('walk', dir, fi);
            }
        }, FRAME_MS);

        (function step() {
            if (phase === 'walk_in') {
                x += goRight ? WALK_SPEED : -WALK_SPEED;
                dog.setX(x);
                if (goRight ? x >= stopX : x <= stopX) {
                    phase = 'talk';
                    talkTimer = setInterval(() => {
                        tfi = (tfi + 1) % ANIMS.talk.frames.length;
                        dog.draw('talk', dir, tfi);
                    }, FRAME_MS);
                    setTimeout(() => {
                        clearInterval(talkTimer);
                        phase = 'walk_out';
                    }, 2000 + Math.random() * 1500);
                }
            } else if (phase === 'walk_out') {
                x += goRight ? WALK_SPEED : -WALK_SPEED;
                dog.setX(x);
                if (goRight ? x > window.innerWidth : x < -maxW) {
                    clearInterval(walkFt); dog.remove(); return;
                }
            }
            requestAnimationFrame(step);
        })();
    }

    // Walks in, falls asleep for a bit, then walks out
    function spawnWalkAndSleep() {
        const goRight = Math.random() > 0.5;
        const dir = goRight ? 'left' : 'right';
        const dog = new Dog();
        const maxW = Math.max(...ANIMS.walk.frames.map(f => f.w)) * SCALE;
        let x = goRight ? -maxW : window.innerWidth;
        let fi = 0;
        let sfi = 0;
        let phase = 'walk_in';
        const stopX = window.innerWidth * (0.15 + Math.random() * 0.7);
        const { inTop, offset } = randomBand();

        dog.setX(x);
        if (inTop) dog.setTop(offset); else dog.setBottom(offset);
        dog.draw('walk', dir, fi);

        let sleepTimer = null;
        const walkFt = setInterval(() => {
            if (phase !== 'sleep') {
                fi = (fi + 1) % ANIMS.walk.frames.length;
                dog.draw('walk', dir, fi);
            }
        }, FRAME_MS);

        (function step() {
            if (phase === 'walk_in') {
                x += goRight ? WALK_SPEED : -WALK_SPEED;
                dog.setX(x);
                if (goRight ? x >= stopX : x <= stopX) {
                    phase = 'sleep';
                    dog.draw('sleep', dir, 0);
                    sleepTimer = setInterval(() => {
                        sfi = (sfi + 1) % ANIMS.sleep.frames.length;
                        dog.draw('sleep', dir, sfi);
                    }, FRAME_MS * 3);
                    setTimeout(() => {
                        clearInterval(sleepTimer);
                        phase = 'walk_out';
                    }, 3000 + Math.random() * 2000);
                }
            } else if (phase === 'walk_out') {
                x += goRight ? WALK_SPEED : -WALK_SPEED;
                dog.setX(x);
                if (goRight ? x > window.innerWidth : x < -maxW) {
                    clearInterval(walkFt); dog.remove(); return;
                }
            }
            requestAnimationFrame(step);
        })();
    }

    // Pops up from a hole using the 7-frame emergence sequence, idles, then sinks back in
    function spawnHolePeek() {
        const dog = new Dog();
        const x = window.innerWidth * (0.1 + Math.random() * 0.8);
        const frameCount = ANIMS.hole.frames.length; // 7 frames
        let fi = 0;
        let phase = 'emerging'; // 'emerging', 'idle', 'sinking'

        dog.setX(x);
        dog.draw('hole', 'right', fi);

        const ft = setInterval(() => {
            if (phase === 'emerging') {
                fi++;
                if (fi >= frameCount - 1) {
                    fi = frameCount - 1;
                    phase = 'idle';
                    setTimeout(() => { phase = 'sinking'; }, 2000 + Math.random() * 2000);
                }
                dog.draw('hole', 'right', fi);
            } else if (phase === 'sinking') {
                fi--;
                dog.draw('hole', 'right', fi);
                if (fi <= 0) {
                    clearInterval(ft); dog.remove();
                }
            }
        }, FRAME_MS);
    }

    // walk is weighted higher so it's the most common behaviour
    const BEHAVIOURS = [spawnWalk, spawnWalk, spawnWalkAndTalk, spawnWalkAndSleep, spawnHolePeek];

    function pick() {
        if (!ready) return;
        BEHAVIOURS[Math.floor(Math.random() * BEHAVIOURS.length)]();
    }

    function schedule() {
        setTimeout(() => { pick(); schedule(); }, 8000 + Math.random() * 17000);
    }

    sprite = new Image();
    sprite.onload = function() {
        prerender();
        ready = true;
        setTimeout(pick, 4000 + Math.random() * 4000);
        schedule();
    };
    sprite.src = SPRITE_SRC;
})();

// ========================================
// Optional: Add "typed text" effect for the title screen (currently disabled)
// Uncomment if you want a typing animation effect
/*
function typeText(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

// Usage example:
// const titleElement = document.querySelector('.pixel-title');
// typeText(titleElement, '[Your Name]', 100);
*/
