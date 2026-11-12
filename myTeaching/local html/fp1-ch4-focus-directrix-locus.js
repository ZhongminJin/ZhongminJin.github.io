document.addEventListener('DOMContentLoaded', () => {
  const initialiseLocusDemos = () => {
    document.querySelectorAll('[data-fd-locus]:not([data-fd-ready])').forEach(demo => {
      demo.dataset.fdReady = 'yes';
      const svg = demo.querySelector('svg');
      const q = name => svg.querySelector(`[data-fd-${name}]`);
      const slider = demo.querySelector('[data-fd-slider]');
      const readout = demo.querySelector('[data-fd-readout]');
      const playButton = demo.querySelector('[data-fd-play]');
      const resetButton = demo.querySelector('[data-fd-reset]');
      const xMin = -1.65, xMax = 5.35, yMin = -5.15, yMax = 5.15;
      const left = 55, right = 735, top = 28, bottom = 442;
      const X = x => left + (x - xMin) / (xMax - xMin) * (right - left);
      const Y = y => bottom - (y - yMin) / (yMax - yMin) * (bottom - top);
      const setLine = (node, x1, y1, x2, y2) => {
        node.setAttribute('x1', X(x1)); node.setAttribute('y1', Y(y1));
        node.setAttribute('x2', X(x2)); node.setAttribute('y2', Y(y2));
      };
      const setPoint = (node, x, y) => { node.setAttribute('cx', X(x)); node.setAttribute('cy', Y(y)); };
      const setText = (node, x, y) => { node.setAttribute('x', X(x)); node.setAttribute('y', Y(y)); };
      const locusPath = (fromT, toT, steps=150) => {
        const points = [];
        for (let i=0; i<=steps; i++) {
          const t = fromT + (toT-fromT)*i/steps;
          points.push(`${i ? 'L' : 'M'}${X(t*t).toFixed(1)},${Y(2*t).toFixed(1)}`);
        }
        return points.join(' ');
      };

      setLine(q('xaxis'), xMin, 0, xMax, 0);
      setLine(q('yaxis'), 0, yMin, 0, yMax);
      setLine(q('directrix'), -1, yMin, -1, yMax);
      q('full').setAttribute('d', locusPath(-2.2, 2.2));
      setPoint(q('focus'), 1, 0);
      setText(q('focus-label'), 1.08, -.22);
      setText(q('directrix-label'), -1.52, 4.62);
      setText(q('vertex-label'), -.18, -.28);

      let t = Number(slider.value) / 100;
      let playing = false;
      let frame = null;
      let previousTime = 0;
      const render = () => {
        const px = t*t, py = 2*t, dx = -1, dy = py;
        setPoint(q('point'), px, py); setPoint(q('foot'), dx, dy);
        setLine(q('ps'), px, py, 1, 0); setLine(q('pd'), px, py, dx, dy);
        const corner = .14;
        setLine(q('rightangle-a'), dx+corner, dy, dx+corner, dy-corner*Math.sign(t || 1));
        setLine(q('rightangle-b'), dx+corner, dy-corner*Math.sign(t || 1), dx, dy-corner*Math.sign(t || 1));
        q('trail').setAttribute('d', locusPath(-2.2, t, Math.max(2, Math.round((t+2.2)*34))));
        setText(q('point-label'), Math.min(px+.13,4.42), py + (t>1.75 ? -.24 : .34));
        setText(q('foot-label'), -1.28, dy + (t>1.75 ? -.20 : .32));
        setText(q('ps-label'), (px+1)/2+.08, py/2-.16);
        setText(q('pd-label'), (px-1)/2, py-.18);
        const distance = 1+t*t;
        q('ps-label').textContent = `PS = ${distance.toFixed(2)}a`;
        q('pd-label').textContent = `PD = ${distance.toFixed(2)}a`;
        readout.value = `t = ${t.toFixed(2)}`;
        readout.textContent = `t = ${t.toFixed(2)}`;
        slider.value = String(Math.round(t*100));
      };
      const tick = time => {
        if (!playing || !demo.isConnected) return;
        if (!previousTime) previousTime = time;
        const dt = Math.min(40, time-previousTime); previousTime = time;
        t += dt * .00075;
        if (t > 2.2) t = -2.2;
        render();
        frame = requestAnimationFrame(tick);
      };
      const setPlaying = value => {
        playing = value;
        playButton.textContent = playing ? '❚❚ Pause' : '▶ Play';
        previousTime = 0;
        if (playing) frame = requestAnimationFrame(tick);
        else if (frame) cancelAnimationFrame(frame);
      };
      slider.addEventListener('input', () => { setPlaying(false); t = Number(slider.value)/100; render(); });
      playButton.addEventListener('click', () => setPlaying(!playing));
      resetButton.addEventListener('click', () => { setPlaying(false); t = -2.2; render(); });
      render();
    });
  };
  const initialiseComparisonDemos = () => {
    document.querySelectorAll('[data-fd-extension]:not([data-fdc-ready])').forEach(demo => {
      demo.dataset.fdcReady = 'yes';
      const svg = demo.querySelector('svg');
      const q = name => svg.querySelector(`[data-fdc-${name}]`);
      const eSlider = demo.querySelector('[data-fdc-e-slider]');
      const eReadout = demo.querySelector('[data-fdc-e-value]');
      const modeButtons = [...demo.querySelectorAll('[data-fd-mode]')];
      const comparison = demo.querySelector('[data-fdc-comparison]');
      const title = demo.querySelector('[data-fdc-title]');
      const description = demo.querySelector('[data-fdc-description]');
      const boundaryMessage = demo.querySelector('[data-fdc-boundary]');
      const psValue = demo.querySelector('[data-fdc-ps-value]');
      const pdValue = demo.querySelector('[data-fdc-pd-value]');
      const modes = {
        less: {
          factor: .65,
          title: 'Ellipse family: closed locus',
          description: 'For e<1 the locus is closed. As e approaches 1, the far side moves farther away and the curve approaches the parabola boundary.',
          boundary: '<b>Before the boundary:</b> e<1 gives the closed-locus family.',
          colour: '#2876a8'
        },
        equal: {
          factor: 1,
          title: 'Parabola: the boundary case',
          description: 'At exactly e=1, the closed-locus family changes into the open-locus family. The boundary curve is a parabola.',
          boundary: '<b>Boundary reached:</b> e=1 gives the parabola.',
          colour: '#168a86'
        },
        greater: {
          factor: 1.45,
          title: 'Hyperbola family: open locus',
          description: 'For e>1 the locus is open. Moving e farther above 1 changes the opening while the focus and directrix stay fixed.',
          boundary: '<b>Beyond the boundary:</b> e>1 gives the open-locus family.',
          colour: '#c67a18'
        }
      };
      const xMin=-1.35, xMax=5.35, yMin=-5.65, yMax=5.65;
      const left=52, right=735, top=26, bottom=444;
      const X=x => left+(x-xMin)/(xMax-xMin)*(right-left);
      const Y=y => bottom-(y-yMin)/(yMax-yMin)*(bottom-top);
      const setLine=(node,x1,y1,x2,y2) => {
        node.setAttribute('x1',X(x1)); node.setAttribute('y1',Y(y1));
        node.setAttribute('x2',X(x2)); node.setAttribute('y2',Y(y2));
      };
      const setPoint=(node,x,y) => { node.setAttribute('cx',X(x)); node.setAttribute('cy',Y(y)); };
      const setText=(node,x,y) => { node.setAttribute('x',X(x)); node.setAttribute('y',Y(y)); };
      const classify = e => e < .995 ? 'less' : (e > 1.005 ? 'greater' : 'equal');
      const buildPoints = (k, mode) => {
        const start=(1-k)/(1+k);
        const trueEnd=mode==='less' ? (1+k)/(1-k) : (mode==='equal' ? 5 : 3.08);
        const end=mode==='less' ? Math.min(trueEnd,8) : trueEnd;
        const upper=[];
        for(let i=0;i<=220;i++) {
          const x=start+(end-start)*i/220;
          const radicand=Math.max(0,k*k*(x+1)*(x+1)-(x-1)*(x-1));
          upper.push({x,y:Math.sqrt(radicand)});
        }
        const lower=upper.map(p => ({x:p.x,y:-p.y}));
        const points=mode==='less' ? [...upper,...lower.reverse()] : [...lower.reverse(),...upper.slice(1)];
        return {points,start,trueEnd,closed:mode==='less' && trueEnd<=8};
      };
      const toPath = (points, close=false) => points.map((p,i)=>`${i?'L':'M'}${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ')+(close?' Z':'');
      setLine(q('xaxis'),xMin,0,xMax,0); setLine(q('yaxis'),0,yMin,0,yMax);
      setLine(q('directrix'),-1,yMin,-1,yMax); setPoint(q('focus'),1,0);
      setText(q('focus-label'),1.08,-.25); setText(q('directrix-label'),-1.27,5.05);
      const render = () => {
        const e=Number(eSlider.value)/100;
        const activeMode=classify(e);
        const config=modes[activeMode];
        const curve=buildPoints(e,activeMode);
        const points=curve.points;
        const visibleEnd=Math.min(curve.trueEnd,4.45);
        const px=curve.start+(visibleEnd-curve.start)*.68;
        const py=Math.sqrt(Math.max(0,e*e*(px+1)*(px+1)-(px-1)*(px-1)));
        const p={x:px,y:py};
        const d={x:-1,y:p.y};
        const ps=Math.hypot(p.x-1,p.y); const pd=p.x+1;
        q('curve').setAttribute('d',toPath(points,curve.closed));
        q('curve').style.stroke=config.colour;
        setPoint(q('point'),p.x,p.y); setPoint(q('foot'),d.x,d.y);
        setLine(q('ps'),p.x,p.y,1,0); setLine(q('pd'),p.x,p.y,d.x,d.y);
        setText(q('point-label'),Math.min(p.x+.12,4.7),p.y+(p.y>4.6?-.24:.35));
        setText(q('foot-label'),-1.25,p.y+(p.y>4.6?-.2:.32));
        setText(q('ps-label'),(p.x+1)/2+.08,p.y/2-.16);
        setText(q('pd-label'),(p.x-1)/2,p.y-.18);
        q('ps-label').textContent=`PS = ${ps.toFixed(2)}a`;
        q('pd-label').textContent=`PD = ${pd.toFixed(2)}a`;
        const relation=activeMode==='less'?'PS < PD':(activeMode==='greater'?'PS > PD':'PS = PD');
        comparison.textContent=`e = ${e.toFixed(2)} · ${relation}`;
        comparison.style.background=config.colour;
        title.textContent=config.title;
        description.textContent=config.description;
        boundaryMessage.innerHTML=config.boundary;
        boundaryMessage.style.borderColor=config.colour;
        boundaryMessage.style.borderLeftColor=config.colour;
        eReadout.value=`e = ${e.toFixed(2)}`;
        eReadout.textContent=`e = ${e.toFixed(2)}`;
        eReadout.style.background=config.colour;
        psValue.textContent=`PS = ${ps.toFixed(2)}a`;
        pdValue.textContent=`PD = ${pd.toFixed(2)}a`;
        modeButtons.forEach(button => {
          const active=button.dataset.fdMode===activeMode;
          button.classList.toggle('is-active',active);
          button.style.background=active?config.colour:'';
          button.style.borderColor=active?config.colour:'';
        });
      };
      modeButtons.forEach(button => button.addEventListener('click',() => {
        eSlider.value=String(Math.round(modes[button.dataset.fdMode].factor*100));
        render();
      }));
      eSlider.addEventListener('input',render);
      render();
    });
  };
  initialiseLocusDemos();
  initialiseComparisonDemos();
  const slide = document.querySelector('.slide-page');
  if (slide) new MutationObserver(() => requestAnimationFrame(() => { initialiseLocusDemos(); initialiseComparisonDemos(); })).observe(slide, {childList:true, subtree:true});
});
