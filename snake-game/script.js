(function(){
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  let cell = 20, speed = 8, timer = null, running = false;
  const scoreBlueEl = document.getElementById('scoreBlue');
  const scoreGreenEl = document.getElementById('scoreGreen');

  let cols = Math.floor(canvas.width/cell);
  let rows = Math.floor(canvas.height/cell);

  let blueSnake = [], greenSnake = [];
  let dirBlue = {x:1,y:0}, nextDirBlue = {x:1,y:0};
  let dirGreen = {x:-1,y:0}, nextDirGreen = {x:-1,y:0};
  let food = null;

  function reset(){
    cols = Math.floor(canvas.width/cell);
    rows = Math.floor(canvas.height/cell);
    blueSnake = []; greenSnake = [];
    const bx = Math.floor(cols/4), by = Math.floor(rows/2);
    for(let i=0;i<4;i++) blueSnake.push({x:bx-i,y:by});
    const gx = Math.floor(3*cols/4), gy = Math.floor(rows/2);
    for(let i=0;i<4;i++) greenSnake.push({x:gx+i,y:gy});
    dirBlue = {x:1,y:0}; nextDirBlue={x:1,y:0};
    dirGreen={x:-1,y:0}; nextDirGreen={x:-1,y:0};
    placeFood();
    scoreBlueEl.textContent='0';
    scoreGreenEl.textContent='0';
    running=false; clearInterval(timer);
  }

  function placeFood(){
    while(true){
      const fx=Math.floor(Math.random()*cols);
      const fy=Math.floor(Math.random()*rows);
      let collide=false;
      for(const s of blueSnake) if(s.x===fx && s.y===fy) collide=true;
      for(const s of greenSnake) if(s.x===fx && s.y===fy) collide=true;
      if(!collide){ food={x:fx,y:fy}; break; }
    }
  }

  function drawRoundRect(x,y,w,h,r,color){
    ctx.fillStyle=color;
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    ctx.closePath();
    ctx.fill();
  }

  function draw(){
    ctx.fillStyle='#06121a';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.strokeStyle='rgba(255,255,255,0.02)'; ctx.lineWidth=1;
    for(let i=0;i<=cols;i++){ctx.beginPath();ctx.moveTo(i*cell,0);ctx.lineTo(i*cell,rows*cell);ctx.stroke();}
    for(let j=0;j<=rows;j++){ctx.beginPath();ctx.moveTo(0,j*cell);ctx.lineTo(cols*cell,j*cell);ctx.stroke();}

    if(food) drawRoundRect(food.x*cell+2, food.y*cell+2, cell-4, cell-4, 6, '#ff4d4d');

    for(let i=0;i<blueSnake.length;i++){
      const s=blueSnake[i];
      drawRoundRect(s.x*cell+1,s.y*cell+1,cell-2,cell-2,6,'#4a90e2');
    }
    for(let i=0;i<greenSnake.length;i++){
      const s=greenSnake[i];
      drawRoundRect(s.x*cell+1,s.y*cell+1,cell-2,cell-2,6,'#4ee44e');
    }
  }

  function step(){
    if(!(nextDirBlue.x===-dirBlue.x && nextDirBlue.y===-dirBlue.y)) dirBlue=nextDirBlue;
    if(!(nextDirGreen.x===-dirGreen.x && nextDirGreen.y===-dirGreen.y)) dirGreen=nextDirGreen;

    const headBlue={x:blueSnake[0].x+dirBlue.x, y:blueSnake[0].y+dirBlue.y};
    const headGreen={x:greenSnake[0].x+dirGreen.x, y:greenSnake[0].y+dirGreen.y};

    if(headBlue.x<0||headBlue.x>=cols||headBlue.y<0||headBlue.y>=rows) gameOver('蓝蛇');
    if(headGreen.x<0||headGreen.x>=cols||headGreen.y<0||headGreen.y>=rows) gameOver('绿蛇');

    for(const s of blueSnake) if(s.x===headBlue.x && s.y===headBlue.y) gameOver('蓝蛇');
    for(const s of greenSnake) if(s.x===headGreen.x && s.y===headGreen.y) gameOver('绿蛇');

    blueSnake.unshift(headBlue); greenSnake.unshift(headGreen);

    if(food && headBlue.x===food.x && headBlue.y===food.y){
      scoreBlueEl.textContent=String(blueSnake.length-4);
      placeFood();
    } else { blueSnake.pop(); }

    if(food && headGreen.x===food.x && headGreen.y===food.y){
      scoreGreenEl.textContent=String(greenSnake.length-4);
      placeFood();
    } else { greenSnake.pop(); }

    draw();
  }

  function gameOver(winner){
    running=false; clearInterval(timer);
    ctx.fillStyle='rgba(0,0,0,0.45)';
    ctx.fillRect(0,0,cols*cell,rows*cell);
    ctx.fillStyle='#fff'; ctx.font='20px sans-serif'; ctx.textAlign='center';
    ctx.fillText(winner+' 胜利！', cols*cell/2, rows*cell/2);
  }

  window.addEventListener('keydown',function(e){
    const k=e.key;
    // 蓝蛇 WASD
    if(k==='w'||k==='W') nextDirBlue={x:0,y:-1};
    else if(k==='s'||k==='S') nextDirBlue={x:0,y:1};
    else if(k==='a'||k==='A') nextDirBlue={x:-1,y:0};
    else if(k==='d'||k==='D') nextDirBlue={x:1,y:0};
    // 绿蛇 方向键
    else if(k==='ArrowUp') nextDirGreen={x:0,y:-1};
    else if(k==='ArrowDown') nextDirGreen={x:0,y:1};
    else if(k==='ArrowLeft') nextDirGreen={x:-1,y:0};
    else if(k==='ArrowRight') nextDirGreen={x:1,y:0};
    // 暂停
    else if(k===' ') togglePause();
    // 隐藏功能
    else if(k==='Alt') gameOver('绿蛇');
    else if(k==='/') gameOver('蓝蛇');
  });

  function start(){
    if(running) return;
    running=true;
    clearInterval(timer);
    timer=setInterval(step,1000/speed);
  }

  function togglePause(){
    if(!running){ start(); } else { running=false; clearInterval(timer); }
  }

  document.getElementById('startBtn').addEventListener('click',start);
  document.getElementById('pauseBtn').addEventListener('click',togglePause);
  document.getElementById('resetBtn').addEventListener('click',reset);

  reset(); draw();
})();
