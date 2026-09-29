/* ============================================================
   CRM · Cibele Matozo Fotografia — UI: janela flutuante, toast, overlay, helpers
   Carregado como <script> clássico (escopo global compartilhado).
   NÃO usar import/export: os handlers onclick inline e o estado
   global dependem deste escopo. Ordem de carga definida em crm.html.
   ============================================================ */

/* ============ FLOATING WINDOW (Task 2.1) ============ */
let currentFloatingWindow = null;

class FloatingWindow {
  constructor(id, options = {}) {
    this.id = id;
    this.element = null;
    this.header = null;
    this.content = null;
    this.isDragging = false;
    this.isResizing = false;
    this.startX = 0;
    this.startY = 0;
    this.startLeft = 0;
    this.startTop = 0;
    this.startWidth = 0;
    this.startHeight = 0;
    this.options = {
      minWidth: 400,
      minHeight: 300,
      maxZIndex: 100,
      saveName: null,
      ...options
    };
    this.zIndex = 20;
  }

  create(title, htmlContent) {
    const overlay = document.createElement('div');
    overlay.className = 'floating-window-overlay';
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    this.element = document.createElement('div');
    this.element.className = 'floating-window';
    this.element.id = this.id;

    this.header = document.createElement('div');
    this.header.className = 'floating-window-header';
    this.header.innerHTML = `<span>${title}</span><button class="close-btn">×</button>`;
    this.header.querySelector('.close-btn').addEventListener('click', () => this.close());

    this.content = document.createElement('div');
    this.content.className = 'floating-window-content';
    this.content.innerHTML = htmlContent;

    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'floating-window-resize';

    this.element.appendChild(this.header);
    this.element.appendChild(this.content);
    this.element.appendChild(resizeHandle);

    document.getElementById('overlayRoot').appendChild(overlay);
    document.getElementById('overlayRoot').appendChild(this.element);

    this.setupDragAndResize();
    this.restorePosition();
    this.makeActive();
    currentFloatingWindow = this;

    return this;
  }

  setupDragAndResize() {
    this.header.addEventListener('mousedown', (e) => this.startDrag(e));
    this.element.querySelector('.floating-window-resize').addEventListener('mousedown', (e) => this.startResize(e));
  }

  startDrag(e) {
    if (e.button !== 0) return;
    this.isDragging = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startLeft = this.element.offsetLeft;
    this.startTop = this.element.offsetTop;
    document.addEventListener('mousemove', this.dragHandler = (e) => this.drag(e));
    document.addEventListener('mouseup', this.dragEndHandler = () => this.endDrag());
    e.preventDefault();
  }

  drag(e) {
    if (!this.isDragging) return;
    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;
    let newLeft = this.startLeft + dx;
    let newTop = this.startTop + dy;

    const maxLeft = window.innerWidth - this.element.offsetWidth;
    const maxTop = window.innerHeight - this.element.offsetHeight;

    newLeft = Math.max(0, Math.min(newLeft, maxLeft));
    newTop = Math.max(0, Math.min(newTop, maxTop));

    this.element.style.left = newLeft + 'px';
    this.element.style.top = newTop + 'px';
  }

  endDrag() {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.dragHandler);
    document.removeEventListener('mouseup', this.dragEndHandler);
    this.savePosition();
  }

  startResize(e) {
    if (e.button !== 0) return;
    this.isResizing = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startWidth = this.element.offsetWidth;
    this.startHeight = this.element.offsetHeight;
    document.addEventListener('mousemove', this.resizeHandler = (e) => this.resize(e));
    document.addEventListener('mouseup', this.resizeEndHandler = () => this.endResize());
    e.preventDefault();
  }

  resize(e) {
    if (!this.isResizing) return;
    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;
    let newWidth = Math.max(this.options.minWidth, this.startWidth + dx);
    let newHeight = Math.max(this.options.minHeight, this.startHeight + dy);

    this.element.style.width = newWidth + 'px';
    this.element.style.height = newHeight + 'px';
  }

  endResize() {
    this.isResizing = false;
    document.removeEventListener('mousemove', this.resizeHandler);
    document.removeEventListener('mouseup', this.resizeEndHandler);
    this.savePosition();
  }

  makeActive() {
    this.zIndex = Math.min(this.options.maxZIndex, Math.max(...document.querySelectorAll('.floating-window').map(el => parseInt(getComputedStyle(el).zIndex) || 0)) + 1);
    this.element.style.zIndex = this.zIndex;
  }

  savePosition() {
    if (!this.options.saveName) return;
    const pos = {
      left: this.element.offsetLeft,
      top: this.element.offsetTop,
      width: this.element.offsetWidth,
      height: this.element.offsetHeight
    };
    localStorage.setItem(`floatingWindow_${this.options.saveName}`, JSON.stringify(pos));
  }

  restorePosition() {
    if (!this.options.saveName) {
      this.center();
      return;
    }
    const saved = localStorage.getItem(`floatingWindow_${this.options.saveName}`);
    if (saved) {
      try {
        const pos = JSON.parse(saved);
        this.element.style.left = Math.max(0, pos.left) + 'px';
        this.element.style.top = Math.max(0, pos.top) + 'px';
        this.element.style.width = pos.width + 'px';
        this.element.style.height = pos.height + 'px';
      } catch (e) {
        this.center();
      }
    } else {
      this.center();
    }
  }

  center() {
    const w = Math.min(600, window.innerWidth - 40);
    const h = Math.min(500, window.innerHeight - 80);
    this.element.style.width = w + 'px';
    this.element.style.height = h + 'px';
    this.element.style.left = (window.innerWidth - w) / 2 + 'px';
    this.element.style.top = (window.innerHeight - h) / 2 + 'px';
  }

  close() {
    if (this.element) {
      this.element.parentElement.remove();
      this.element.remove();
    }
    const overlay = document.querySelector('.floating-window-overlay');
    if (overlay) overlay.remove();
    currentFloatingWindow = null;
  }
}

function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function formatBRL(n){ return (Number(n)||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }
function maskWhatsapp(v){
  v = v.replace(/\D/g,'').slice(0,11);
  if (v.length>10) v = v.replace(/(\d{2})(\d{5})(\d{0,4})/,'($1) $2-$3');
  else v = v.replace(/(\d{2})(\d{4})(\d{0,4})/,'($1) $2-$3');
  return v;
}
function maskData(v){
  v = v.replace(/\D/g,'').slice(0,8);
  v = v.replace(/(\d{2})(\d)/,'$1/$2').replace(/(\d{2})\/(\d{2})(\d)/,'$1/$2/$3');
  return v;
}
function maskHora(v){
  v = v.replace(/\D/g,'').slice(0,4);
  v = v.replace(/(\d{2})(\d{1,2})/,'$1:$2');
  return v;
}
function aplicarMascara(id, fn){
  const input = document.getElementById(id);
  if (!input) return;
  input.addEventListener('input', () => { input.value = fn(input.value); });
}
function opcoesSelect(lista, valorAtual){
  const itens = (lista || []).slice();
  if (valorAtual && !itens.includes(valorAtual)) itens.push(valorAtual);
  return `<option value="">— Selecione —</option>` + itens.map(v =>
    `<option value="${esc(v)}" ${valorAtual===v?'selected':''}>${esc(v)}</option>`
  ).join('');
}

function yyyymmdd(){ const d = new Date(); return String(d.getFullYear()) + String(d.getMonth()+1).padStart(2,'0') + String(d.getDate()).padStart(2,'0'); }

function showToast(msg){
  const root = document.getElementById('toastRoot');
  root.innerHTML = `<div class="toast">${esc(msg)}</div>`;
  setTimeout(() => { root.innerHTML=''; }, 2600);
}
function fecharOverlay(){ document.getElementById('overlayRoot').innerHTML = ''; }
async function excluirComConfirmacao(mensagem, action, dados, btnId, erroId){
  if (!confirm(mensagem)) return;
  const btn = document.getElementById(btnId);
  if (btn){ btn.disabled = true; btn.textContent = 'Excluindo…'; }
  try{
    await apiCall(action, dados);
    loaded = false; fecharOverlay(); await renderMain(); showToast('Excluído.');
  } catch(err){
    mostrarErro(erroId, err.message);
    if (btn){ btn.disabled = false; btn.textContent = 'Excluir'; }
  }
}
function mostrarErro(id, msg){ const e = document.getElementById(id); e.style.display='block'; e.textContent = msg; }
 
