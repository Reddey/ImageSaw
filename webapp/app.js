"use strict";
const $ = id => document.getElementById(id);
const TIP_DATA = {"width": [["white", "Directly controls the width resolution of the converted image. Higher values perform worse."], ["red", "Try to avoid values higher than 100! Gunsaw will often times crash or run very slow with extremely high values!"]], "height": [["white", "Directly controls the height resolution of the converted image. Higher values perform worse."], ["red", "Try to avoid values higher than 100! Gunsaw will often times crash or run very slow with extremely high values!"]], "size": [["yellow", "Experimental option that controls font size and width. Can be used to make larger images at a lower resolution, trading visual fidelity for performance."], ["red", "Keep in mind this is highly experimental! Changing the size value from it's default WILL distort the image unless manual calibration is done in tandem with Line Height! Only change if you plan to use a different Line Height!"]], "line_height": [["yellow", "Experimental option that controls the spacing between lines. Can be used to in conjunction with Size Multiplier to tweak converted image aspect ratios"], ["red", "Keep in mind this is highly experimental! Changing the line height value from it's default WILL distort the image unless manual calibration is done! Only change if you plan to use a different Size!"]], "palette": [["white", "Will restrict the amount of colors in the image to the entered value."], ["yellow", "Set to 0 for no restrictions"], ["red", "(Warning! This will substantially lower performance)"]], "background": [["white", "As transparency is not supported, when a transparent pixel is found in the image, it will be replaced by the color selected here. Color must be input as a hex color code (Ex. FF0000, FFFFFF, 000000)"]], "edges": [["white", "Enable / Disable Monochrome Edge Detection (MDEC) mode."], ["yellow", "This mode will grayscale images, and use an Edge Detection algorithm to convert the image. No color at all, but the most lightweight and best performing option. Good for use in proper gameplay levels."]], "dot": [["white", "The primary symbol used for the \"Pixels\" in converted images."]], "background_symbol": [["white", "The background symbol used for the opposite \"Pixels\" in MDEC images."], ["yellow", "Only used if Monochrome Edge Detection mode is enabled!"]]};
const DEFAULTS = {width:'60',height:'60',size:'1.5',line_height:'2.0',palette:'16',background:'#000000',dot:'●',background_symbol:'·'};
let pyodide = null;
let imageFile = null;
let previewUrl = null;
let previewTimer = null;
let previewGeneration = 0;
let pythonQueue = Promise.resolve();
function enqueuePython(task) {
  const next = pythonQueue.then(task);
  pythonQueue = next.catch(() => {});
  return next;
}
let converting = false;
let conversionTimer = null;
let conversionGeneration = 0;
let convertedText = null;
let convertedFilename = 'image_dots.txt';
const fields = Object.keys(DEFAULTS);
const setStatus = text => { $('status').textContent = text; };
const format = n => Number(n.toFixed(3)).toString();

function estimate() {
  const width = Number($('width').value), height = Number($('height').value);
  const size = Number($('size').value), lineHeight = Number($('line_height').value);
  const el = $('estimate');
  if (![width,height,size,lineHeight].every(Number.isFinite) || !Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > 512 || height > 512) {
    el.textContent = 'Enter valid dimensions'; return;
  }
  el.textContent = size === 1.5 && lineHeight === 2 && $('dot').value === '●'
    ? `${format(width * .06)} × ${format(height * .06)}` : 'Not calibrated for these settings';
}
function validate() {
  const width = Number($('width').value), height = Number($('height').value);
  const size = Number($('size').value), lineHeight = Number($('line_height').value), palette = Number($('palette').value);
  const bg = $('background').value.trim();
  if (!Number.isInteger(width) || width < 1 || width > 512 || !Number.isInteger(height) || height < 1 || height > 512) throw Error('Width and height must be integers between 1 and 512.');
  if (!Number.isFinite(size) || size <= 0 || !Number.isFinite(lineHeight) || lineHeight <= 0) throw Error('Size and Line Height must be positive finite numbers.');
  if (!Number.isInteger(palette) || palette < 0 || palette > 256) throw Error('Palette must be 0 or a whole number between 1 and 256.');
  if (!/^#[0-9a-fA-F]{6}$/.test(bg)) throw Error('Background must be a 6-digit hex color code, such as #000000.');
  if (!$('dot').value) throw Error('Primary symbol cannot be empty.');
  if ($('edges').checked && !$('background_symbol').value) throw Error('Background symbol cannot be empty in edge mode.');
  return {width,height,size,line_height:lineHeight,palette,background:bg,edges:$('edges').checked,dot:$('dot').value,background_symbol:$('background_symbol').value};
}
function updateButton() { $('convert').disabled = convertedText === null || !imageFile; $('copy').disabled = convertedText === null; }
async function initPython() {
  try {
    if (typeof loadPyodide !== 'function') throw Error('Pyodide was not able to load yo. Check your internet connection.');
    pyodide = await loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/'});
    $('runtime').textContent = "Loading Pillow… Don't fall asleep now!";
    await pyodide.loadPackage('pillow');
    for (const filename of ['imagesawv7.py', 'preview_renderer.py']) {
      const response = await fetch('./' + filename);
      if (!response.ok) throw Error('Could not fetch ' + filename + ' (HTTP ' + response.status + ').');
      pyodide.FS.writeFile('/home/pyodide/' + filename, await response.text(), {encoding:'utf8'});
    }
    pyodide.runPython("import sys; sys.path.insert(0, '/home/pyodide'); import imagesawv7, preview_renderer");
    $('runtime').textContent = 'Python ready'; $('runtime').classList.add('ready');
    setStatus('Ready. Choose an image; text is generated automatically.');
    scheduleDotPreview();
    scheduleConversion();
  } catch (error) {
    console.error(error); $('runtime').textContent = 'Runtime failed'; $('runtime').classList.add('error');
    setStatus('Startup error: ' + error.message);
  } finally { updateButton(); }
}
function downloadText(text, filename) {
  const url = URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));
  const a = document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),10000);
}
function scheduleConversion() {
  const generation = ++conversionGeneration;
  clearTimeout(conversionTimer);
  // Never offer text generated from outdated image/settings.
  convertedText = null;
  $('result').value = '';
  updateButton();
  if (!imageFile) {
    $('output-info').textContent = 'Choose an image to generate its text block automatically.';
    return;
  }
  if (!pyodide) {
    $('output-info').textContent = 'Waiting for Python to load…';
    return;
  }
  let settings;
  try { settings = validate(); }
  catch (error) {
    $('output-info').textContent = 'Settings error: ' + error.message;
    return;
  }
  $('output-info').textContent = 'Preparing conversion…';
  conversionTimer = setTimeout(() => convertAutomatically(generation, settings), 400);
}
async function convertAutomatically(generation, settings) {
  if (!pyodide || !imageFile || generation !== conversionGeneration) return;
  const selectedFile = imageFile;
  converting = true;
  $('output-info').textContent = 'Generating sign text…';
  setStatus('Converting image with backend converter…');
  await new Promise(resolve => setTimeout(resolve, 20));
  try {
    const bytes = new Uint8Array(await selectedFile.arrayBuffer());
    if (generation !== conversionGeneration) return;
    const result = await enqueuePython(async () => {
      if (generation !== conversionGeneration) return null;
      pyodide.FS.writeFile('/tmp/imagesaw_input', bytes);
      pyodide.globals.set('imagesaw_settings_json', JSON.stringify(settings));
      await pyodide.runPythonAsync(`
import json
import imagesawv7
s = json.loads(imagesaw_settings_json)
imagesawv7.DOT = s['dot']
imagesawv7.WDOT = s['background_symbol']
imagesawv7.image_to_dot_block(
    input_path='/tmp/imagesaw_input', output_path='/tmp/imagesaw_output.txt',
    width=s['width'], height=s['height'], size=s['size'],
    line_height=s['line_height'], background=s['background'],
    palette=s['palette'], edges=s['edges'])
`);
      return pyodide.FS.readFile('/tmp/imagesaw_output.txt', {encoding:'utf8'});
    });
    if (result === null || generation !== conversionGeneration) return;
    convertedText = result;
    convertedFilename = (selectedFile.name.replace(/\.[^.]+$/,'') || 'image') + '_dots.txt';
    $('result').value = result;
    $('output-info').textContent = `${settings.width} × ${settings.height} "Pixels" · ${result.length.toLocaleString()} characters`;
    setStatus('Conversion complete. Text block ready.');
  } catch (error) {
    console.error(error);
    if (generation === conversionGeneration) {
      $('output-info').textContent = 'Conversion failed: ' + error.message;
      setStatus('Conversion failed: ' + error.message);
    }
  } finally {
    converting = false;
    updateButton();
  }
}
function setupTooltips() {
  const tooltip=$('tooltip'); let timer=null, active=null;
  const hide=()=>{clearTimeout(timer);timer=null;active=null;tooltip.hidden=true;};
  const position=(x,y)=>{
    const pad=12; let left=x+16,top=y+20;
    if(left+tooltip.offsetWidth>innerWidth-pad)left=Math.max(pad,innerWidth-tooltip.offsetWidth-pad);
    if(top+tooltip.offsetHeight>innerHeight-pad)top=Math.max(pad,y-tooltip.offsetHeight-12);
    tooltip.style.left=left+'px';tooltip.style.top=top+'px';
  };
  document.querySelectorAll('[data-tip]').forEach(field=>{
    field.addEventListener('pointerenter',e=>{
      if(e.pointerType==='touch')return;
      hide(); active=field;
      const x=e.clientX,y=e.clientY;
      timer=setTimeout(()=>{
        if(active!==field)return;
        tooltip.replaceChildren();
        for(const [color,message] of TIP_DATA[field.dataset.tip]||[]){const p=document.createElement('p');p.className=color;p.textContent=message;tooltip.appendChild(p);}
        tooltip.hidden=false;position(x,y);
      },500);
    });
    field.addEventListener('pointerleave',hide);
    field.addEventListener('pointerdown',hide);
  });
  window.addEventListener('scroll',hide,true);
}
function previewSettings() {
  const width = Number($('width').value), height = Number($('height').value);
  const palette = Number($('palette').value), background = $('background').value.trim();
  if (!Number.isInteger(width) || width < 1 || width > 512 ||
      !Number.isInteger(height) || height < 1 || height > 512 ||
      !Number.isInteger(palette) || palette < 0 || palette > 256 ||
      !/^#[0-9a-fA-F]{6}$/.test(background)) return null;
  return {width, height, palette, background, edges: $('edges').checked};
}
function scheduleDotPreview() {
  const generation = ++previewGeneration;
  clearTimeout(previewTimer);
  if (!imageFile) {
    $('preview').hidden = true;
    $('empty-preview').hidden = false;
    $('preview-info').textContent = '"Pixel" preview';
    return;
  }
  $('preview-info').textContent = 'Preparing "Pixel" preview…';
  previewTimer = setTimeout(() => renderDotPreview(generation), 240);
}
async function renderDotPreview(generation) {
  if (!pyodide || !imageFile || generation !== previewGeneration) return;
  const settings = previewSettings();
  if (!settings) {
    $('preview-info').textContent = 'Enter valid width, height, palette and background settings';
    return;
  }
  const selectedFile = imageFile;
  try {
    const bytes = new Uint8Array(await selectedFile.arrayBuffer());
    if (generation !== previewGeneration) return;
    const png = await enqueuePython(async () => {
      if (generation !== previewGeneration) return null;
      pyodide.FS.writeFile('/tmp/imagesaw_preview_input', bytes);
      pyodide.globals.set('imagesaw_preview_settings_json', JSON.stringify(settings));
      await pyodide.runPythonAsync(`
import json
import preview_renderer
s = json.loads(imagesaw_preview_settings_json)
preview_bytes = preview_renderer.render_preview(
    '/tmp/imagesaw_preview_input', width=s['width'], height=s['height'],
    background=s['background'], palette=s['palette'], edges=s['edges'])
with open('/tmp/imagesaw_preview.png', 'wb') as f:
    f.write(preview_bytes)
`);
      return pyodide.FS.readFile('/tmp/imagesaw_preview.png');
    });
    if (!png || generation !== previewGeneration) return;
    const newUrl = URL.createObjectURL(new Blob([png], {type:'image/png'}));
    const oldUrl = previewUrl;
    previewUrl = newUrl;
    $('preview').src = newUrl;
    $('preview').hidden = false;
    $('empty-preview').hidden = true;
    $('preview-info').textContent = `"Pixel" preview · ${settings.width} × ${settings.height} · ${settings.edges ? 'MDEC' : settings.palette === 0 ? 'unlimited colors' : settings.palette + ' colors'}`;
    if (oldUrl) URL.revokeObjectURL(oldUrl);
  } catch (error) {
    console.error('Preview failed:', error);
    if (generation === previewGeneration) $('preview-info').textContent = 'Preview failed: ' + error.message;
  }
}
$('image').addEventListener('change', event => {
  imageFile = event.target.files?.[0] || null;
  scheduleConversion();
  $('file-name').textContent = imageFile ? imageFile.name : 'No image selected';
  if (!imageFile) {
    $('preview').removeAttribute('src');
    if (previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = null; }
  }
  scheduleDotPreview();
  updateButton();
});
$('color-picker').addEventListener('input',e=>{$('background').value=e.target.value;scheduleDotPreview();scheduleConversion();});
$('background').addEventListener('input',e=>{if(/^#[0-9a-fA-F]{6}$/.test(e.target.value))$('color-picker').value=e.target.value;scheduleDotPreview();scheduleConversion();});
for(const id of ['width','height','size','line_height','dot']) $(id).addEventListener('input',()=>{estimate();scheduleConversion();});
for(const id of ['width','height','palette']) $(id).addEventListener('input',scheduleDotPreview);
for(const id of ['palette','background_symbol']) $(id).addEventListener('input',scheduleConversion);
$('edges').addEventListener('change',()=>{scheduleDotPreview();scheduleConversion();});
$('reset').addEventListener('click',()=>{
  for(const [id,value] of Object.entries(DEFAULTS))$(id).value=value;
  $('color-picker').value=DEFAULTS.background;$('edges').checked=false;estimate();scheduleDotPreview();scheduleConversion();setStatus('Settings reset to defaults.');
});
$('convert').addEventListener('click',()=>{if(convertedText !== null) { downloadText(convertedText,convertedFilename);setStatus('Text block downloaded.'); }});
$('copy').addEventListener('click',async()=>{
  if (convertedText === null) return;
  try{await navigator.clipboard.writeText($('result').value);setStatus('Copied sign text to clipboard.');}
  catch(e){$('result').focus();$('result').select();setStatus('Clipboard permission denied. Select and copy the text manually.');}
});
setupTooltips();estimate();initPython();
