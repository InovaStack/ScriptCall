import { supabase } from './supabaseClient.js';

// ELEMENTOS - ÁREA PRINCIPAL
const editor = document.getElementById("editor");
const saveBtn = document.getElementById("saveBtn");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");
const mainView = document.getElementById("mainView");
const mainAside = document.getElementById("mainAside");

// ELEMENTOS - ÁREA HOME
const homeEditor = document.getElementById("homeEditor");
const saveHomeBtn = document.getElementById("saveHomeBtn");
const copyHomeBtn = document.getElementById("copyHomeBtn");
const clearHomeBtn = document.getElementById("clearHomeBtn");
const homeView = document.getElementById("homeView");
const homeAside = document.getElementById("homeAside");

// NAVEGAÇÃO
const homeBtn = document.getElementById("homeBtn");
const backToMainBtn = document.getElementById("backToMainBtn");

const STORAGE_KEY = "blocoDeNotasLucasPedro_v2";
const STORAGE_HOME_KEY = "blocoDeNotasLucasPedro_home";
let currentScriptId = null;
let currentWorkspace = 'main'; // 'main' ou 'home'

// Alternar para Home
homeBtn.addEventListener("click", () => {
    mainView.classList.add("hidden");
    homeView.classList.remove("hidden");
    currentWorkspace = 'home';
    currentScriptId = null;
    loadCustomScripts();
});

// Alternar para Principal
backToMainBtn.addEventListener("click", () => {
    homeView.classList.add("hidden");
    mainView.classList.remove("hidden");
    currentWorkspace = 'main';
    currentScriptId = null;
    loadCustomScripts();
});

// Inserir texto no editor ativo
function insertText(text, scriptId = null) {
    const activeEditor = currentWorkspace === 'main' ? editor : homeEditor;
    const activeSaveBtn = currentWorkspace === 'main' ? saveBtn : saveHomeBtn;
    const activeClearBtn = currentWorkspace === 'main' ? clearBtn : clearHomeBtn;
    const key = currentWorkspace === 'main' ? STORAGE_KEY : STORAGE_HOME_KEY;

    activeEditor.value = text;
    localStorage.setItem(key, text);
    currentScriptId = scriptId;

    if (currentScriptId) {
        activeSaveBtn.innerText = "💾 Atualizar";
        activeSaveBtn.style.backgroundColor = "#e67e22";
        activeClearBtn.innerText = "🗑️ Excluir Script";
    } else {
        activeSaveBtn.innerText = "💾 Salvar";
        activeSaveBtn.style.backgroundColor = "";
        activeClearBtn.innerText = "🗑️ Excluir";
    }
}

// Botões de Salvar (Unificado)
async function handleSave() {
    const activeEditor = currentWorkspace === 'main' ? editor : homeEditor;
    const key = currentWorkspace === 'main' ? STORAGE_KEY : STORAGE_HOME_KEY;

    localStorage.setItem(key, activeEditor.value);

    if (currentScriptId) {
        const { error } = await supabase
            .from('scripts')
            .update({ content: activeEditor.value })
            .eq('id', currentScriptId);

        if (error) alert("Erro ao atualizar: " + error.message);
        else {
            alert("💾 Script atualizado no banco de dados com sucesso!");
            loadCustomScripts();
        }
    } else {
        alert("💾 Rascunho salvo no navegador!");
    }
}

saveBtn.addEventListener("click", handleSave);
saveHomeBtn.addEventListener("click", handleSave);

// Botões de Copiar
async function handleCopy() {
    const activeEditor = currentWorkspace === 'main' ? editor : homeEditor;
    const activeBtn = currentWorkspace === 'main' ? copyBtn : copyHomeBtn;
    try {
        await navigator.clipboard.writeText(activeEditor.value);
        const originalText = activeBtn.innerHTML;
        activeBtn.innerHTML = "✅ Copiado!";
        setTimeout(() => (activeBtn.innerHTML = originalText), 1400);
    } catch (e) { alert("Erro ao copiar."); }
}

copyBtn.addEventListener("click", handleCopy);
copyHomeBtn.addEventListener("click", handleCopy);

// Botões de Excluir
async function handleDelete() {
    if (currentScriptId) {
        if (confirm("⚠️ Excluir este script permanentemente?")) {
            const { error } = await supabase.from('scripts').delete().eq('id', currentScriptId);
            if (error) alert("Erro ao excluir: " + error.message);
            else {
                alert("Script excluído!");
                const activeEditor = currentWorkspace === 'main' ? editor : homeEditor;
                activeEditor.value = "";
                currentScriptId = null;
                loadCustomScripts();
            }
        }
    } else {
        if (confirm("Limpar editor?")) {
            const activeEditor = currentWorkspace === 'main' ? editor : homeEditor;
            activeEditor.value = "";
            currentScriptId = null;
        }
    }
}

clearBtn.addEventListener("click", handleDelete);
clearHomeBtn.addEventListener("click", handleDelete);

// Gerenciar Scripts Laterais
function createScriptButton(title, text, id, container) {
    const btn = document.createElement("button");
    btn.className = "script-btn custom-script-btn";
    btn.textContent = title;
    btn.addEventListener("click", () => insertText(text, id));
    container.appendChild(btn);
}

async function loadCustomScripts() {
    // Limpa apenas os botões customizados dos asides
    document.querySelectorAll('.custom-script-btn').forEach(el => el.remove());

    const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .order('created_at', { ascending: true })
        .order('id', { ascending: true });

    if (error) return;

    const mainContainer = document.getElementById("mainAside");
    const homeContainer = document.getElementById("homeAside");

    let mainIndex = 1;
    let homeIndex = 1;

    data.forEach(script => {
        const isHome = script.title.startsWith("[HOME]");

        if (currentWorkspace === 'main' && !isHome) {
            let cleanTitle = script.title.replace(/^\d+°\s*/, '');
            createScriptButton(`${mainIndex}° ${cleanTitle}`, script.content, script.id, mainContainer);
            mainIndex++;
        } else if (currentWorkspace === 'home' && isHome) {
            let cleanTitle = script.title.replace("[HOME]", "").trim();
            createScriptButton(`${homeIndex}° ${cleanTitle}`, script.content, script.id, homeContainer);
            homeIndex++;
        }
    });
}

// NOVO SCRIPT (POPUP)
const popupOverlay = document.getElementById("popupOverlay");
const saveNewScriptBtn = document.getElementById("saveNewScriptBtn");
const newScriptTitleInput = document.getElementById("newScriptTitle");
const newScriptTextInput = document.getElementById("newScriptText");

const openPopup = () => { popupOverlay.style.display = "block"; };
document.getElementById("newBtn").addEventListener("click", openPopup);
document.getElementById("newHomeBtn").addEventListener("click", openPopup);

document.getElementById("closePopupBtn").addEventListener("click", () => {
    popupOverlay.style.display = "none";
});

saveNewScriptBtn.addEventListener("click", async () => {
    let title = newScriptTitleInput.value.trim();
    const text = newScriptTextInput.value.trim();

    if (!title || !text) { alert("Preencha tudo!"); return; }

    // Adiciona prefixo se estiver na aba Home
    if (currentWorkspace === 'home') {
        title = "[HOME] " + title;
    }

    const { error } = await supabase.from('scripts').insert([{ title, content: text }]);

    if (error) alert("Erro: " + error.message);
    else {
        popupOverlay.style.display = "none";
        newScriptTitleInput.value = ""; newScriptTextInput.value = "";
        loadCustomScripts();
    }
});

/* --- POPUP DO SINO (APENAS NA MAIN) --- */
const dailyBtn = document.getElementById("dailyBtn");
const dailyPopup = document.getElementById("dailyPopup");
const dailyMessage = document.getElementById("dailyMessage");
let currentDailyMessage = "";

async function loadDailyMessage() {
    const { data } = await supabase.from('daily_messages').select('content').order('created_at', { ascending: false }).limit(1).single();
    if (data) {
        currentDailyMessage = data.content;
        dailyMessage.value = data.content;
        if (data.content.trim()) dailyBtn.classList.add("has-remember");
    }
}

dailyBtn.addEventListener("click", () => dailyPopup.classList.remove("hidden"));
document.getElementById("closeDailyPopup").addEventListener("click", () => dailyPopup.classList.add("hidden"));
document.getElementById("saveDailyMsg").addEventListener("click", async () => {
    const text = dailyMessage.value.trim();
    await supabase.from('daily_messages').insert([{ content: text }]);
    currentDailyMessage = text;
    dailyPopup.classList.add("hidden");
    if (text) dailyBtn.classList.add("has-remember");
    else dailyBtn.classList.remove("has-remember");
});

// INICIALIZAÇÃO
window.addEventListener("load", () => {
    loadCustomScripts();
    loadDailyMessage();
});

// SOM DE ALERTA
const bellSound = new Audio("/alerta.mp3");
setInterval(() => {
    if (currentDailyMessage.trim()) bellSound.play().catch(() => { });
}, 900000);
